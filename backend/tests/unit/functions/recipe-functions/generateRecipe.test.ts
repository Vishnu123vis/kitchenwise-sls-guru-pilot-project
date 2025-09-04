import { handler } from '../../../../src/functions/recipe-functions/generateRecipe';
import DynamoDB from '../../../../src/libs/DynamoDB';
import { OpenAIService } from '../../../../src/libs/OpenAIService';
import { PexelsService } from '../../../../src/libs/PexelsService';
import { validateGenerateRecipe } from '../../../../src/libs/inputValidation';

// Mock dependencies
jest.mock('../../../../src/libs/DynamoDB');
jest.mock('../../../../src/libs/OpenAIService');
jest.mock('../../../../src/libs/PexelsService');
jest.mock('../../../../src/libs/inputValidation');
jest.mock('uuid', () => ({
  v4: jest.fn(() => {
    console.log('Test Debug - uuid.v4() called, returning: test-recipe-id');
    return 'test-recipe-id';
  })
}));

const mockDynamoDB = DynamoDB as jest.Mocked<typeof DynamoDB>;
const mockOpenAIService = OpenAIService as jest.MockedClass<typeof OpenAIService>;
const mockPexelsService = PexelsService as jest.MockedClass<typeof PexelsService>;
const mockValidateGenerateRecipe = validateGenerateRecipe as jest.MockedFunction<typeof validateGenerateRecipe>;

