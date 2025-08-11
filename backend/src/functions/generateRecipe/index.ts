import { APIGatewayProxyHandler } from 'aws-lambda';
import { httpResponse } from '../../libs/APIResponses';
import { validateGenerateRecipe } from '../../libs/inputValidation';
import { OpenAIService } from '../../libs/OpenAIService';
import { PexelsService } from '../../libs/PexelsService';
import DynamoDB from '../../libs/DynamoDB';
import { PantryItemRecord } from '../../types/dyno';

interface GenerateRecipeRequest {
  constraint?: string;
}

interface GenerateRecipeResponse {
  title: string;
  description: string;
  imageUrl: string;
  constraint: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Extract user ID from JWT token
    const userId = event.requestContext.authorizer?.jwt?.claims?.sub || event.requestContext.authorizer?.claims?.sub;
    if (!userId) {
      return httpResponse({ statusCode: 401, body: { error: 'Unauthorized' } });
    }

    // Parse and validate request body
    let requestBody: GenerateRecipeRequest = {};
    try {
      if (event.body) {
        requestBody = JSON.parse(event.body);
      }
    } catch (error) {
      return httpResponse({ statusCode: 400, body: { error: 'Invalid JSON in request body' } });
    }

    // Set default constraint if not provided
    if (!requestBody.constraint) {
      requestBody.constraint = 'No Constraint';
    }

    // Validate input
    const validationErrors = validateGenerateRecipe(requestBody);
    if (validationErrors.length > 0) {
      return httpResponse({ 
        statusCode: 400, 
        body: { error: 'Validation failed', details: validationErrors } 
      });
    }

    // Get user's pantry items
    const tableName = process.env.DYNAMODB_PANTRY_TABLE;
    if (!tableName) {
      console.error('DYNAMODB_PANTRY_TABLE environment variable not set');
      return httpResponse({ statusCode: 500, body: { error: 'Configuration error' } });
    }

    const { items } = await DynamoDB.queryItems<PantryItemRecord>({
      TableName: tableName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
    });

    if (!items || items.length === 0) {
      return httpResponse({ 
        statusCode: 400, 
        body: { error: 'No pantry items found. Please add some items to your pantry first.' } 
      });
    }

    // Prepare pantry items for OpenAI
    const pantryItems = items.map(item => ({
      title: item.title,
      count: item.count
    }));

    // Initialize services
    const openAIService = new OpenAIService();
    const pexelsService = new PexelsService();

    // Generate recipe using OpenAI
    console.log('Generating recipe with OpenAI...');
    const recipe = await openAIService.generateRecipe({
      constraint: requestBody.constraint,
      pantryItems
    });

    // Search for recipe image using Pexels
    console.log('Searching for recipe image...');
    const imageUrl = await pexelsService.searchRecipeImage(recipe.title);

    // Prepare response
    const response: GenerateRecipeResponse = {
      title: recipe.title,
      description: recipe.description,
      imageUrl: imageUrl || '', // Return empty string if no image found
      constraint: requestBody.constraint
    };

    console.log('Recipe generated successfully:', {
      title: recipe.title,
      constraint: requestBody.constraint,
      hasImage: !!imageUrl
    });

    return httpResponse({ statusCode: 200, body: response });

  } catch (error) {
    console.error('generateRecipe error:', error);
    
    // Handle specific error types with better error messages
    if (error instanceof Error) {
      if (error.message.includes('Rate limit exceeded')) {
        return httpResponse({ 
          statusCode: 429, 
          body: { error: 'Service temporarily unavailable. Please try again later.' } 
        });
      }
      if (error.message.includes('Invalid API key')) {
        return httpResponse({ 
          statusCode: 500, 
          body: { error: 'Service configuration error' } 
        });
      }
      if (error.message.includes('No pantry items found')) {
        return httpResponse({ 
          statusCode: 400, 
          body: { error: error.message } 
        });
      }
      if (error.message.includes('Unable to parse recipe format')) {
        console.error('Recipe parsing failed:', error.message);
        return httpResponse({ 
          statusCode: 500, 
          body: { error: 'Recipe generation failed due to unexpected response format. Please try again.' } 
        });
      }
      if (error.message.includes('Invalid JSON response')) {
        console.error('JSON parsing failed:', error.message);
        return httpResponse({ 
          statusCode: 500, 
          body: { error: 'Recipe generation failed due to invalid response format. Please try again.' } 
        });
      }
      if (error.message.includes('Invalid request to OpenAI API')) {
        console.error('OpenAI API request failed:', error.message);
        return httpResponse({ 
          statusCode: 500, 
          body: { error: 'Recipe generation service is experiencing issues. Please try again later.' } 
        });
      }
    }
    
    // Log the full error for debugging
    console.error('Unhandled error details:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error type',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return httpResponse({ 
      statusCode: 500, 
      body: { error: 'An unexpected error occurred while generating your recipe. Please try again.' } 
    });
  }
}; 