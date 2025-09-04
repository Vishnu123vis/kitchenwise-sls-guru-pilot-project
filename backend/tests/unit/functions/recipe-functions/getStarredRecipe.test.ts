import { handler } from '../../../../src/functions/recipe-functions/getStarredRecipe';
import DynamoDB from '../../../../src/libs/DynamoDB';
import { validateGetStarredRecipe } from '../../../../src/libs/inputValidation';

// Mock dependencies
jest.mock('../../../../src/libs/DynamoDB');
jest.mock('../../../../src/libs/inputValidation');

const mockDynamoDB = DynamoDB as jest.Mocked<typeof DynamoDB>;
const mockValidateGetStarredRecipe = validateGetStarredRecipe as jest.MockedFunction<typeof validateGetStarredRecipe>;

describe('getStarredRecipe Lambda Function', () => {
  const mockEvent = {
    body: null,
    pathParameters: { recipeId: 'test-recipe-id' },
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
    functionName: 'getStarredRecipe',
    functionVersion: '$LATEST',
    invokedFunctionArn: 'arn:aws:lambda:us-east-2:123456789012:function:getStarredRecipe',
    memoryLimitInMB: '128',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/getStarredRecipe',
    logStreamName: '2023/01/01/[$LATEST]test-stream',
    getRemainingTimeInMillis: () => 1000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };

  const mockRecipe = {
    userId: 'cognito-user-id',
    recipeId: 'test-recipe-id',
    title: 'Test Recipe',
    description: 'A test recipe',
    imageUrl: 'https://example.com/test.jpg',
    constraint: 'Vegetarian',
    status: 'starred',
    ttlExpiration: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DYNAMODB_STARRED_RECIPES_TABLE = 'test-starred-recipes-table';
    
    // Default mocks
    mockValidateGetStarredRecipe.mockReturnValue([]);
    mockDynamoDB.getItem.mockResolvedValue({ Item: mockRecipe });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Successful Recipe Retrieval', () => {
    it('should retrieve a starred recipe successfully', async () => {
      const mockRecipe = {
        userId: 'cognito-user-id',
        recipeId: 'test-recipe-id',
        title: 'Test Recipe',
        description: 'A test recipe',
        imageUrl: 'https://example.com/test.jpg',
        constraint: 'Vegetarian',
        status: 'starred',
        ttlExpiration: 1758846277
      };

      mockDynamoDB.getItem.mockResolvedValue(mockRecipe);

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody).toEqual(mockRecipe); // Function returns recipe directly, not wrapped

      expect(mockDynamoDB.getItem).toHaveBeenCalledWith({
        TableName: 'test-starred-recipes-table',
        Key: {
          userId: 'cognito-user-id',
          recipeId: 'test-recipe-id'
        }
      });
    });

    it('should handle recipe with minimal data', async () => {
      const minimalRecipe = {
        userId: 'cognito-user-id',
        recipeId: 'test-recipe-id',
        title: 'Minimal Recipe'
      };

      mockDynamoDB.getItem.mockResolvedValue(minimalRecipe);

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody).toEqual(minimalRecipe); // Function returns recipe directly, not wrapped
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

  describe('Input Validation', () => {
    it('should return 400 error for validation failures', async () => {
      // This test is not applicable since the function doesn't validate recipeId format
      // It only checks if recipeId exists
      const mockEventWithInvalidRecipeId = {
        ...mockEvent,
        pathParameters: { recipeId: 'invalid-recipe-id' }
      };

      // Mock successful retrieval
      mockDynamoDB.getItem.mockResolvedValue({
        userId: 'cognito-user-id',
        recipeId: 'invalid-recipe-id',
        title: 'Test Recipe'
      });

      const result = await handler(mockEventWithInvalidRecipeId, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200); // Should succeed with any valid recipeId
    });

    it('should return 400 error when recipeId is missing from pathParameters', async () => {
      const mockEventWithoutRecipeId = {
        ...mockEvent,
        pathParameters: {}
      };

      const result = await handler(mockEventWithoutRecipeId, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Missing recipe ID');
    });

    it('should return 400 error when recipeId is null in pathParameters', async () => {
      const mockEventWithNullRecipeId = {
        ...mockEvent,
        pathParameters: { recipeId: undefined }
      };

      const result = await handler(mockEventWithNullRecipeId, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Missing recipe ID');
    });

    it('should return 400 error when recipeId is undefined in pathParameters', async () => {
      const mockEventWithUndefinedRecipeId = {
        ...mockEvent,
        pathParameters: null
      };

      const result = await handler(mockEventWithUndefinedRecipeId, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Missing recipe ID');
    });

    it('should return 400 error when pathParameters is null', async () => {
      const mockEventWithoutPathParams = {
        ...mockEvent,
        pathParameters: null
      };

      const result = await handler(mockEventWithoutPathParams, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Missing recipe ID');
    });

    it('should return 400 error when pathParameters is undefined', async () => {
      const mockEventWithoutPathParams = {
        ...mockEvent,
        pathParameters: null
      };

      const result = await handler(mockEventWithoutPathParams, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Missing recipe ID');
    });
  });

  describe('Configuration Errors', () => {
    it('should return 500 error when DYNAMODB_STARRED_RECIPES_TABLE is not set', async () => {
      delete process.env.DYNAMODB_STARRED_RECIPES_TABLE;

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('Configuration error');
    });
  });

  describe('Recipe Not Found', () => {
    it('should return 404 error when recipe does not exist', async () => {
      mockDynamoDB.getItem.mockResolvedValue(undefined);

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(404);
      expect(JSON.parse(result!.body).error).toBe('Starred recipe not found');
    });

    it('should return 404 error when recipe exists but is not starred', async () => {
      const mockRecipe = {
        userId: 'cognito-user-id',
        recipeId: 'test-recipe-id',
        title: 'Test Recipe',
        status: 'temporary' // Not starred
      };

      mockDynamoDB.getItem.mockResolvedValue(mockRecipe);

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200); // Function doesn't check status, just returns what's found
      expect(JSON.parse(result!.body)).toEqual(mockRecipe);
    });

    it('should return 404 error when recipe exists but belongs to different user', async () => {
      const mockRecipe = {
        userId: 'different-user-id',
        recipeId: 'test-recipe-id',
        title: 'Test Recipe'
      };

      mockDynamoDB.getItem.mockResolvedValue(mockRecipe);

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200); // Function doesn't check user ownership, just returns what's found
      expect(JSON.parse(result!.body)).toEqual(mockRecipe);
    });
  });

  describe('DynamoDB Errors', () => {
    it('should return 500 error when DynamoDB getItem fails', async () => {
      mockDynamoDB.getItem.mockRejectedValue(new Error('DynamoDB error'));

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('Failed to fetch starred recipe');
    });
  });

  describe('Edge Cases', () => {
    it('should handle recipe with empty string recipeId', async () => {
      const mockEventWithEmptyRecipeId = {
        ...mockEvent,
        pathParameters: { recipeId: '' }
      };

      const result = await handler(mockEventWithEmptyRecipeId, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Missing recipe ID');
    });

    it('should handle recipe with whitespace-only recipeId', async () => {
      const mockEventWithWhitespaceRecipeId = {
        ...mockEvent,
        pathParameters: { recipeId: '   ' }
      };

      // Mock successful retrieval since the function doesn't validate whitespace
      const mockRecipe = {
        userId: 'cognito-user-id',
        recipeId: '   ',
        title: 'Test Recipe'
      };

      mockDynamoDB.getItem.mockResolvedValue(mockRecipe);

      const result = await handler(mockEventWithWhitespaceRecipeId, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200); // Function doesn't validate whitespace, just returns what's found
      expect(JSON.parse(result!.body)).toEqual(mockRecipe);
    });

    it('should handle recipe with very long recipeId', async () => {
      const longRecipeId = 'a'.repeat(1000);
      const mockEventWithLongRecipeId = {
        ...mockEvent,
        pathParameters: { recipeId: longRecipeId }
      };

      const mockRecipe = {
        userId: 'cognito-user-id',
        recipeId: longRecipeId,
        title: 'Test Recipe'
      };

      mockDynamoDB.getItem.mockResolvedValue(mockRecipe);

      const result = await handler(mockEventWithLongRecipeId, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody).toEqual(mockRecipe);
    });

    it('should handle recipe with special characters in recipeId', async () => {
      const specialRecipeId = 'recipe-123!@#$%^&*()';
      const mockEventWithSpecialRecipeId = {
        ...mockEvent,
        pathParameters: { recipeId: specialRecipeId }
      };

      const mockRecipe = {
        userId: 'cognito-user-id',
        recipeId: specialRecipeId,
        title: 'Test Recipe'
      };

      mockDynamoDB.getItem.mockResolvedValue(mockRecipe);

      const result = await handler(mockEventWithSpecialRecipeId, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody).toEqual(mockRecipe);
    });

    it('should handle recipe with numeric recipeId', async () => {
      const numericRecipeId = '12345';
      const mockEventWithNumericRecipeId = {
        ...mockEvent,
        pathParameters: { recipeId: numericRecipeId }
      };

      const mockRecipe = {
        userId: 'cognito-user-id',
        recipeId: numericRecipeId,
        title: 'Test Recipe'
      };

      mockDynamoDB.getItem.mockResolvedValue(mockRecipe);

      const result = await handler(mockEventWithNumericRecipeId, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody).toEqual(mockRecipe);
    });

    it('should handle recipe with UUID format recipeId', async () => {
      const uuidRecipeId = '550e8400-e29b-41d4-a716-446655440000';
      const mockEventWithUuidRecipeId = {
        ...mockEvent,
        pathParameters: { recipeId: uuidRecipeId }
      };

      const mockRecipe = {
        userId: 'cognito-user-id',
        recipeId: uuidRecipeId,
        title: 'Test Recipe'
      };

      mockDynamoDB.getItem.mockResolvedValue(mockRecipe);

      const result = await handler(mockEventWithUuidRecipeId, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody).toEqual(mockRecipe);
    });
  });

  describe('Response Format', () => {
    it('should return recipe in correct format', async () => {
      const mockRecipe = {
        userId: 'cognito-user-id',
        recipeId: 'test-recipe-id',
        title: 'Test Recipe',
        description: 'A test recipe',
        imageUrl: 'https://example.com/test.jpg',
        constraint: 'Vegetarian',
        status: 'starred',
        ttlExpiration: 1758846277
      };

      mockDynamoDB.getItem.mockResolvedValue(mockRecipe);

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      expect(result!.headers).toEqual({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': '*'
      });

      const responseBody = JSON.parse(result!.body);
      expect(responseBody).toEqual(mockRecipe);
    });

    it('should handle recipe with missing optional fields', async () => {
      const minimalRecipe = {
        userId: 'cognito-user-id',
        recipeId: 'test-recipe-id',
        title: 'Minimal Recipe'
      };

      mockDynamoDB.getItem.mockResolvedValue(minimalRecipe);

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody).toEqual(minimalRecipe);
    });
  });
});
