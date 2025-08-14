import { APIGatewayProxyHandler } from 'aws-lambda';
import DynamoDB from '../../../libs/DynamoDB';
import { httpResponse } from '../../../libs/APIResponses';
import { PantryItemRecord, generateTypeLocationPrefix, PantryItemType, PantryLocation } from '../../../types/types';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.jwt?.claims?.sub || event.requestContext.authorizer?.claims?.sub;
    if (!userId) {
      return httpResponse({ statusCode: 401, body: { error: 'Unauthorized' } });
    }

    const tableName = process.env.DYNAMODB_PANTRY_TABLE;
    const queryParams: any = {
      TableName: tableName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      Limit: 5, // Page size
    };

    // Handle filtering by type and/or location
    const typeParam = event.queryStringParameters?.type;
    const locationParam = event.queryStringParameters?.location;
    
    // Validate type and location parameters
    const validTypes: PantryItemType[] = ['Dairy', 'Produce', 'Meat', 'Grains', 'Snacks', 'Beverages', 'Condiments', 'Frozen', 'Other'];
    const validLocations: PantryLocation[] = ['Fridge', 'Freezer', 'Pantry', 'Counter', 'Other'];
    
    const type = validTypes.includes(typeParam as PantryItemType) ? typeParam as PantryItemType : undefined;
    const location = validLocations.includes(locationParam as PantryLocation) ? locationParam as PantryLocation : undefined;
    
    // Handle filtering logic
    if (type && location) {
      // Filter by both type and location
      const prefix = generateTypeLocationPrefix(type, location);
      queryParams.KeyConditionExpression += ' AND begins_with(sortKey, :sortKeyPrefix)';
      queryParams.ExpressionAttributeValues[':sortKeyPrefix'] = prefix;
    } else if (type) {
      // Filter by type only
      const prefix = generateTypeLocationPrefix(type, undefined);
      queryParams.KeyConditionExpression += ' AND begins_with(sortKey, :sortKeyPrefix)';
      queryParams.ExpressionAttributeValues[':sortKeyPrefix'] = prefix;
    } else if (location) {
      // For location-only filtering, we need to use a FilterExpression
      // since we can't use begins_with on the middle part of the sort key
      queryParams.FilterExpression = 'location = :location';
      queryParams.ExpressionAttributeValues[':location'] = location;
    }

    // Handle pagination
    if (event.queryStringParameters && event.queryStringParameters.lastEvaluatedKey) {
      try {
        queryParams.ExclusiveStartKey = JSON.parse(event.queryStringParameters.lastEvaluatedKey);
      } catch {}
    }

    const { items, lastEvaluatedKey } = await DynamoDB.queryItems<PantryItemRecord>(queryParams);

    return httpResponse({ statusCode: 200, body: { items, lastEvaluatedKey } });
    
  } catch (err) {
    console.error('getPantryItems error:', err);
    return httpResponse({ statusCode: 500, body: { error: 'Failed to fetch pantry items' } });
  }
}; 