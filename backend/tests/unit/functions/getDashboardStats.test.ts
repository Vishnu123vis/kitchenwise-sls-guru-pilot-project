import { handler } from '../../src/functions/getDashboardStats';
import DynamoDB from '../../src/libs/DynamoDB';

// Mock dependencies
jest.mock('../../src/libs/DynamoDB');

const mockDynamoDB = DynamoDB as jest.Mocked<typeof DynamoDB>;

describe('getDashboardStats Lambda Function', () => {
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
    functionName: 'getDashboardStats',
    functionVersion: '$LATEST',
    invokedFunctionArn: 'arn:aws:lambda:us-east-2:123456789012:function:getDashboardStats',
    memoryLimitInMB: '128',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/getDashboardStats',
    logStreamName: '2023/01/01/[$LATEST]test-stream',
    getRemainingTimeInMillis: () => 1000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };

  const mockPantryItems = [
    { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item1', itemId: 'item1', title: 'Milk', type: 'Dairy', location: 'Fridge', count: 2 },
    { userId: 'cognito-user-id', sortKey: 'Produce#Counter#item2', itemId: 'item2', title: 'Banana', type: 'Produce', location: 'Counter', count: 3 },
    { userId: 'cognito-user-id', sortKey: 'Meat#Freezer#item3', itemId: 'item3', title: 'Chicken', type: 'Meat', location: 'Freezer', count: 1 },
    { userId: 'cognito-user-id', sortKey: 'Grains#Pantry#item4', itemId: 'item4', title: 'Rice', type: 'Grains', location: 'Pantry', count: 2 }
  ];

  const mockStarredRecipes = [
    { userId: 'cognito-user-id', recipeId: 'recipe1', title: 'Recipe 1', status: 'starred' },
    { userId: 'cognito-user-id', recipeId: 'recipe2', title: 'Recipe 2', status: 'starred' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DYNAMODB_PANTRY_TABLE = 'test-pantry-table';
    process.env.DYNAMODB_STARRED_RECIPES_TABLE = 'test-starred-recipes-table';
    
    // Default mocks
    mockDynamoDB.queryItems.mockResolvedValue({
      items: mockPantryItems,
      lastEvaluatedKey: undefined
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Successful Statistics Retrieval', () => {
    it('should retrieve dashboard statistics successfully', async () => {
      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.totalItems).toBe(8); // Sum of all counts
      expect(responseBody.uniqueItems).toBe(4); // Number of unique items
      expect(responseBody.categories).toEqual({
        'Dairy': 2,
        'Produce': 3,
        'Meat': 1,
        'Grains': 2
      });
      expect(responseBody.locations).toEqual({
        'Fridge': 2,
        'Counter': 3,
        'Freezer': 1,
        'Pantry': 2
      });
      expect(responseBody.starredRecipes).toBe(2);

      expect(mockDynamoDB.queryItems).toHaveBeenCalledTimes(2);
      
      // First call for pantry items
      expect(mockDynamoDB.queryItems).toHaveBeenNthCalledWith(1, {
        TableName: 'test-pantry-table',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': 'cognito-user-id' },
        Limit: 1000
      });
      
      // Second call for starred recipes
      expect(mockDynamoDB.queryItems).toHaveBeenNthCalledWith(2, {
        TableName: 'test-starred-recipes-table',
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: 'status = :status',
        ExpressionAttributeValues: {
          ':userId': 'cognito-user-id',
          ':status': 'starred'
        },
        Limit: 1000
      });
    });

    it('should handle empty pantry and recipes', async () => {
      mockDynamoDB.queryItems.mockResolvedValue({
        items: [],
        lastEvaluatedKey: undefined
      });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.totalItems).toBe(0);
      expect(responseBody.uniqueItems).toBe(0);
      expect(responseBody.categories).toEqual({});
      expect(responseBody.locations).toEqual({});
      expect(responseBody.starredRecipes).toBe(0);
    });

    it('should handle pantry items with zero counts', async () => {
      const mockPantryItemsWithZeros = [
        { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item1', itemId: 'item1', title: 'Milk', type: 'Dairy', location: 'Fridge', count: 0 },
        { userId: 'cognito-user-id', sortKey: 'Produce#Counter#item2', itemId: 'item2', title: 'Banana', type: 'Produce', location: 'Counter', count: 3 }
      ];

      mockDynamoDB.queryItems
        .mockResolvedValueOnce({
          items: mockPantryItemsWithZeros,
          lastEvaluatedKey: undefined
        })
        .mockResolvedValueOnce({
          items: mockStarredRecipes,
          lastEvaluatedKey: undefined
        });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.totalItems).toBe(3); // Only sum of non-zero counts
      expect(responseBody.uniqueItems).toBe(2);
      expect(responseBody.categories).toEqual({
        'Dairy': 0,
        'Produce': 3
      });
      expect(responseBody.locations).toEqual({
        'Fridge': 0,
        'Counter': 3
      });
    });

    it('should handle pantry items with negative counts', async () => {
      const mockPantryItemsWithNegatives = [
        { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item1', itemId: 'item1', title: 'Milk', type: 'Dairy', location: 'Fridge', count: -1 },
        { userId: 'cognito-user-id', sortKey: 'Produce#Counter#item2', itemId: 'item2', title: 'Banana', type: 'Produce', location: 'Counter', count: 3 }
      ];

      mockDynamoDB.queryItems
        .mockResolvedValueOnce({
          items: mockPantryItemsWithNegatives,
          lastEvaluatedKey: undefined
        })
        .mockResolvedValueOnce({
          items: mockStarredRecipes,
          lastEvaluatedKey: undefined
        });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.totalItems).toBe(2); // Sum of counts (negative counts are included)
      expect(responseBody.uniqueItems).toBe(2);
      expect(responseBody.categories).toEqual({
        'Dairy': -1,
        'Produce': 3
      });
      expect(responseBody.locations).toEqual({
        'Fridge': -1,
        'Counter': 3
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

  describe('Configuration Errors', () => {
    it('should return 500 error when DYNAMODB_PANTRY_TABLE is not set', async () => {
      delete process.env.DYNAMODB_PANTRY_TABLE;

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('Configuration error');
    });

    it('should return 500 error when DYNAMODB_STARRED_RECIPES_TABLE is not set', async () => {
      delete process.env.DYNAMODB_STARRED_RECIPES_TABLE;

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('Configuration error');
    });
  });

  describe('DynamoDB Errors', () => {
    it('should return 500 error when DynamoDB queryItems fails for pantry items', async () => {
      mockDynamoDB.queryItems.mockRejectedValueOnce(new Error('DynamoDB error'));

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('An unexpected error occurred while retrieving dashboard statistics. Please try again.');
    });

    it('should return 500 error when DynamoDB queryItems fails for starred recipes', async () => {
      mockDynamoDB.queryItems
        .mockResolvedValueOnce({
          items: mockPantryItems,
          lastEvaluatedKey: undefined
        })
        .mockRejectedValueOnce(new Error('DynamoDB error'));

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('An unexpected error occurred while retrieving dashboard statistics. Please try again.');
    });
  });

  describe('Statistics Calculation', () => {
    it('should calculate total items correctly', async () => {
      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      // 2 + 3 + 1 + 2 = 8
      expect(responseBody.totalItems).toBe(8);
    });

    it('should count unique items correctly', async () => {
      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.uniqueItems).toBe(4);
    });

    it('should aggregate categories correctly', async () => {
      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.categories).toEqual({
        'Dairy': 2,
        'Produce': 3,
        'Meat': 1,
        'Grains': 2
      });
    });

    it('should aggregate locations correctly', async () => {
      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.locations).toEqual({
        'Fridge': 2,
        'Counter': 3,
        'Freezer': 1,
        'Pantry': 2
      });
    });

    it('should count starred recipes correctly', async () => {
      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.starredRecipes).toBe(2);
    });

    it('should handle duplicate categories correctly', async () => {
      const mockPantryItemsWithDuplicates = [
        { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item1', itemId: 'item1', title: 'Milk', type: 'Dairy', location: 'Fridge', count: 2 },
        { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item2', itemId: 'item2', title: 'Cheese', type: 'Dairy', location: 'Fridge', count: 1 }
      ];

      mockDynamoDB.queryItems
        .mockResolvedValueOnce({
          items: mockPantryItemsWithDuplicates,
          lastEvaluatedKey: undefined
        })
        .mockResolvedValueOnce({
          items: mockStarredRecipes,
          lastEvaluatedKey: undefined
        });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.categories).toEqual({
        'Dairy': 3 // 2 + 1
      });
      expect(responseBody.locations).toEqual({
        'Fridge': 3 // 2 + 1
      });
    });

    it('should handle duplicate locations correctly', async () => {
      const mockPantryItemsWithDuplicateLocations = [
        { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item1', itemId: 'item1', title: 'Milk', type: 'Dairy', location: 'Fridge', count: 2 },
        { userId: 'cognito-user-id', sortKey: 'Produce#Fridge#item2', itemId: 'item2', title: 'Lettuce', type: 'Produce', location: 'Fridge', count: 1 }
      ];

      mockDynamoDB.queryItems
        .mockResolvedValueOnce({
          items: mockPantryItemsWithDuplicateLocations,
          lastEvaluatedKey: undefined
        })
        .mockResolvedValueOnce({
          items: mockStarredRecipes,
          lastEvaluatedKey: undefined
        });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.locations).toEqual({
        'Fridge': 3 // 2 + 1
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle pantry items with missing count field', async () => {
      const mockPantryItemsWithoutCount = [
        { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item1', itemId: 'item1', title: 'Milk', type: 'Dairy', location: 'Fridge' },
        { userId: 'cognito-user-id', sortKey: 'Produce#Counter#item2', itemId: 'item2', title: 'Banana', type: 'Produce', location: 'Counter', count: 3 }
      ];

      mockDynamoDB.queryItems
        .mockResolvedValueOnce({
          items: mockPantryItemsWithoutCount,
          lastEvaluatedKey: undefined
        })
        .mockResolvedValueOnce({
          items: mockStarredRecipes,
          lastEvaluatedKey: undefined
        });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.totalItems).toBe(3); // Only the item with count
      expect(responseBody.uniqueItems).toBe(2);
      expect(responseBody.categories).toEqual({
        'Dairy': undefined, // Missing count
        'Produce': 3
      });
      expect(responseBody.locations).toEqual({
        'Fridge': undefined, // Missing count
        'Counter': 3
      });
    });

    it('should handle pantry items with missing type field', async () => {
      const mockPantryItemsWithoutType = [
        { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item1', itemId: 'item1', title: 'Milk', location: 'Fridge', count: 2 },
        { userId: 'cognito-user-id', sortKey: 'Produce#Counter#item2', itemId: 'item2', title: 'Banana', type: 'Produce', location: 'Counter', count: 3 }
      ];

      mockDynamoDB.queryItems
        .mockResolvedValueOnce({
          items: mockPantryItemsWithoutType,
          lastEvaluatedKey: undefined
        })
        .mockResolvedValueOnce({
          items: mockStarredRecipes,
          lastEvaluatedKey: undefined
        });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.categories).toEqual({
        undefined: 2, // Missing type
        'Produce': 3
      });
    });

    it('should handle pantry items with missing location field', async () => {
      const mockPantryItemsWithoutLocation = [
        { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item1', itemId: 'item1', title: 'Milk', type: 'Dairy', count: 2 },
        { userId: 'cognito-user-id', sortKey: 'Produce#Counter#item2', itemId: 'item2', title: 'Banana', type: 'Produce', location: 'Counter', count: 3 }
      ];

      mockDynamoDB.queryItems
        .mockResolvedValueOnce({
          items: mockPantryItemsWithoutLocation,
          lastEvaluatedKey: undefined
        })
        .mockResolvedValueOnce({
          items: mockStarredRecipes,
          lastEvaluatedKey: undefined
        });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.locations).toEqual({
        undefined: 2, // Missing location
        'Counter': 3
      });
    });

    it('should handle very large counts', async () => {
      const mockPantryItemsWithLargeCounts = [
        { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item1', itemId: 'item1', title: 'Milk', type: 'Dairy', location: 'Fridge', count: 999999999 },
        { userId: 'cognito-user-id', sortKey: 'Produce#Counter#item2', itemId: 'item2', title: 'Banana', type: 'Produce', location: 'Counter', count: 1 }
      ];

      mockDynamoDB.queryItems
        .mockResolvedValueOnce({
          items: mockPantryItemsWithLargeCounts,
          lastEvaluatedKey: undefined
        })
        .mockResolvedValueOnce({
          items: mockStarredRecipes,
          lastEvaluatedKey: undefined
        });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.totalItems).toBe(1000000000); // 999999999 + 1
      expect(responseBody.categories).toEqual({
        'Dairy': 999999999,
        'Produce': 1
      });
    });
  });

  describe('Response Format', () => {
    it('should return statistics in correct format', async () => {
      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      expect(result!.headers).toEqual({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,OPTIONS'
      });
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody).toHaveProperty('totalItems');
      expect(responseBody).toHaveProperty('uniqueItems');
      expect(responseBody).toHaveProperty('categories');
      expect(responseBody).toHaveProperty('locations');
      expect(responseBody).toHaveProperty('starredRecipes');
      expect(typeof responseBody.totalItems).toBe('number');
      expect(typeof responseBody.uniqueItems).toBe('number');
      expect(typeof responseBody.categories).toBe('object');
      expect(typeof responseBody.locations).toBe('object');
      expect(typeof responseBody.starredRecipes).toBe('number');
    });
  });
});
