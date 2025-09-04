import { handler } from '../../../../src/functions/pantry-crud/createPantryItem';
import DynamoDB from '../../../../src/libs/DynamoDB';
import { validateCreatePantryItem } from '../../../../src/libs/inputValidation';
import { v4 as uuidv4 } from 'uuid';

// Mock dependencies
jest.mock('../../../../src/libs/DynamoDB');
jest.mock('../../../../src/libs/inputValidation');
jest.mock('uuid');

const mockDynamoDB = DynamoDB as jest.Mocked<typeof DynamoDB>;
const mockValidateCreatePantryItem = validateCreatePantryItem as jest.MockedFunction<typeof validateCreatePantryItem>;
const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>;

describe('createPantryItem Lambda Function', () => {
  const mockEvent = {
    body: JSON.stringify({
      title: 'Test Item',
      type: 'Dairy',
      location: 'Fridge',
      count: 2,
      expiryDate: '2024-12-31',
      notes: 'Test notes'
    }),
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
    functionName: 'createPantryItem',
    functionVersion: '$LATEST',
    invokedFunctionArn: 'arn:aws:lambda:us-east-2:123456789012:function:createPantryItem',
    memoryLimitInMB: '128',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/createPantryItem',
    logStreamName: '2023/01/01/[$LATEST]test-stream',
    getRemainingTimeInMillis: () => 1000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUuidv4.mockReturnValue('test-uuid' as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Successful Creation', () => {
    it('should create pantry item successfully with valid input', async () => {
      const mockValidatedInput = {
        title: 'Test Item',
        type: 'Dairy',
        location: 'Fridge',
        count: 2,
        expiryDate: '2024-12-31',
        notes: 'Test notes'
      };

      mockValidateCreatePantryItem.mockReturnValue([]);
      mockDynamoDB.putItem.mockResolvedValue(mockValidatedInput);

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(201);
      expect(JSON.parse(result!.body)).toMatchObject({
        itemId: 'test-uuid',
        title: 'Test Item',
        type: 'Dairy',
        location: 'Fridge',
        count: 2,
        expiryDate: '2024-12-31',
        notes: 'Test notes'
      });

      expect(mockValidateCreatePantryItem).toHaveBeenCalledWith(mockValidatedInput);
      expect(mockUuidv4).toHaveBeenCalled();
      expect(mockDynamoDB.putItem).toHaveBeenCalledWith({
        TableName: 'test-pantry-table',
        Item: {
          itemId: 'test-uuid',
          userId: 'cognito-user-id',
          sortKey: 'Dairy#Fridge#test-uuid',
          ...mockValidatedInput
        }
      });
    });

    it('should create pantry item with Cognito user ID from event', async () => {
      const mockEventWithUser = {
        ...mockEvent,
        requestContext: {
          authorizer: {
            claims: {
              sub: 'cognito-user-id'
            }
          }
        } as any
      };

      const mockValidatedInput = {
        title: 'Test Item',
        type: 'Dairy',
        location: 'Fridge',
        count: 1
      };

      mockValidateCreatePantryItem.mockReturnValue([]);
      mockDynamoDB.putItem.mockResolvedValue(mockValidatedInput);

      const result = await handler(mockEventWithUser, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(201);
      expect(JSON.parse(result!.body).userId).toBe('cognito-user-id');
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 error for validation failures', async () => {
      const mockValidationErrors = ['Title is required', 'Invalid type'];
      mockValidateCreatePantryItem.mockReturnValue(mockValidationErrors);

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Title is required, Invalid type');
      expect(mockDynamoDB.putItem).not.toHaveBeenCalled();
    });
  });

  describe('Authentication Errors', () => {
    it('should return 401 error when user is not authenticated', async () => {
      const mockEventWithoutUser = {
        ...mockEvent,
        requestContext: {
          accountId: '123456789012',
          apiId: 'test-api',
          authorizer: {},
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
        } as any
      };

      const result = await handler(mockEventWithoutUser, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(401);
      expect(JSON.parse(result!.body).error).toBe('Unauthorized');
    });
  });

  describe('Request Body Errors', () => {
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

    it('should return 500 error for invalid JSON in body', async () => {
      const mockEventWithInvalidBody = {
        ...mockEvent,
        body: 'invalid-json'
      };

      const result = await handler(mockEventWithInvalidBody, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('Failed to create pantry item');
    });
  });

  describe('DynamoDB Errors', () => {
    it('should return 500 error when DynamoDB putItem fails', async () => {
      mockValidateCreatePantryItem.mockReturnValue([]);
      mockDynamoDB.putItem.mockRejectedValue(new Error('DynamoDB error'));

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('Failed to create pantry item');
    });

    it('should return 500 error when DynamoDB putItem throws', async () => {
      mockValidateCreatePantryItem.mockReturnValue([]);
      mockDynamoDB.putItem.mockImplementation(() => {
        throw new Error('DynamoDB error');
      });

      const result = await handler(mockEvent, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(500);
      expect(JSON.parse(result!.body).error).toBe('Failed to create pantry item');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty object in request body', async () => {
      const mockEventWithEmptyBody = {
        ...mockEvent,
        body: JSON.stringify({})
      };

      const mockValidationErrors = ['Title is required'];
      mockValidateCreatePantryItem.mockReturnValue(mockValidationErrors);

      const result = await handler(mockEventWithEmptyBody, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Title is required');
    });

    it('should handle null values in request body', async () => {
      const mockEventWithNullValues = {
        ...mockEvent,
        body: JSON.stringify({
          title: 'Test Item',
          type: null,
          location: null,
          count: null
        })
      };

      const mockValidationErrors = ['Invalid type', 'Invalid location', 'Invalid count'];
      mockValidateCreatePantryItem.mockReturnValue(mockValidationErrors);

      const result = await handler(mockEventWithNullValues, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Invalid type, Invalid location, Invalid count');
    });

    it('should handle undefined values in request body', async () => {
      const mockEventWithUndefinedValues = {
        ...mockEvent,
        body: JSON.stringify({
          title: 'Test Item',
          type: undefined,
          location: undefined,
          count: undefined
        })
      };

      const mockValidationErrors = ['Invalid type', 'Invalid location', 'Invalid count'];
      mockValidateCreatePantryItem.mockReturnValue(mockValidationErrors);

      const result = await handler(mockEventWithUndefinedValues, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(400);
      expect(JSON.parse(result!.body).error).toBe('Invalid type, Invalid location, Invalid count');
    });

    it('should handle special characters in title and notes', async () => {
      const mockEventWithSpecialChars = {
        ...mockEvent,
        body: JSON.stringify({
          title: 'Test Item with @#$%^&*()',
          type: 'Dairy',
          location: 'Fridge',
          count: 1,
          notes: 'Notes with special chars: @#$%^&*()'
        })
      };

      const mockValidatedInput = {
        title: 'Test Item with @#$%^&*()',
        type: 'Dairy',
        location: 'Fridge',
        count: 1,
        notes: 'Notes with special chars: @#$%^&*()'
      };

      mockValidateCreatePantryItem.mockReturnValue([]);
      mockDynamoDB.putItem.mockResolvedValue(mockValidatedInput);

      const result = await handler(mockEventWithSpecialChars, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(201);
      expect(JSON.parse(result!.body).title).toBe('Test Item with @#$%^&*()');
      expect(JSON.parse(result!.body).notes).toBe('Notes with special chars: @#$%^&*()');
    });

    it('should handle very long title and notes', async () => {
      const longTitle = 'A'.repeat(100);
      const longNotes = 'B'.repeat(500);

      const mockEventWithLongText = {
        ...mockEvent,
        body: JSON.stringify({
          title: longTitle,
          type: 'Dairy',
          location: 'Fridge',
          count: 1,
          notes: longNotes
        })
      };

      const mockValidatedInput = {
        title: longTitle,
        type: 'Dairy',
        location: 'Fridge',
        count: 1,
        notes: longNotes
      };

      mockValidateCreatePantryItem.mockReturnValue([]);
      mockDynamoDB.putItem.mockResolvedValue(mockValidatedInput);

      const result = await handler(mockEventWithLongText, mockContext, jest.fn());

      expect(result).toBeDefined();
      expect(result!.statusCode).toBe(201);
      expect(JSON.parse(result!.body).title).toBe(longTitle);
      expect(JSON.parse(result!.body).notes).toBe(longNotes);
    });
  });
});
