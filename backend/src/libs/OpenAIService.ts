import axios from 'axios';
import { RecipeGenerationRequest, RecipeResponse, OpenAIResponse } from '../types/types';
import { getAPIKey } from './SecretsManager';

export class OpenAIService {
  private apiKey: string | null = null;
  private baseURL = 'https://api.openai.com/v1/chat/completions'; // OpenAI API endpoint

  constructor() {
    // Initialize will be called when first needed
  }

  /**
   * Initialize the service by fetching the API key
   */
  private async initialize(): Promise<void> {
    if (!this.apiKey) {
      try {
        this.apiKey = await getAPIKey('OPENAI_API_KEY');
      } catch (error) {
        console.error('Failed to initialize OpenAIService:', error);
        throw new Error('Failed to retrieve OpenAI API key from Secrets Manager');
      }
    }
  }

  async generateRecipe(request: RecipeGenerationRequest): Promise<RecipeResponse> {
    try {
      // Ensure service is initialized
      await this.initialize();

      return await this.generateRecipeFromOpenAI(request);
    } catch (error) {
      console.error('OpenAI API error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (error.response?.status === 401) {
          throw new Error('Invalid API key');
        }
        if (error.response?.status === 400) {
          throw new Error('Invalid request to OpenAI API');
        }
      }
      
      throw new Error('Failed to generate recipe. Please try again.');
    }
  }

  private async generateRecipeFromOpenAI(request: RecipeGenerationRequest): Promise<RecipeResponse> {
    // Ensure service is initialized
    await this.initialize();
    
    const prompt = this.buildPrompt(request);
    
    const response = await axios.post<OpenAIResponse>(
      this.baseURL,
      {
        model: 'gpt-3.5-turbo', 
        messages: [
          {
            role: 'system', 
            content: 'You are KitchenWise, a recipe generator. Generate recipes based on user constraints and pantry items. You MUST return valid JSON in this EXACT format: {"title": "Recipe Name", "description": "Recipe description"}. Do NOT include any other fields, nested structures, or additional properties. Example: {"title": "Quick Pasta", "description": "A simple pasta dish using available ingredients."}'
          },
          {
            role: 'user',
            content: prompt 
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500, //limit the response length
        temperature: 0.7 //balanced creativity and accuracy
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 //timeout after 30 seconds
      }
    );

    const content = response.data.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    try {
      const parsed = JSON.parse(content);
      
      // Check for the expected structure first
      if (parsed.title && parsed.description) {
        return {
          title: parsed.title.trim(),
          description: parsed.description.trim()
        };
      }
      
      // Handle case where OpenAI sends nested structure
      if (parsed.recipe && parsed.recipe.name && parsed.recipe.instructions) {
        console.log('Found nested recipe structure, converting to expected format');
        return {
          title: parsed.recipe.name.trim(),
          description: parsed.recipe.instructions.trim()
        };
      }
      
      // Log what we actually received for debugging
      console.error('Unexpected JSON structure from OpenAI:', parsed);
      console.error('Expected: { title: string, description: string }');
      console.error('Received:', Object.keys(parsed));
      
      throw new Error(`Invalid JSON structure from OpenAI. Expected 'title' and 'description' fields, but received: ${Object.keys(parsed).join(', ')}`);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError, 'Content:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }
  }

  private buildPrompt(request: RecipeGenerationRequest): string {
    const pantryList = request.pantryItems
      .map(item => `• ${item.title} (${item.count})`)
      .join('\n');

    return `Here are my pantry items:
${pantryList}

Constraint: ${request.constraint}

Using only these ingredients, generate a single popular (not too niche) recipe that fits the given constraint.`;
  }
} 