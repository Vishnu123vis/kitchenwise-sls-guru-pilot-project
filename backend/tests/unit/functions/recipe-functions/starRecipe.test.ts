import { handler } from '../../../../src/functions/recipe-functions/starRecipe';
import DynamoDB from '../../../../src/libs/DynamoDB';
import { validateStarRecipe } from '../../../../src/libs/inputValidation';

// Mock dependencies
jest.mock('../../../../src/libs/DynamoDB');
jest.mock('../../../../src/libs/inputValidation');

const mockDynamoDB = DynamoDB as jest.Mocked<typeof DynamoDB>;
const mockValidateStarRecipe = validateStarRecipe as jest.MockedFunction<typeof validateStarRecipe>;

describe('starRecipe Lambda Function', () => {
  const mockEvent = {
    body: JSON.stringify({ recipeId: 'test-recipe-id', action: 'star' }),
    pathParameters: null,
    httpMethod: 'POST',
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
      httpMethod: 'POST',
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
    functionName: 'starRecipe',
    functionVersion: '$LATEST',
    invokedFunctionArn: 'arn:aws:lambda:us-east-2:123456789012:function:starRecipe',
    memoryLimitInMB: '128',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/starRecipe',
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
    status: 'temporary',
    ttlExpiration: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DYNAMODB_STARRED_RECIPES_TABLE = 'test-starred-recipes-table';
    
    // Default mocks
    mockValidateStarRecipe.mockReturnValue([]);
    mockDynamoDB.getItem.mockResolvedValue({ Item: mockRecipe });
    mockDynamoDB.putItem.mockResolvedValue({});
    mockDynamoDB.deleteItem.mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Successful Recipe Starring', () => {
    it('should star a recipe successfully', async () => {
      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.message).toBe('Recipe starred successfully');
      expect(responseBody.recipeId).toBe('test-recipe-id');

      expect(mockValidateStarRecipe).toHaveBeenCalledWith({ 
        recipeId: 'test-recipe-id', 
        action: 'star' 
      });
      expect(mockDynamoDB.getItem).toHaveBeenCalledWith({
        TableName: 'test-starred-recipes-table',
        Key: {
          userId: 'cognito-user-id',
          recipeId: 'test-recipe-id'
        }
      });
      expect(mockDynamoDB.putItem).toHaveBeenCalledWith({
        TableName: 'test-starred-recipes-table',
        Item: expect.objectContaining({
          userId: 'cognito-user-id',
          recipeId: 'test-recipe-id',
          status: 'starred'
        })
      });
    });

    it('should unstar a recipe successfully', async () => {
      const mockEventUnstar = {
        ...mockEvent,
        body: JSON.stringify({ recipeId: 'test-recipe-id', action: 'unstar' })
      };

      const result = await handler(mockEventUnstar, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.message).toBe('Recipe unstarred successfully');
      expect(responseBody.recipeId).toBe('test-recipe-id');

      expect(mockValidateStarRecipe).toHaveBeenCalledWith({ 
        recipeId: 'test-recipe-id', 
        action: 'unstar' 
      });
      expect(mockDynamoDB.deleteItem).toHaveBeenCalledWith({
        TableName: 'test-starred-recipes-table',
        Key: {
          userId: 'cognito-user-id',
          recipeId: 'test-recipe-id'
        }
      });
    });

    it('should handle recipe that is already starred', async () => {
      const mockEventAlreadyStarred = {
        ...mockEvent,
        body: JSON.stringify({ recipeId: 'test-recipe-id', action: 'star' })
      };

      // Mock recipe that is already starred
      mockDynamoDB.getItem.mockResolvedValue({ 
        Item: { ...mockRecipe, status: 'starred' } 
      });

      const result = await handler(mockEventAlreadyStarred, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.message).toBe('Recipe is already starred');
      expect(responseBody.recipeId).toBe('test-recipe-id');

      // Should not call putItem since it's already starred
      expect(mockDynamoDB.putItem).not.toHaveBeenCalled();
    });

    it('should handle recipe that is not starred when trying to unstar', async () => {
      const mockEventNotStarred = {
        ...mockEvent,
        body: JSON.stringify({ recipeId: 'test-recipe-id', action: 'unstar' })
      };

      // Mock recipe that is not starred
      mockDynamoDB.getItem.mockResolvedValue({ 
        Item: { ...mockRecipe, status: 'temporary' } 
      });

      const result = await handler(mockEventNotStarred, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.message).toBe('Recipe is not starred');
      expect(responseBody.recipeId).toBe('test-recipe-id');

      // Should not call deleteItem since it's not starred
      expect(mockDynamoDB.deleteItem).not.toHaveBeenCalled();
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
      const mockValidationErrors = ['Invalid recipe ID', 'Invalid action'];
      mockValidateStarRecipe.mockReturnValue(mockValidationErrors);

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Validation failed');
      expect(JSON.parse(result!.body).details).toEqual(['Invalid recipe ID', 'Invalid action']);
    });

    it('should return 400 error for invalid JSON in request body', async () => {
      const mockEventWithInvalidJSON = {
        ...mockEvent,
        body: 'invalid-json'
      };

      const result = await handler(mockEventWithInvalidJSON, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Invalid JSON in request body');
    });

    it('should return 400 error for missing request body', async () => {
      const mockEventWithoutBody = {
        ...mockEvent,
        body: null
      };

      const result = await handler(mockEventWithoutBody, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Missing request body');
    });

    it('should return 400 error for empty request body', async () => {
      const mockEventWithEmptyBody = {
        ...mockEvent,
        body: ''
      };

      const result = await handler(mockEventWithEmptyBody, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Missing request body');
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
      mockDynamoDB.getItem.mockResolvedValue({ Item: undefined });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(404);
      expect(JSON.parse(result!.body).error).toBe('Recipe not found');
    });
  });

  describe('DynamoDB Errors', () => {
    it('should return 500 error when DynamoDB getItem fails', async () => {
      mockDynamoDB.getItem.mockRejectedValue(new Error('DynamoDB error'));

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('An unexpected error occurred while starring the recipe. Please try again.');
    });

    it('should return 500 error when DynamoDB putItem fails', async () => {
      mockDynamoDB.putItem.mockRejectedValue(new Error('DynamoDB error'));

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('An unexpected error occurred while starring the recipe. Please try again.');
    });

    it('should return 500 error when DynamoDB deleteItem fails', async () => {
      const mockEventUnstar = {
        ...mockEvent,
        body: JSON.stringify({ recipeId: 'test-recipe-id', action: 'unstar' })
      };

      mockDynamoDB.deleteItem.mockRejectedValue(new Error('DynamoDB error'));

      const result = await handler(mockEventUnstar, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('An unexpected error occurred while starring the recipe. Please try again.');
    });
  });

  describe('Edge Cases', () => {
    it('should handle object request body', async () => {
      const mockEventWithObjectBody = {
        ...mockEvent,
        body: { recipeId: 'test-recipe-id', action: 'star' } as any
      };

      const result = await handler(mockEventWithObjectBody, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.message).toBe('Recipe starred successfully');
    });

    it('should handle whitespace-only request body', async () => {
      const mockEventWithWhitespaceBody = {
        ...mockEvent,
        body: '   '
      };

      const result = await handler(mockEventWithWhitespaceBody, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Missing request body');
    });

    it('should handle non-object request body', async () => {
      const mockEventWithNonObjectBody = {
        ...mockEvent,
        body: 'not-an-object'
      };

      const result = await handler(mockEventWithNonObjectBody, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Invalid JSON in request body');
    });

    it('should preserve existing recipe data when starring', async () => {
      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);

      // Verify that all existing recipe data is preserved
      expect(mockDynamoDB.putItem).toHaveBeenCalledWith({
        TableName: 'test-starred-recipes-table',
        Item: expect.objectContaining({
          userId: 'cognito-user-id',
          recipeId: 'test-recipe-id',
          title: 'Test Recipe',
          description: 'A test recipe',
          imageUrl: 'https://example.com/test.jpg',
          constraint: 'Vegetarian',
          status: 'starred',
          ttlExpiration: expect.any(Number)
        })
      });
    });

    it('should handle TTL expiration calculation when starring', async () => {
      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      // Verify TTL is set to approximately 30 days from now
      expect(mockDynamoDB.putItem).toHaveBeenCalledWith({
        TableName: 'test-starred-recipes-table',
        Item: expect.objectContaining({
          ttlExpiration: expect.any(Number)
        })
      });

      const putItemCall = mockDynamoDB.putItem.mock.calls[0][0];
      const ttlValue = putItemCall.Item?.ttlExpiration;
      const now = Math.floor(Date.now() / 1000);
      const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
      
      // TTL should be within 1 second of expected value
      expect(ttlValue).toBeGreaterThan(now + thirtyDaysInSeconds - 1);
      expect(ttlValue).toBeLessThan(now + thirtyDaysInSeconds + 1);
    });
  });

  describe('Action Validation', () => {
    it('should handle invalid action gracefully', async () => {
      const mockEventWithInvalidAction = {
        ...mockEvent,
        body: JSON.stringify({ recipeId: 'test-recipe-id', action: 'invalid-action' })
      };

      const result = await handler(mockEventWithInvalidAction, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.message).toBe('Invalid action. Use "star" or "unstar".');
      expect(responseBody.recipeId).toBe('test-recipe-id');
    });

    it('should handle missing action gracefully', async () => {
      const mockEventWithoutAction = {
        ...mockEvent,
        body: JSON.stringify({ recipeId: 'test-recipe-id' })
      };

      const result = await handler(mockEventWithoutAction, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.message).toBe('Invalid action. Use "star" or "unstar".');
      expect(responseBody.recipeId).toBe('test-recipe-id');
    });
  });
});
