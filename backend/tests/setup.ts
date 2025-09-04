// Jest setup file for backend testing

// Mock environment variables
process.env.AWS_REGION = 'us-east-2';
process.env.DYNAMODB_PANTRY_TABLE = 'test-pantry-table';
process.env.DYNAMODB_STARRED_RECIPES_TABLE = 'test-starred-recipes-table';

// Global test utilities
global.testUtils = {
  // Helper to create mock AWS events
  createMockAPIGatewayEvent: (body: any = {}, pathParameters: any = {}) => ({
    body: JSON.stringify(body),
    pathParameters,
    httpMethod: 'POST',
    headers: {},
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
    path: '',
    isBase64Encoded: false,
  }),

  // Helper to create mock context
  createMockContext: () => ({
    callbackWaitsForEmptyEventLoop: true,
    functionName: 'test-function',
    functionVersion: '$LATEST',
    invokedFunctionArn: 'arn:aws:lambda:us-east-2:123456789012:function:test-function',
    memoryLimitInMB: '128',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/test-function',
    logStreamName: '2023/01/01/[$LATEST]test-stream',
    getRemainingTimeInMillis: () => 1000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  }),

  // Helper to wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
};

// Global type declarations
declare global {
  var testUtils: {
    createMockAPIGatewayEvent: (body?: any, pathParameters?: any) => any;
    createMockContext: () => any;
    waitFor: (ms: number) => Promise<void>;
  };
}

export {};
