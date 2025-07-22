import axios from 'axios';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface RecipeGenerationRequest {
  constraint: string;
  pantryItems: Array<{
    title: string;
    count: number;
  }>;
}

export class OpenAIService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  async generateRecipe(request: RecipeGenerationRequest): Promise<{ title: string; description: string }> {
    try {
      const prompt = this.buildPrompt(request);
      
      const response = await axios.post<OpenAIResponse>(
        this.baseURL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are KitchenWise, a recipe generator. Follow only the user\'s constraint and pantry list.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      return this.parseRecipeResponse(content);
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

  private buildPrompt(request: RecipeGenerationRequest): string {
    const pantryList = request.pantryItems
      .map(item => `• ${item.title} (${item.count})`)
      .join('\n');

    return `Here are my pantry items:
${pantryList}

Constraint: ${request.constraint}

Using only these ingredients, generate a single popular (not too niche) recipe that fits the given constraint. Return your answer exactly in this format:

Title: <Recipe Name>

Description: <A brief paragraph (1–2 sentences) describing the dish—no step-by-step instructions>`;
  }

  private parseRecipeResponse(content: string): { title: string; description: string } {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let title = '';
    let description = '';

    for (const line of lines) {
      if (line.startsWith('Title:')) {
        title = line.replace('Title:', '').trim();
      } else if (line.startsWith('Description:')) {
        description = line.replace('Description:', '').trim();
      }
    }

    if (!title || !description) {
      throw new Error('Invalid recipe format received from OpenAI');
    }

    return { title, description };
  }
} 