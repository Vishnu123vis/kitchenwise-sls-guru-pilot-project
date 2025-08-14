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

    const recipeId = event.pathParameters?.recipeId;
    if (!recipeId) {
      return httpResponse({ statusCode: 400, body: { error: 'Missing recipe ID' } });
    }

    const tableName = process.env.DYNAMODB_STARRED_RECIPES_TABLE;
    if (!tableName) {
      console.error('DYNAMODB_STARRED_RECIPES_TABLE environment variable not set');
      return httpResponse({ statusCode: 500, body: { error: 'Configuration error' } });
    }

    const result = await DynamoDB.getItem<StarredRecipeRecord>({
      TableName: tableName,
      Key: {
        userId,
        recipeId
      }
    });

    if (!result) {
      return httpResponse({ statusCode: 404, body: { error: 'Starred recipe not found' } });
    }

    return httpResponse({ statusCode: 200, body: result });
    
  } catch (err) {
    console.error('getStarredRecipe error:', err);
    return httpResponse({ statusCode: 500, body: { error: 'Failed to fetch starred recipe' } });
  }
};
