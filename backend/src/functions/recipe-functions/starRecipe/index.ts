import { APIGatewayProxyHandler } from 'aws-lambda';
import DynamoDB from '../../../libs/DynamoDB';
import { httpResponse } from '../../../libs/APIResponses';
import { StarredRecipeRecord } from '../../../types/types';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('=== STAR RECIPE LAMBDA DEBUG ===');
    console.log('Event:', JSON.stringify(event, null, 2));
    console.log('Event body type:', typeof event.body);
    console.log('Event body:', event.body);

    const userId = event.requestContext.authorizer?.jwt?.claims?.sub || event.requestContext.authorizer?.claims?.sub;
    console.log('User ID:', userId);

    if (!userId) {
      return httpResponse({ statusCode: 401, body: { error: 'Unauthorized' } });
    }

    const tableName = process.env.DYNAMODB_STARRED_RECIPES_TABLE;

    if (!event.body) {
      console.log('No event body provided');
      return httpResponse({ statusCode: 400, body: { error: 'Request body is required' } });
    }

    console.log('Parsing event body...');
    let data;
    
    // Handle potential double-encoding issue
    if (typeof event.body === 'string') {
      try {
        // First, try to parse as JSON
        const firstParse = JSON.parse(event.body);
        console.log('First parse result type:', typeof firstParse);
        console.log('First parse result:', firstParse);
        
        // Check if the first parse returned a string (indicating double-encoding)
        if (typeof firstParse === 'string') {
          console.log('First parse returned a string, handling double-encoding...');
          try {
            const unescapedBody = firstParse.replace(/\\"/g, '"').replace(/^"|"$/g, '');
            data = JSON.parse(unescapedBody);
            console.log('Successfully parsed after handling double-encoding');
          } catch (secondParseError) {
            console.log('Failed to parse even after handling double-encoding');
            throw new Error('Invalid JSON format in request body');
          }
        } else {
          // First parse returned an object, use it directly
          data = firstParse;
          console.log('First parse returned an object, using directly');
        }
      } catch (parseError) {
        console.log('Failed to parse as JSON:', parseError);
        throw new Error('Invalid JSON format in request body');
      }
    } else {
      // Body is already an object
      data = event.body;
      console.log('Body was already an object');
    }
    
    console.log('Final parsed data:', JSON.stringify(data, null, 2));

    // Validate required fields
    if (!data.recipeId || !data.title || !data.description) {
      return httpResponse({ 
        statusCode: 400, 
        body: { error: 'Missing required fields: recipeId, title, description' } 
      });
    }

    // Check if recipe already exists
    const existingRecipe = await DynamoDB.getItem<StarredRecipeRecord>({
      TableName: tableName,
      Key: {
        userId,
        recipeId: data.recipeId
      }
    });

    if (existingRecipe) {
      // Recipe exists, update it to permanent status and remove TTL
      const updatedRecipe: StarredRecipeRecord = {
        ...existingRecipe,
        status: 'permanent'
        // ttlExpiration is automatically removed when not specified
      };

      await DynamoDB.putItem({ 
        TableName: tableName, 
        Item: updatedRecipe 
      });

      console.log(`Recipe ${data.recipeId} updated to permanent status, TTL removed`);
      return httpResponse({ statusCode: 200, body: updatedRecipe });
    } else {
      // Recipe doesn't exist, create new permanent recipe
      const starredRecipe: StarredRecipeRecord = {
        userId,
        recipeId: data.recipeId,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl || '',
        constraint: data.constraint || 'No Constraint',
        status: 'permanent'
        // No ttlExpiration for permanent recipes
      };

      await DynamoDB.putItem({ 
        TableName: tableName, 
        Item: starredRecipe 
      });

      console.log(`New permanent recipe ${data.recipeId} created`);
      return httpResponse({ statusCode: 201, body: starredRecipe });
    }

  } catch (err) {
    console.error('starRecipe error:', err);
    return httpResponse({ statusCode: 500, body: { error: 'Failed to star recipe' } });
  }
};