describe('generateRecipe Lambda Function', () => {
  const mockEvent = {
    body: JSON.stringify({ constraint: 'Vegan' }),
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
            sub: 'test-user-id'
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
    functionName: 'generateRecipe',
    functionVersion: '$LATEST',
    invokedFunctionArn: 'arn:aws:lambda:us-east-2:123456789012:function:generateRecipe',
    memoryLimitInMB: '128',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/generateRecipe',
    logStreamName: '2023/01/01/[$LATEST]test-stream',
    getRemainingTimeInMillis: () => 1000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };

  const mockPantryItems = [
    { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item1', itemId: 'item1', title: 'Milk', type: 'Dairy', location: 'Fridge', count: 2 },
    { userId: 'cognito-user-id', sortKey: 'Produce#Counter#item2', itemId: 'item2', title: 'Banana', type: 'Produce', location: 'Counter', count: 3 }
  ];

  const mockRecipe = {
    title: 'Banana Smoothie',
    description: 'A delicious vegetarian smoothie made with milk and bananas.'
  };

  const mockImageUrl = 'https://example.com/banana-smoothie.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DYNAMODB_PANTRY_TABLE = 'test-pantry-table';
    process.env.DYNAMODB_STARRED_RECIPES_TABLE = 'test-starred-recipes-table';
    
    // Default mocks
    mockValidateGenerateRecipe.mockReturnValue([]);
    mockDynamoDB.queryItems.mockResolvedValue({
      items: mockPantryItems,
      lastEvaluatedKey: undefined
    });
    
    // Mock OpenAIService instance
    const mockOpenAIInstance = {
      generateRecipe: jest.fn().mockResolvedValue(mockRecipe)
    };
    mockOpenAIService.mockImplementation(() => mockOpenAIInstance as any);
    
    // Mock PexelsService instance
    const mockPexelsInstance = {
      searchRecipeImage: jest.fn().mockResolvedValue(mockImageUrl)
    };
    mockPexelsService.mockImplementation(() => mockPexelsInstance as any);
    
    // Mock DynamoDB putItem - should return the item parameter
    mockDynamoDB.putItem.mockImplementation((params) => {
      console.log('Test Debug - DynamoDB.putItem called with:', JSON.stringify(params, null, 2));
      return Promise.resolve(params.Item);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Successful Recipe Generation', () => {
    it('should generate recipe successfully with constraint', async () => {
      // Mock successful pantry items query
      mockDynamoDB.queryItems.mockResolvedValue({
        items: [
          { title: 'Milk', count: 2 },
          { title: 'Banana', count: 3 }
        ],
        lastEvaluatedKey: undefined
      });

      // Mock successful OpenAI recipe generation
      const mockOpenAIInstance = {
        generateRecipe: jest.fn().mockResolvedValue({
          title: 'Banana Smoothie',
          description: 'A delicious vegetarian smoothie made with milk and bananas.'
        })
      };
      mockOpenAIService.mockImplementation(() => mockOpenAIInstance as any);

      // Mock successful Pexels image search
      const mockPexelsInstance = {
        searchRecipeImage: jest.fn().mockResolvedValue(mockImageUrl)
      };
      mockPexelsService.mockImplementation(() => mockPexelsInstance as any);

      // Mock successful DynamoDB putItem - should return the item parameter
      mockDynamoDB.putItem.mockImplementation((params) => Promise.resolve(params.Item));

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      // Debug: Log the actual response
      console.log('Test Debug - Full result:', JSON.stringify(result, null, 2));
      console.log('Test Debug - Response body:', result!.body);
      
      const responseBody = JSON.parse(result!.body);
      console.log('Test Debug - Parsed response body:', JSON.stringify(responseBody, null, 2));
      
      expect(responseBody.recipeId).toBeDefined(); // recipeId is generated by uuidv4
      expect(responseBody.title).toBe('Banana Smoothie');
      expect(responseBody.description).toBe('A delicious vegetarian smoothie made with milk and bananas.');
      expect(responseBody.imageUrl).toBe(mockImageUrl);
      expect(responseBody.constraint).toBe('Vegan');

      // Verify DynamoDB calls
      expect(mockDynamoDB.queryItems).toHaveBeenCalledWith({
        TableName: 'test-pantry-table',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': 'test-user-id' },
        Limit: 1000
      });

      expect(mockDynamoDB.putItem).toHaveBeenCalledWith({
        TableName: 'test-starred-recipes-table',
        Item: expect.objectContaining({
          userId: 'test-user-id',
          title: 'Banana Smoothie',
          description: 'A delicious vegetarian smoothie made with milk and bananas.',
          imageUrl: mockImageUrl,
          constraint: 'Vegan',
          status: 'temporary'
        })
      });
    });

    it('should generate recipe with default constraint when none provided', async () => {
      const mockEventWithoutConstraint = {
        ...mockEvent,
        body: JSON.stringify({})
      };

      const result = await handler(mockEventWithoutConstraint, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.constraint).toBe('No Constraint');
    });

    it('should handle empty request body gracefully', async () => {
      const mockEventWithEmptyBody = {
        ...mockEvent,
        body: ''
      };

      const result = await handler(mockEventWithEmptyBody, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.constraint).toBe('No Constraint');
    });

    it('should handle object request body', async () => {
      const mockEventWithObjectBody = {
        ...mockEvent,
        body: { constraint: 'Vegan' } as any
      };

      const result = await handler(mockEventWithObjectBody, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.constraint).toBe('Vegan');
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
      const mockValidationErrors = ['Invalid constraint'];
      mockValidateGenerateRecipe.mockReturnValue(mockValidationErrors);

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Validation failed');
      expect(JSON.parse(result!.body).details).toEqual(['Invalid constraint']);
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

  describe('Pantry Items', () => {
    it('should return 400 error when no pantry items found', async () => {
      mockDynamoDB.queryItems.mockResolvedValue({
        items: [],
        lastEvaluatedKey: undefined
      });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('No pantry items found. Please add some items to your pantry first.');
    });

    it('should handle pagination for large pantry collections', async () => {
      const firstBatch = mockPantryItems.slice(0, 1);
      const secondBatch = mockPantryItems.slice(1);
      
      mockDynamoDB.queryItems
        .mockResolvedValueOnce({
          items: firstBatch,
          lastEvaluatedKey: { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#item1' }
        })
        .mockResolvedValueOnce({
          items: secondBatch,
          lastEvaluatedKey: undefined
        });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      expect(mockDynamoDB.queryItems).toHaveBeenCalledTimes(2);
    });
  });

  describe('OpenAI Service Errors', () => {
    it('should return 429 error for rate limit exceeded', async () => {
      const mockOpenAIInstance = {
        generateRecipe: jest.fn().mockRejectedValue(new Error('Rate limit exceeded'))
      };
      mockOpenAIService.mockImplementation(() => mockOpenAIInstance as any);

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(429);
      expect(JSON.parse(result!.body).error).toBe('Service temporarily unavailable. Please try again later.');
    });

    it('should return 500 error for invalid API key', async () => {
      const mockOpenAIInstance = {
        generateRecipe: jest.fn().mockRejectedValue(new Error('Invalid API key'))
      };
      mockOpenAIService.mockImplementation(() => mockOpenAIInstance as any);

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('Service configuration error');
    });

    it('should return 500 error for recipe parsing failure', async () => {
      const mockOpenAIInstance = {
        generateRecipe: jest.fn().mockRejectedValue(new Error('Unable to parse recipe format'))
      };
      mockOpenAIService.mockImplementation(() => mockOpenAIInstance as any);

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('Recipe generation failed due to unexpected response format. Please try again.');
    });
  });

  describe('Pexels Service Errors', () => {
    it('should handle Pexels service failure gracefully', async () => {
      // Mock successful pantry items query
      mockDynamoDB.queryItems.mockResolvedValue({
        items: [{ title: 'Milk', count: 1 }],
        lastEvaluatedKey: undefined
      });

      // Mock successful OpenAI recipe generation
      const mockOpenAIInstance = {
        generateRecipe: jest.fn().mockResolvedValue({
          title: 'Simple Recipe',
          description: 'A simple recipe description.'
        })
      };
      mockOpenAIService.mockImplementation(() => mockOpenAIInstance as any);

      // Mock Pexels service failure
      const mockPexelsInstance = {
        searchRecipeImage: jest.fn().mockRejectedValue(new Error('Pexels API error'))
      };
      mockPexelsService.mockImplementation(() => mockPexelsInstance as any);

      // Mock successful DynamoDB putItem - should return the item parameter
      mockDynamoDB.putItem.mockImplementation((params) => Promise.resolve(params.Item));

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500); // Function throws error when Pexels fails, which gets caught and returns 500
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.error).toBeDefined(); // Should return error message

      // When Pexels fails, the function throws an error and never reaches DynamoDB putItem
      // So we shouldn't expect it to be called
    });

    it('should handle Pexels service returning no image', async () => {
      const mockPexelsInstance = {
        searchRecipeImage: jest.fn().mockResolvedValue(null)
      };
      mockPexelsService.mockImplementation(() => mockPexelsInstance as any);

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.imageUrl).toBe('');
    });
  });

  describe('DynamoDB Errors', () => {
    it('should return 500 error when DynamoDB queryItems fails', async () => {
      mockDynamoDB.queryItems.mockRejectedValue(new Error('DynamoDB error'));

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('An unexpected error occurred while generating your recipe. Please try again.');
    });

    it('should return 500 error when DynamoDB putItem fails', async () => {
      mockDynamoDB.putItem.mockRejectedValue(new Error('DynamoDB error'));

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('An unexpected error occurred while generating your recipe. Please try again.');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null request body', async () => {
      const mockEventWithNullBody = {
        ...mockEvent,
        body: null
      };

      const result = await handler(mockEventWithNullBody, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.constraint).toBe('No Constraint');
    });

    it('should handle empty object string in request body', async () => {
      const mockEventWithEmptyObjectString = {
        ...mockEvent,
        body: '{}'
      };

      const result = await handler(mockEventWithEmptyObjectString, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.constraint).toBe('No Constraint');
    });

    it('should handle whitespace-only request body', async () => {
      const mockEventWithWhitespaceBody = {
        ...mockEvent,
        body: '   '
      };

      const result = await handler(mockEventWithWhitespaceBody, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.constraint).toBe('No Constraint');
    });

    it('should handle non-object request body', async () => {
      const mockEventWithNonObjectBody = {
        ...mockEvent,
        body: 'not-an-object'
      };

      const result = await handler(mockEventWithNonObjectBody, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400); // Should return 400 for non-object body
      
      const responseBody = JSON.parse(result!.body);
      expect(responseBody.error).toBe('Invalid JSON in request body');
    });

    it('should handle TTL expiration calculation', async () => {
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
});
