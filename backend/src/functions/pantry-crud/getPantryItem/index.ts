import { APIGatewayProxyHandler } from 'aws-lambda';
import DynamoDB from '../../../libs/DynamoDB';
import { httpResponse } from '../../../libs/APIResponses';
import { PantryItemRecord } from '../../../types/types';
import { validateGetPantryItem } from '../../../libs/inputValidation';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.jwt?.claims?.sub || event.requestContext.authorizer?.claims?.sub;
    if (!userId) {
      return httpResponse({ statusCode: 401, body: { error: 'Unauthorized' } });
    }
    const itemId = event.pathParameters?.itemId;

    // input validation
    const errors = validateGetPantryItem({ userId, itemId });
    if (errors.length > 0) {
      return httpResponse({ statusCode: 400, body: { error: errors.join(', ') } });
    }

    const tableName = process.env.DYNAMODB_PANTRY_TABLE;
    
    // Query by itemId since we need to find the item first
    const { items } = await DynamoDB.queryItems<PantryItemRecord>({
      TableName: tableName,
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: 'itemId = :itemId',
      ExpressionAttributeValues: { 
        ':userId': userId,
        ':itemId': itemId
      },
    });

    if (items.length === 0) {
      return httpResponse({ statusCode: 404, body: { error: 'Item not found' } });
    }

    return httpResponse({ statusCode: 200, body: items[0] });
  } catch (err) {
    console.error('getPantryItem error:', err);
    return httpResponse({ statusCode: 500, body: { error: 'Failed to fetch pantry item' } });
  }
}; 