import { handler } from '../../../../src/functions/pantry-crud/getPantryItem';
import DynamoDB from '../../../../src/libs/DynamoDB';
import { validateGetPantryItem } from '../../../../src/libs/inputValidation';

// Mock dependencies
jest.mock('../../../../src/libs/DynamoDB');
jest.mock('../../../../src/libs/inputValidation');

const mockDynamoDB = DynamoDB as jest.Mocked<typeof DynamoDB>;
const mockValidateGetPantryItem = validateGetPantryItem as jest.MockedFunction<typeof validateGetPantryItem>;

describe('getPantryItem Lambda Function', () => {
  const mockEvent = {
    body: null,
    pathParameters: { itemId: 'test-item-id' },
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
    functionName: 'getPantryItem',
    functionVersion: '$LATEST',
    invokedFunctionArn: 'arn:aws:lambda:us-east-2:123456789012:function:getPantryItem',
    memoryLimitInMB: '128',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/getPantryItem',
    logStreamName: '2023/01/01/[$LATEST]test-stream',
    getRemainingTimeInMillis: () => 1000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DYNAMODB_PANTRY_TABLE = 'test-pantry-table';
    // Default to no validation errors for successful cases
    mockValidateGetPantryItem.mockReturnValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Successful Retrieval', () => {
    it('should fetch pantry item successfully', async () => {
      const mockItem = {
        userId: 'cognito-user-id',
        sortKey: 'Dairy#Fridge#test-item-id',
        itemId: 'test-item-id',
        title: 'Milk',
        type: 'Dairy',
        location: 'Fridge',
        count: 2,
        expiryDate: '2024-12-31',
        notes: 'Test notes'
      };

      mockDynamoDB.queryItems.mockResolvedValue({
        items: [mockItem],
        lastEvaluatedKey: undefined
      });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      expect(JSON.parse(result!.body)).toEqual(mockItem);

      expect(mockValidateGetPantryItem).toHaveBeenCalledWith({
        userId: 'cognito-user-id',
        itemId: 'test-item-id'
      });

      expect(mockDynamoDB.queryItems).toHaveBeenCalledWith({
        TableName: 'test-pantry-table',
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: 'itemId = :itemId',
        ExpressionAttributeValues: { 
          ':userId': 'cognito-user-id',
          ':itemId': 'test-item-id'
        }
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

  describe('Input Validation', () => {
    it('should return 400 error for validation failures', async () => {
      const mockValidationErrors = ['Item ID is required'];
      mockValidateGetPantryItem.mockReturnValue(mockValidationErrors);

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Item ID is required');

      expect(mockValidateGetPantryItem).toHaveBeenCalledWith({
        userId: 'cognito-user-id',
        itemId: 'test-item-id'
      });
    });

    it('should return 400 error when itemId is missing', async () => {
      const mockEventWithoutItemId = {
        ...mockEvent,
        pathParameters: {}
      };

      // Mock validation to return error for missing itemId
      mockValidateGetPantryItem.mockReturnValue(['Item ID is required']);

      const result = await handler(mockEventWithoutItemId, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Item ID is required');
    });

    it('should return 400 error when itemId is null', async () => {
      const mockEventWithNullItemId = {
        ...mockEvent,
        pathParameters: { itemId: undefined }
      };

      // Mock validation to return error for undefined itemId
      mockValidateGetPantryItem.mockReturnValue(['Item ID is required']);

      const result = await handler(mockEventWithNullItemId, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Item ID is required');
    });
  });

  describe('Item Not Found', () => {
    it('should return 404 error when item is not found', async () => {
      mockDynamoDB.queryItems.mockResolvedValue({
        items: [],
        lastEvaluatedKey: undefined
      });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(404);
      expect(JSON.parse(result!.body).error).toBe('Item not found');

      expect(mockDynamoDB.queryItems).toHaveBeenCalledWith({
        TableName: 'test-pantry-table',
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: 'itemId = :itemId',
        ExpressionAttributeValues: { 
          ':userId': 'cognito-user-id',
          ':itemId': 'test-item-id'
        }
      });
    });
  });

  describe('DynamoDB Errors', () => {
    it('should return 500 error when DynamoDB queryItems fails', async () => {
      mockDynamoDB.queryItems.mockRejectedValue(new Error('DynamoDB error'));

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('Failed to fetch pantry item');
    });

    it('should return 500 error when DynamoDB queryItems throws', async () => {
      mockDynamoDB.queryItems.mockImplementation(() => {
        throw new Error('DynamoDB error');
      });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('Failed to fetch pantry item');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined pathParameters', async () => {
      const mockEventWithoutPathParams = {
        ...mockEvent,
        pathParameters: null
      };

      // Mock validation to return error for undefined pathParameters
      mockValidateGetPantryItem.mockReturnValue(['Item ID is required']);

      const result = await handler(mockEventWithoutPathParams, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Item ID is required');
    });

    it('should handle empty pathParameters', async () => {
      const mockEventWithEmptyPathParams = {
        ...mockEvent,
        pathParameters: {}
      };

      // Mock validation to return error for empty pathParameters
      mockValidateGetPantryItem.mockReturnValue(['Item ID is required']);

      const result = await handler(mockEventWithEmptyPathParams, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Item ID is required');
    });

    it('should handle multiple items returned (should return first)', async () => {
      const mockItems = [
        {
          userId: 'cognito-user-id',
          sortKey: 'Dairy#Fridge#test-item-id',
          itemId: 'test-item-id',
          title: 'Milk',
          type: 'Dairy',
          location: 'Fridge'
        },
        {
          userId: 'cognito-user-id',
          sortKey: 'Dairy#Fridge#test-item-id-2',
          itemId: 'test-item-id-2',
          title: 'Cheese',
          type: 'Dairy',
          location: 'Fridge'
        }
      ];

      mockDynamoDB.queryItems.mockResolvedValue({
        items: mockItems,
        lastEvaluatedKey: undefined
      });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      expect(JSON.parse(result!.body)).toEqual(mockItems[0]);
    });

    it('should handle item with minimal required fields', async () => {
      const mockItem = {
        userId: 'cognito-user-id',
        sortKey: 'Dairy#Fridge#test-item-id',
        itemId: 'test-item-id',
        title: 'Milk'
      };

      mockDynamoDB.queryItems.mockResolvedValue({
        items: [mockItem],
        lastEvaluatedKey: undefined
      });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      expect(JSON.parse(result!.body)).toEqual(mockItem);
    });
  });
});
