import { handler } from '../../../../src/functions/pantry-crud/getPantryItems';
import DynamoDB from '../../../../src/libs/DynamoDB';

// Mock dependencies
jest.mock('../../../../src/libs/DynamoDB');

const mockDynamoDB = DynamoDB as jest.Mocked<typeof DynamoDB>;

describe('getPantryItems Lambda Function', () => {
  const mockEvent = {
    body: null,
    pathParameters: null,
    httpMethod: 'GET',
    headers: {},
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: '123456789012',
      apiId: 'test-api',
      authorizer: {
        jwt: {
          claims: {
            sub: 'cognito-user-id'
          }
        }
      },
      protocol: 'HTTP/1.1',
      httpMethod: 'GET',
      identity: {} as any,
      path: '/test',
      stage: 'test',
      requestId: 'test-request-id',
      requestTime: '01/Jan/2024:00:00:00 +0000',
      requestTimeEpoch: 1704067200000,
      resourceId: 'test-resource',
      resourcePath: '/test'
    } as any,
    resource: '',
    path: '',
    isBase64Encoded: false,
  };

  const mockContext = {
    callbackWaitsForEmptyEventLoop: true,
    functionName: 'getPantryItems',
    functionVersion: '$LATEST',
    invokedFunctionArn: 'arn:aws:lambda:us-east-2:123456789012:function:getPantryItems',
    memoryLimitInMB: '128',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/getPantryItems',
    logStreamName: '2023/01/01/[$LATEST]test-stream',
    getRemainingTimeInMillis: () => 1000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DYNAMODB_PANTRY_TABLE = 'test-pantry-table';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Successful Retrieval', () => {
    it('should fetch pantry items successfully with no filters', async () => {
      const mockItems = [
        { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item1', itemId: 'item1', title: 'Milk', type: 'Dairy', location: 'Fridge' },
        { userId: 'cognito-user-id', sortKey: 'Produce#Counter#item2', itemId: 'item2', title: 'Banana', type: 'Produce', location: 'Counter' }
      ];

      mockDynamoDB.queryItems.mockResolvedValue({
        items: mockItems,
        lastEvaluatedKey: undefined
      });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      expect(JSON.parse(result!.body)).toEqual({
        items: mockItems,
        lastEvaluatedKey: undefined
      });

      expect(mockDynamoDB.queryItems).toHaveBeenCalledWith({
        TableName: 'test-pantry-table',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': 'cognito-user-id' },
        Limit: 5
      });
    });

    it('should fetch pantry items with type filter', async () => {
      const mockEventWithType = {
        ...mockEvent,
        queryStringParameters: { type: 'Dairy' }
      };

      const mockItems = [
        { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item1', itemId: 'item1', title: 'Milk', type: 'Dairy', location: 'Fridge' },
        { userId: 'cognito-user-id', sortKey: 'Dairy#Counter#item2', itemId: 'item2', title: 'Cheese', type: 'Dairy', location: 'Counter' }
      ];

      mockDynamoDB.queryItems.mockResolvedValue({
        items: mockItems,
        lastEvaluatedKey: undefined
      });

      const result = await handler(mockEventWithType, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      expect(JSON.parse(result!.body).items).toHaveLength(2);

      expect(mockDynamoDB.queryItems).toHaveBeenCalledWith({
        TableName: 'test-pantry-table',
        KeyConditionExpression: 'userId = :userId AND begins_with(sortKey, :sortKeyPrefix)',
        ExpressionAttributeValues: { 
          ':userId': 'cognito-user-id',
          ':sortKeyPrefix': 'Dairy#'
        },
        Limit: 5
      });
    });

    it('should fetch pantry items with location filter', async () => {
      const mockEventWithLocation = {
        ...mockEvent,
        queryStringParameters: { location: 'Fridge' }
      };

      const mockItems = [
        { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item1', itemId: 'item1', title: 'Milk', type: 'Dairy', location: 'Fridge' },
        { userId: 'cognito-user-id', sortKey: 'Meat#Fridge#item2', itemId: 'item2', title: 'Chicken', type: 'Meat', location: 'Fridge' }
      ];

      mockDynamoDB.queryItems.mockResolvedValue({
        items: mockItems,
        lastEvaluatedKey: undefined
      });

      const result = await handler(mockEventWithLocation, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      expect(JSON.parse(result!.body).items).toHaveLength(2);

      expect(mockDynamoDB.queryItems).toHaveBeenCalledWith({
        TableName: 'test-pantry-table',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { 
          ':userId': 'cognito-user-id',
          ':location': 'Fridge'
        },
        FilterExpression: 'location = :location',
        Limit: 5
      });
    });

    it('should fetch pantry items with both type and location filters', async () => {
      const mockEventWithBoth = {
        ...mockEvent,
        queryStringParameters: { type: 'Dairy', location: 'Fridge' }
      };

      const mockItems = [
        { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item1', itemId: 'item1', title: 'Milk', type: 'Dairy', location: 'Fridge' }
      ];

      mockDynamoDB.queryItems.mockResolvedValue({
        items: mockItems,
        lastEvaluatedKey: undefined
      });

      const result = await handler(mockEventWithBoth, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      expect(JSON.parse(result!.body).items).toHaveLength(1);

      expect(mockDynamoDB.queryItems).toHaveBeenCalledWith({
        TableName: 'test-pantry-table',
        KeyConditionExpression: 'userId = :userId AND begins_with(sortKey, :sortKeyPrefix)',
        ExpressionAttributeValues: { 
          ':userId': 'cognito-user-id',
          ':sortKeyPrefix': 'Dairy#Fridge#'
        },
        Limit: 5
      });
    });

    it('should handle pagination with lastEvaluatedKey', async () => {
      const mockEventWithPagination = {
        ...mockEvent,
        queryStringParameters: { lastEvaluatedKey: '{"userId":"cognito-user-id","sortKey":"Dairy#Fridge#item1"}' }
      };

      const mockItems = [
        { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item2', itemId: 'item2', title: 'Cheese', type: 'Dairy', location: 'Fridge' }
      ];

      mockDynamoDB.queryItems.mockResolvedValue({
        items: mockItems,
        lastEvaluatedKey: { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item2' }
      });

      const result = await handler(mockEventWithPagination, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      expect(JSON.parse(result!.body).lastEvaluatedKey).toEqual({
        userId: 'cognito-user-id',
        sortKey: 'Dairy#Fridge#item2'
      });

      expect(mockDynamoDB.queryItems).toHaveBeenCalledWith({
        TableName: 'test-pantry-table',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': 'cognito-user-id' },
        Limit: 5,
        ExclusiveStartKey: { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item1' }
      });
    });

    it('should handle invalid pagination key gracefully', async () => {
      const mockEventWithInvalidPagination = {
        ...mockEvent,
        queryStringParameters: { lastEvaluatedKey: 'invalid-json' }
      };

      const mockItems = [
        { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item1', itemId: 'item1', title: 'Milk', type: 'Dairy', location: 'Fridge' }
      ];

      mockDynamoDB.queryItems.mockResolvedValue({
        items: mockItems,
        lastEvaluatedKey: undefined
      });

      const result = await handler(mockEventWithInvalidPagination, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      expect(JSON.parse(result!.body).items).toHaveLength(1);

      // Should not include ExclusiveStartKey when JSON parsing fails
      expect(mockDynamoDB.queryItems).toHaveBeenCalledWith({
        TableName: 'test-pantry-table',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': 'cognito-user-id' },
        Limit: 5
      });
    });
  });

  describe('Authentication Errors', () => {
    it('should return 401 error when user is not authenticated', async () => {
      const mockEventWithoutUser = {
        ...mockEvent,
        requestContext: {
          ...mockEvent.requestContext,
          authorizer: {}
        }
      };

      const result = await handler(mockEventWithoutUser, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(401);
      expect(JSON.parse(result!.body).error).toBe('Unauthorized');
    });
  });

  describe('Parameter Validation', () => {
    it('should ignore invalid type parameter', async () => {
      const mockEventWithInvalidType = {
        ...mockEvent,
        queryStringParameters: { type: 'InvalidType' }
      };

      const mockItems = [
        { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item1', itemId: 'item1', title: 'Milk', type: 'Dairy', location: 'Fridge' }
      ];

      mockDynamoDB.queryItems.mockResolvedValue({
        items: mockItems,
        lastEvaluatedKey: undefined
      });

      const result = await handler(mockEventWithInvalidType, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);

      // Should not apply type filter for invalid type
      expect(mockDynamoDB.queryItems).toHaveBeenCalledWith({
        TableName: 'test-pantry-table',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': 'cognito-user-id' },
        Limit: 5
      });
    });

    it('should ignore invalid location parameter', async () => {
      const mockEventWithInvalidLocation = {
        ...mockEvent,
        queryStringParameters: { location: 'InvalidLocation' }
      };

      const mockItems = [
        { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item1', itemId: 'item1', title: 'Milk', type: 'Dairy', location: 'Fridge' }
      ];

      mockDynamoDB.queryItems.mockResolvedValue({
        items: mockItems,
        lastEvaluatedKey: undefined
      });

      const result = await handler(mockEventWithInvalidLocation, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);

      // Should not apply location filter for invalid location
      expect(mockDynamoDB.queryItems).toHaveBeenCalledWith({
        TableName: 'test-pantry-table',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': 'cognito-user-id' },
        Limit: 5
      });
    });
  });

  describe('DynamoDB Errors', () => {
    it('should return 500 error when DynamoDB queryItems fails', async () => {
      mockDynamoDB.queryItems.mockRejectedValue(new Error('DynamoDB error'));

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('Failed to fetch pantry items');
    });

    it('should return 500 error when DynamoDB queryItems throws', async () => {
      mockDynamoDB.queryItems.mockImplementation(() => {
        throw new Error('DynamoDB error');
      });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('Failed to fetch pantry items');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty result set', async () => {
      mockDynamoDB.queryItems.mockResolvedValue({
        items: [],
        lastEvaluatedKey: undefined
      });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      expect(JSON.parse(result!.body).items).toEqual([]);
      expect(JSON.parse(result!.body).lastEvaluatedKey).toBeUndefined();
    });

    it('should handle undefined queryStringParameters', async () => {
      const mockEventWithoutQuery = {
        ...mockEvent,
        queryStringParameters: null
      };

      const mockItems = [
        { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item1', itemId: 'item1', title: 'Milk', type: 'Dairy', location: 'Fridge' }
      ];

      mockDynamoDB.queryItems.mockResolvedValue({
        items: mockItems,
        lastEvaluatedKey: undefined
      });

      const result = await handler(mockEventWithoutQuery, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      expect(JSON.parse(result!.body).items).toHaveLength(1);
    });

    it('should handle empty queryStringParameters', async () => {
      const mockEventWithEmptyQuery = {
        ...mockEvent,
        queryStringParameters: {}
      };

      const mockItems = [
        { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item1', itemId: 'item1', title: 'Milk', type: 'Dairy', location: 'Fridge' }
      ];

      mockDynamoDB.queryItems.mockResolvedValue({
        items: mockItems,
        lastEvaluatedKey: undefined
      });

      const result = await handler(mockEventWithEmptyQuery, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      expect(JSON.parse(result!.body).items).toHaveLength(1);
    });
  });
});
