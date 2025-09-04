import { handler } from '../../../../src/functions/pantry-crud/updatePantryItem';
import DynamoDB from '../../../../src/libs/DynamoDB';
import { validateUpdatePantryItem } from '../../../../src/libs/inputValidation';

// Mock dependencies
jest.mock('../../../../src/libs/DynamoDB');
jest.mock('../../../../src/libs/inputValidation');

const mockDynamoDB = DynamoDB as jest.Mocked<typeof DynamoDB>;
const mockValidateUpdatePantryItem = validateUpdatePantryItem as jest.MockedFunction<typeof validateUpdatePantryItem>;

describe('updatePantryItem Lambda Function', () => {
  const mockEvent = {
    body: JSON.stringify({
      title: 'Updated Milk',
      count: 3,
      notes: 'Updated notes'
    }),
    pathParameters: { itemId: 'test-item-id' },
    httpMethod: 'PUT',
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
      httpMethod: 'PUT',
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
    functionName: 'updatePantryItem',
    functionVersion: '$LATEST',
    invokedFunctionArn: 'arn:aws:lambda:us-east-2:123456789012:function:updatePantryItem',
    memoryLimitInMB: '128',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/updatePantryItem',
    logStreamName: '2023/01/01/[$LATEST]test-stream',
    getRemainingTimeInMillis: () => 1000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DYNAMODB_PANTRY_TABLE = 'test-pantry-table';
    mockValidateUpdatePantryItem.mockReturnValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Successful Updates', () => {
    it('should update pantry item successfully with basic fields', async () => {
      const existingItem = {
        userId: 'cognito-user-id',
        sortKey: 'Dairy#Fridge#test-item-id',
        itemId: 'test-item-id',
        title: 'Milk',
        type: 'Dairy',
        location: 'Fridge',
        count: 2,
        notes: 'Old notes'
      };

      const updatedItem = {
        ...existingItem,
        title: 'Updated Milk',
        count: 3,
        notes: 'Updated notes'
      };

      mockDynamoDB.queryItems.mockResolvedValue({
        items: [existingItem],
        lastEvaluatedKey: undefined
      });

      mockDynamoDB.updateItem.mockResolvedValue(updatedItem);

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      expect(JSON.parse(result!.body)).toEqual(updatedItem);

      expect(mockValidateUpdatePantryItem).toHaveBeenCalledWith({
        title: 'Updated Milk',
        count: 3,
        notes: 'Updated notes'
      });

      expect(mockDynamoDB.updateItem).toHaveBeenCalledWith({
        TableName: 'test-pantry-table',
        Key: { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#test-item-id' },
        UpdateExpression: 'SET #title = :title, #count = :count, #notes = :notes',
        ExpressionAttributeNames: {
          '#title': 'title',
          '#count': 'count',
          '#notes': 'notes'
        },
        ExpressionAttributeValues: {
          ':title': 'Updated Milk',
          ':count': 3,
          ':notes': 'Updated notes'
        },
        ConditionExpression: 'attribute_exists(userId) AND attribute_exists(sortKey)',
        ReturnValues: 'ALL_NEW'
      });
    });

    it('should update pantry item with type and location changes', async () => {
      const mockEventWithTypeLocation = {
        ...mockEvent,
        body: JSON.stringify({
          type: 'Produce',
          location: 'Counter'
        })
      };

      const existingItem = {
        userId: 'cognito-user-id',
        sortKey: 'Dairy#Fridge#test-item-id',
        itemId: 'test-item-id',
        title: 'Milk',
        type: 'Dairy',
        location: 'Fridge'
      };

      const updatedItem = {
        ...existingItem,
        type: 'Produce',
        location: 'Counter',
        sortKey: 'Produce#Counter#test-item-id'
      };

      mockDynamoDB.queryItems.mockResolvedValue({
        items: [existingItem],
        lastEvaluatedKey: undefined
      });

      mockDynamoDB.updateItem.mockResolvedValue(updatedItem);

      const result = await handler(mockEventWithTypeLocation, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      expect(JSON.parse(result!.body)).toEqual(updatedItem);

      expect(mockDynamoDB.updateItem).toHaveBeenCalledWith({
        TableName: 'test-pantry-table',
        Key: { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#test-item-id' },
        UpdateExpression: 'SET #type = :type, #location = :location, #sortKey = :sortKey',
        ExpressionAttributeNames: {
          '#type': 'type',
          '#location': 'location',
          '#sortKey': 'sortKey'
        },
        ExpressionAttributeValues: {
          ':type': 'Produce',
          ':location': 'Counter',
          ':sortKey': 'Produce#Counter#test-item-id'
        },
        ConditionExpression: 'attribute_exists(userId) AND attribute_exists(sortKey)',
        ReturnValues: 'ALL_NEW'
      });
    });

    it('should handle partial updates with undefined values', async () => {
      const mockEventWithUndefined = {
        ...mockEvent,
        body: JSON.stringify({
          title: 'Updated Milk',
          count: undefined,
          notes: null
        })
      };

      const existingItem = {
        userId: 'cognito-user-id',
        sortKey: 'Dairy#Fridge#test-item-id',
        itemId: 'test-item-id',
        title: 'Milk',
        type: 'Dairy',
        location: 'Fridge',
        count: 2,
        notes: 'Old notes'
      };

      const updatedItem = {
        ...existingItem,
        title: 'Updated Milk'
      };

      mockDynamoDB.queryItems.mockResolvedValue({
        items: [existingItem],
        lastEvaluatedKey: undefined
      });

      mockDynamoDB.updateItem.mockResolvedValue(updatedItem);

      const result = await handler(mockEventWithUndefined, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);

      // Should only update title, ignore undefined and null values
      expect(mockDynamoDB.updateItem).toHaveBeenCalledWith({
        TableName: 'test-pantry-table',
        Key: { userId: 'cognito-user-id', sortKey: 'Dairy#Fridge#test-item-id' },
        UpdateExpression: 'SET #title = :title',
        ExpressionAttributeNames: {
          '#title': 'title'
        },
        ExpressionAttributeValues: {
          ':title': 'Updated Milk'
        },
        ConditionExpression: 'attribute_exists(userId) AND attribute_exists(sortKey)',
        ReturnValues: 'ALL_NEW'
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
    it('should return 400 error for missing itemId', async () => {
      const mockEventWithoutItemId = {
        ...mockEvent,
        pathParameters: {}
      };

      const result = await handler(mockEventWithoutItemId, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Missing itemId');
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

    it('should return 400 error for validation failures', async () => {
      const mockValidationErrors = ['Title is too long'];
      mockValidateUpdatePantryItem.mockReturnValue(mockValidationErrors);

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Title is too long');
    });

    it('should return 400 error for no valid fields to update', async () => {
      const mockEventWithNoValidFields = {
        ...mockEvent,
        body: JSON.stringify({
          userId: 'different-user-id',
          itemId: 'different-item-id'
        })
      };

      const existingItem = {
        userId: 'cognito-user-id',
        sortKey: 'Dairy#Fridge#test-item-id',
        itemId: 'test-item-id',
        title: 'Milk',
        type: 'Dairy',
        location: 'Fridge'
      };

      mockDynamoDB.queryItems.mockResolvedValue({
        items: [existingItem],
        lastEvaluatedKey: undefined
      });

      const result = await handler(mockEventWithNoValidFields, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('No valid fields to update');
    });
  });

  describe('Item Not Found', () => {
    it('should return 404 error when item is not found during query', async () => {
      mockDynamoDB.queryItems.mockResolvedValue({
        items: [],
        lastEvaluatedKey: undefined
      });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(404);
      expect(JSON.parse(result!.body).error).toBe('Item not found');
    });

    it('should return 404 error when item is not found during update', async () => {
      const existingItem = {
        userId: 'cognito-user-id',
        sortKey: 'Dairy#Fridge#test-item-id',
        itemId: 'test-item-id',
        title: 'Milk',
        type: 'Dairy',
        location: 'Fridge'
      };

      mockDynamoDB.queryItems.mockResolvedValue({
        items: [existingItem],
        lastEvaluatedKey: undefined
      });

      mockDynamoDB.updateItem.mockResolvedValue(null);

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(404);
      expect(JSON.parse(result!.body).error).toBe('Item not found');
    });
  });

  describe('DynamoDB Errors', () => {
    it('should return 500 error when DynamoDB queryItems fails', async () => {
      mockDynamoDB.queryItems.mockRejectedValue(new Error('DynamoDB error'));

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('Failed to update pantry item');
    });

    it('should return 500 error when DynamoDB updateItem fails', async () => {
      const existingItem = {
        userId: 'cognito-user-id',
        sortKey: 'Dairy#Fridge#test-item-id',
        itemId: 'test-item-id',
        title: 'Milk',
        type: 'Dairy',
        location: 'Fridge'
      };

      mockDynamoDB.queryItems.mockResolvedValue({
        items: [existingItem],
        lastEvaluatedKey: undefined
      });

      mockDynamoDB.updateItem.mockRejectedValue(new Error('DynamoDB error'));

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('Failed to update pantry item');
    });

    it('should handle conditional check failure', async () => {
      const existingItem = {
        userId: 'cognito-user-id',
        sortKey: 'Dairy#Fridge#test-item-id',
        itemId: 'test-item-id',
        title: 'Milk',
        type: 'Dairy',
        location: 'Fridge'
      };

      mockDynamoDB.queryItems.mockResolvedValue({
        items: [existingItem],
        lastEvaluatedKey: undefined
      });

      const conditionalError = new Error('ConditionalCheckFailedException');
      conditionalError.name = 'ConditionalCheckFailedException';
      mockDynamoDB.updateItem.mockRejectedValue(conditionalError);

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(404);
      expect(JSON.parse(result!.body).error).toBe('Item not found');
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid JSON in request body', async () => {
      const mockEventWithInvalidJSON = {
        ...mockEvent,
        body: 'invalid-json'
      };

      const result = await handler(mockEventWithInvalidJSON, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('Failed to update pantry item');
    });

    it('should handle empty update data', async () => {
      const mockEventWithEmptyData = {
        ...mockEvent,
        body: JSON.stringify({})
      };

      const existingItem = {
        userId: 'cognito-user-id',
        sortKey: 'Dairy#Fridge#test-item-id',
        itemId: 'test-item-id',
        title: 'Milk',
        type: 'Dairy',
        location: 'Fridge'
      };

      mockDynamoDB.queryItems.mockResolvedValue({
        items: [existingItem],
        lastEvaluatedKey: undefined
      });

      const result = await handler(mockEventWithEmptyData, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('No valid fields to update');
    });

    it('should handle update with only type change', async () => {
      const mockEventWithOnlyType = {
        ...mockEvent,
        body: JSON.stringify({ type: 'Produce' })
      };

      const existingItem = {
        userId: 'cognito-user-id',
        sortKey: 'Dairy#Fridge#test-item-id',
        itemId: 'test-item-id',
        title: 'Milk',
        type: 'Dairy',
        location: 'Fridge'
      };

      const updatedItem = {
        ...existingItem,
        type: 'Produce',
        sortKey: 'Produce#Fridge#test-item-id'
      };

      mockDynamoDB.queryItems.mockResolvedValue({
        items: [existingItem],
        lastEvaluatedKey: undefined
      });

      mockDynamoDB.updateItem.mockResolvedValue(updatedItem);

      const result = await handler(mockEventWithOnlyType, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(200);
      expect(JSON.parse(result!.body).type).toBe('Produce');
      expect(JSON.parse(result!.body).sortKey).toBe('Produce#Fridge#test-item-id');
    });
  });
});
