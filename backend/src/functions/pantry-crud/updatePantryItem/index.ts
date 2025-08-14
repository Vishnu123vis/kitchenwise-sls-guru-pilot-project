import { APIGatewayProxyHandler } from 'aws-lambda';
import DynamoDB from '../../../libs/DynamoDB';
import { httpResponse } from '../../../libs/APIResponses';
import { PantryItemRecord, PantryItemType, PantryLocation, generateSortKey } from '../../../types/types';
import { validateUpdatePantryItem } from '../../../libs/inputValidation';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.jwt?.claims?.sub || event.requestContext.authorizer?.claims?.sub;
    if (!userId) {
      return httpResponse({ statusCode: 401, body: { error: 'Unauthorized' } });
    }
    const itemId = event.pathParameters?.itemId;
    if (!itemId) {
      return httpResponse({ statusCode: 400, body: { error: 'Missing itemId' } });
    }
    if (!event.body) {
      return httpResponse({ statusCode: 400, body: { error: 'Missing request body' } });
    }
    const data = JSON.parse(event.body);

    // input validation
    const errors = validateUpdatePantryItem(data);
    if (errors.length > 0) {
      return httpResponse({ statusCode: 400, body: { error: errors.join(', ') } });
    }

    const tableName = process.env.DYNAMODB_PANTRY_TABLE;
    
    // First, get the existing item to know its current type and location
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

    const existing = items[0];
    
    // Build UpdateExpression and ExpressionAttributeValues for atomic update
    const updateExpressions: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};

    // Add each field to update expression (excluding userId and itemId)
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'userId' && key !== 'itemId') {
        const attributeName = `#${key}`;
        const attributeValue = `:${key}`;
        
        updateExpressions.push(`${attributeName} = ${attributeValue}`);
        expressionAttributeNames[attributeName] = key;
        expressionAttributeValues[attributeValue] = value;
      }
    });

    if (updateExpressions.length === 0) {
      return httpResponse({ statusCode: 400, body: { error: 'No valid fields to update' } });
    }

    // If type or location is being updated, we need to update the sortKey
    const newType = data.type || existing.type;
    const newLocation = data.location || existing.location;
    
    if (data.type || data.location) {
      const newSortKey = generateSortKey(newType, newLocation, itemId);
      updateExpressions.push('#sortKey = :sortKey');
      expressionAttributeNames['#sortKey'] = 'sortKey';
      expressionAttributeValues[':sortKey'] = newSortKey;
    }

    // Perform atomic update
    const updatedItem = await DynamoDB.updateItem<PantryItemRecord>({
      TableName: tableName,
      Key: { userId, sortKey: existing.sortKey },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(userId) AND attribute_exists(sortKey)',
      ReturnValues: 'ALL_NEW',
    });

    if (!updatedItem) {
      return httpResponse({ statusCode: 404, body: { error: 'Item not found' } });
    }

    return httpResponse({ statusCode: 200, body: updatedItem });
  } catch (err: any) {
    // Handle conditional check failure
    if (err.name === 'ConditionalCheckFailedException') {
      return httpResponse({ statusCode: 404, body: { error: 'Item not found' } });
    }
    console.error('Update pantry item error:', err);
    return httpResponse({ statusCode: 500, body: { error: 'Failed to update pantry item' } });
  }
}; 