import { APIGatewayProxyHandler } from 'aws-lambda';
import DynamoDB from '../../../libs/DynamoDB';
import { httpResponse } from '../../../libs/APIResponses';
import { validateDeletePantryItem } from '../../../libs/inputValidation';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.jwt?.claims?.sub || event.requestContext.authorizer?.claims?.sub;
    if (!userId) {
      return httpResponse({ statusCode: 401, body: { error: 'Unauthorized' } });
    }
    const itemId = event.pathParameters?.itemId;
   
    // input validation
    const errors = validateDeletePantryItem({ userId, itemId });
    if (errors.length > 0) {
      return httpResponse({ statusCode: 400, body: { error: errors.join(', ') } });
    }
    
    const tableName = process.env.DYNAMODB_PANTRY_TABLE;
    
    // First, get the item to find its sortKey
    const { items } = await DynamoDB.queryItems({
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

    const item = items[0];
    
    // Delete using the sortKey
    await DynamoDB.deleteItem({
      TableName: tableName,
      Key: { userId, sortKey: item.sortKey },
    });
    
    return httpResponse({ statusCode: 204, body: {} });
  } catch (err) {
    return httpResponse({ statusCode: 500, body: { error: 'Failed to delete pantry item' } });
  }
}; 