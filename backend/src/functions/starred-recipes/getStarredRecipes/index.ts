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
    if (!tableName) {
      console.error('DYNAMODB_STARRED_RECIPES_TABLE environment variable not set');
      return httpResponse({ statusCode: 500, body: { error: 'Configuration error' } });
    }

    const queryParams: any = {
      TableName: tableName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      Limit: 10, // Page size for starred recipes
    };

    // Handle pagination
    if (event.queryStringParameters && event.queryStringParameters.lastEvaluatedKey) {
      try {
        queryParams.ExclusiveStartKey = JSON.parse(event.queryStringParameters.lastEvaluatedKey);
      } catch {}
    }

    const { items, lastEvaluatedKey } = await DynamoDB.queryItems<StarredRecipeRecord>(queryParams);

    return httpResponse({ 
      statusCode: 200, 
      body: { 
        items, 
        lastEvaluatedKey,
        totalCount: items.length,
        hasMore: !!lastEvaluatedKey
      } 
    });
    
  } catch (err) {
    console.error('getStarredRecipes error:', err);
    return httpResponse({ statusCode: 500, body: { error: 'Failed to fetch starred recipes' } });
  }
};
