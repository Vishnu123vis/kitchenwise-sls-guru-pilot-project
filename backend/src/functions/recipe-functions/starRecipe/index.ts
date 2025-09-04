import { APIGatewayProxyHandler } from 'aws-lambda';
import DynamoDB from '../../../libs/DynamoDB';
import { httpResponse } from '../../../libs/APIResponses';
import { StarredRecipeRecord } from '../../../types/types';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    
    const userId = event.requestContext.authorizer?.jwt?.claims?.sub || event.requestContext.authorizer?.claims?.sub;

    if (!userId) {
      return httpResponse({ statusCode: 401, body: { error: 'Unauthorized' } });
    }

    const tableName = process.env.DYNAMODB_STARRED_RECIPES_TABLE;

    if (!event.body) {
      return httpResponse({ statusCode: 400, body: { error: 'Request body is required' } });
    }

    let data;
    
    // Handle potential double-encoding issue
    if (typeof event.body === 'string') {
      try {
        // First, try to parse as JSON
        const firstParse = JSON.parse(event.body);
        
        // Check if the first parse returned a string (indicating double-encoding)
        if (typeof firstParse === 'string') {
          try {
            const unescapedBody = firstParse.replace(/\\"/g, '"').replace(/^"|"$/g, '');
            data = JSON.parse(unescapedBody);
          } catch (secondParseError) {
            throw new Error('Invalid JSON format in request body');
          }
        } else {
          // First parse returned an object, use it directly
          data = firstParse;
        }
      } catch (parseError) {
        throw new Error('Invalid JSON format in request body');
      }
    } else {
      // Body is already an object
      data = event.body;
    }

    // Validate required fields
    if (!data.recipeId || !data.title || !data.description) {
      return httpResponse({ 
        statusCode: 400, 
        body: { error: 'Missing required fields: recipeId, title, description' } 
      });
    }

    // making sure recipe already exists in the database
    const existingRecipe = await DynamoDB.getItem<StarredRecipeRecord>({
      TableName: tableName,
      Key: {
        userId,
        recipeId: data.recipeId
      }
    });

    // Recipe will always exist if recipeId was generated
    if (!existingRecipe) {
      return httpResponse({ statusCode: 404, body: { error: 'Recipe not found' } });
    }

    const { ttlExpiration, ...recipeWithoutTTL } = existingRecipe; 
    
    const updatedRecipe: StarredRecipeRecord = {
      ...recipeWithoutTTL,
      status: 'permanent'
    };

    await DynamoDB.putItem({ 
      TableName: tableName, 
      Item: updatedRecipe 
    });

    return httpResponse({ statusCode: 200, body: updatedRecipe });

  } catch (err) {
    console.error('starRecipe error:', err);
    return httpResponse({ statusCode: 500, body: { error: 'Failed to star recipe' } });
  }
};
