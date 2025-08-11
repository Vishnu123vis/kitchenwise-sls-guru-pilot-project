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

interface RecipeResponse {
  title: string;
  description: string;
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

  async generateRecipe(request: RecipeGenerationRequest): Promise<RecipeResponse> {
    try {
      const prompt = this.buildPrompt(request);
      
      // Try structured output first (most reliable)
      try {
        return await this.generateRecipeWithStructuredOutput(request);
      } catch (structuredError) {
        console.log('Structured output failed, falling back to text parsing:', structuredError);
        return await this.generateRecipeWithTextParsing(request);
      }
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

  private async generateRecipeWithStructuredOutput(request: RecipeGenerationRequest): Promise<RecipeResponse> {
    const prompt = this.buildPrompt(request);
    
    const response = await axios.post<OpenAIResponse>(
      this.baseURL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are KitchenWise, a recipe generator. Generate recipes based on user constraints and pantry items. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const content = response.data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    try {
      const parsed = JSON.parse(content);
      if (parsed.title && parsed.description) {
        return {
          title: parsed.title.trim(),
          description: parsed.description.trim()
        };
      }
      throw new Error('Invalid JSON structure from OpenAI');
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError, 'Content:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }
  }

  private async generateRecipeWithTextParsing(request: RecipeGenerationRequest): Promise<RecipeResponse> {
    const prompt = this.buildPrompt(request);
    
    const response = await axios.post<OpenAIResponse>(
      this.baseURL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are KitchenWise, a recipe generator. Follow only the user\'s constraint and pantry list. Return your answer exactly in this format:\n\nTitle: <Recipe Name>\nDescription: <A brief paragraph describing the dish>'
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
        timeout: 30000
      }
    );

    const content = response.data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    console.log('OpenAI response content:', content);
    return this.parseRecipeResponseFlexible(content);
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

  private parseRecipeResponseFlexible(content: string): RecipeResponse {
    console.log('Parsing recipe response:', content);
    
    // Clean up the content
    const cleanContent = content
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();
    
    console.log('Cleaned content:', cleanContent);
    
    // Try multiple patterns for title
    const titlePatterns = [
      /title:\s*(.+?)(?:\n|$)/i,
      /recipe:\s*(.+?)(?:\n|$)/i,
      /name:\s*(.+?)(?:\n|$)/i,
      /^(.+?)(?:\n|$)/i  // First line as fallback
    ];
    
    // Try multiple patterns for description
    const descriptionPatterns = [
      /description:\s*(.+?)(?:\n|$)/i,
      /desc:\s*(.+?)(?:\n|$)/i,
      /summary:\s*(.+?)(?:\n|$)/i,
      /instructions:\s*(.+?)(?:\n|$)/i
    ];
    
    let title = '';
    let description = '';
    
    // Extract title
    for (const pattern of titlePatterns) {
      const match = cleanContent.match(pattern);
      if (match && match[1]) {
        title = match[1].trim();
        if (title && !title.toLowerCase().includes('description') && !title.toLowerCase().includes('ingredients')) {
          break;
        }
      }
    }
    
    // Extract description - look for content after title
    const lines = cleanContent.split('\n');
    let foundTitle = false;
    let descriptionLines: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!foundTitle && titlePatterns.some(pattern => pattern.test(line))) {
        foundTitle = true;
        continue;
      }
      
      if (foundTitle && trimmedLine && !titlePatterns.some(pattern => pattern.test(line))) {
        descriptionLines.push(trimmedLine);
      }
    }
    
    // If we found description lines, use them
    if (descriptionLines.length > 0) {
      description = descriptionLines.join(' ').trim();
    } else {
      // Fallback: try to find description using patterns
      for (const pattern of descriptionPatterns) {
        const match = cleanContent.match(pattern);
        if (match && match[1]) {
          description = match[1].trim();
          break;
        }
      }
    }
    
    // If still no description, use remaining content after title
    if (!description && title) {
      const titleIndex = cleanContent.toLowerCase().indexOf(title.toLowerCase());
      if (titleIndex !== -1) {
        const remainingContent = cleanContent.substring(titleIndex + title.length);
        description = remainingContent.replace(/^[\s\n:]+/, '').trim();
      }
    }
    
    console.log('Parsed result:', { title, description });
    
    if (!title || !description) {
      console.error('Failed to parse title or description from:', content);
      console.error('Parsed values:', { title, description });
      throw new Error('Unable to parse recipe format from OpenAI response');
    }
    
    return { title, description };
  }

  // Legacy method for backward compatibility
  private parseRecipeResponse(content: string): RecipeResponse {
    return this.parseRecipeResponseFlexible(content);
  }
} 