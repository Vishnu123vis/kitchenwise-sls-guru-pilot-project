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
      Limit: 10, // Increased limit to show more recipes
    };

    // Handle pagination
    if (event.queryStringParameters && event.queryStringParameters.lastEvaluatedKey) {
      try {
        queryParams.ExclusiveStartKey = JSON.parse(event.queryStringParameters.lastEvaluatedKey);
      } catch {}
    }

    const { items, lastEvaluatedKey } = await DynamoDB.queryItems<StarredRecipeRecord>(queryParams);

    // Process recipes to add metadata
    const processedItems = items.map(recipe => {
      const isTemporary = recipe.status === 'temporary';
      const ttlDate = recipe.ttlExpiration ? new Date(recipe.ttlExpiration * 1000) : null;
      
      return {
        ...recipe,
        isTemporary,
        expiresAt: ttlDate ? ttlDate.toISOString() : null,
        daysUntilExpiry: ttlDate ? Math.ceil((ttlDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
      };
    });

    // Separate temporary and permanent recipes for better organization
    const temporaryRecipes = processedItems.filter(recipe => recipe.status === 'temporary');
    const permanentRecipes = processedItems.filter(recipe => recipe.status === 'permanent');

    return httpResponse({ 
      statusCode: 200, 
      body: { 
        items: processedItems,
        temporaryRecipes,
        permanentRecipes,
        lastEvaluatedKey,
        totalCount: items.length,
        temporaryCount: temporaryRecipes.length,
        permanentCount: permanentRecipes.length,
        hasMore: !!lastEvaluatedKey
      } 
    });
    
  } catch (err) {
    console.error('getStarredRecipes error:', err);
    return httpResponse({ statusCode: 500, body: { error: 'Failed to fetch starred recipes' } });
  }
};
