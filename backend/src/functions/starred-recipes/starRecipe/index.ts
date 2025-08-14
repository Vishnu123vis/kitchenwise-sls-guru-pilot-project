import { APIGatewayProxyHandler } from 'aws-lambda';
import DynamoDB from '../../../libs/DynamoDB';
import { httpResponse } from '../../../libs/APIResponses';
import { StarredRecipeRecord } from '../../../types/dyno';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.jwt?.claims?.sub || event.requestContext.authorizer?.claims?.sub;
    if (!userId) {
      return httpResponse({ statusCode: 401, body: { error: 'Unauthorized' } });
    }

    if (!event.body) {
      return httpResponse({ statusCode: 400, body: { error: 'Missing request body' } });
    }

    const data = JSON.parse(event.body);

    // Validate required fields
    if (!data.recipeId || !data.title || !data.description) {
      return httpResponse({ 
        statusCode: 400, 
        body: { error: 'Missing required fields: recipeId, title, description' } 
      });
    }

    const starredRecipe: StarredRecipeRecord = {
      userId,
      recipeId: data.recipeId,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl || '',
      constraint: data.constraint || 'No Constraint',
    };

    const tableName = process.env.DYNAMODB_STARRED_RECIPES_TABLE;
    if (!tableName) {
      console.error('DYNAMODB_STARRED_RECIPES_TABLE environment variable not set');
      return httpResponse({ statusCode: 500, body: { error: 'Configuration error' } });
    }

    await DynamoDB.putItem({ 
      TableName: tableName, 
      Item: starredRecipe 
    });

    return httpResponse({ statusCode: 201, body: starredRecipe });

  } catch (err) {
    console.error('starRecipe error:', err);
    return httpResponse({ statusCode: 500, body: { error: 'Failed to star recipe' } });
  }
};
