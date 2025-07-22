import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import DynamoDB from '../../../libs/DynamoDB';
import { httpResponse } from '../../../libs/APIResponses';
import { validateCreatePantryItem } from '../../../libs/inputValidation';
import { PantryItemRecord, PantryItemType, PantryLocation, generateSortKey } from '../../../types/dyno';

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

    // input validation
    const errors = validateCreatePantryItem(data);
    if (errors.length > 0) {
      return httpResponse({ statusCode: 400, body: { error: errors.join(', ') } });
    }
    
    const itemId = uuidv4();
    const sortKey = generateSortKey(data.type as PantryItemType, data.location as PantryLocation, itemId);
    
    const item: PantryItemRecord = {
      userId,
      sortKey,
      itemId,
      title: data.title,
      type: data.type as PantryItemType,
      location: data.location as PantryLocation,
      expiryDate: data.expiryDate,
      count: data.count,
      notes: data.notes,
    };
    const tableName = process.env.DYNAMODB_PANTRY_TABLE;
    await DynamoDB.putItem({ TableName: tableName, Item: item });
    return httpResponse({ statusCode: 201, body: item });
  } catch (err) {
    return httpResponse({ statusCode: 500, body: { error: 'Failed to create pantry item' } });
  }
}; 