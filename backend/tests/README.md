# 🧪 Backend Testing Guide

This directory contains comprehensive unit tests for the KitchenWise backend application, built with Jest and following best practices for AWS Lambda and serverless testing.

## 🏗️ Testing Structure

```
tests/
├── setup.ts                 # Jest configuration and global test utilities
├── unit/                    # Unit tests for individual components
│   ├── libs/               # Tests for utility libraries
│   │   ├── inputValidation.test.ts
│   │   ├── SecretsManager.test.ts
│   │   ├── DynamoDB.test.ts
│   │   └── APIResponses.test.ts
│   └── functions/          # Tests for Lambda function handlers
│       └── pantry-crud/
│           └── createPantryItem.test.ts
├── mocks/                   # Mock data and utilities
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- All dependencies installed (`npm install`)

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:verbose

# Run tests with debug information
npm run test:debug
```

## 🎯 Testing Strategy

### Priority Order
1. **Input Validation** (Security Critical) - `inputValidation.test.ts`
2. **Secrets Management** (API Key Security) - `SecretsManager.test.ts`
3. **Database Operations** (Data Integrity) - `DynamoDB.test.ts`
4. **API Responses** (HTTP Standards) - `APIResponses.test.ts`
5. **Lambda Functions** (Business Logic) - `createPantryItem.test.ts`

### Test Coverage Goals
- **Overall Coverage**: 88%+
- **Critical Functions**: 95%+
- **Utility Libraries**: 90%+
- **Lambda Handlers**: 85%+

## 🧩 Test Categories

### 1. Unit Tests (`unit/`)
- **Individual Function Testing**: Test each function in isolation
- **Mock External Dependencies**: AWS services, external APIs
- **Edge Case Coverage**: Invalid inputs, error conditions
- **Performance Testing**: Timeout handling, memory usage

### 2. Integration Tests (`integration/`)
- **Service Integration**: Test interactions between services
- **API Endpoint Testing**: Full request/response cycles
- **Database Integration**: Real database operations (test environment)

### 3. Mock Data (`mocks/`)
- **AWS Service Mocks**: DynamoDB, Secrets Manager, Cognito
- **Test Data Factories**: Generate consistent test data
- **Event Simulators**: API Gateway events, Lambda contexts

## 🔧 Testing Tools

### Jest Configuration
- **TypeScript Support**: `ts-jest` for `.ts` file compilation
- **Coverage Reporting**: HTML, LCOV, and console output
- **Mock Management**: Automatic mock clearing between tests
- **Timeout Handling**: 10-second timeout for async operations

### AWS SDK Mocking
- **aws-sdk-client-mock**: Official AWS SDK v3 mocking library
- **Service Simulation**: Realistic AWS service responses
- **Error Injection**: Test error handling and fallbacks

### Test Utilities
- **Global Helpers**: `testUtils` for common test operations
- **Mock Event Creation**: API Gateway event simulation
- **Context Simulation**: Lambda context object generation

## 📝 Writing Tests

### Test Structure
```typescript
describe('Component Name', () => {
  describe('Method Name', () => {
    it('should do something specific', async () => {
      // Arrange
      const input = { /* test data */ };
      
      // Act
      const result = await functionUnderTest(input);
      
      // Assert
      expect(result).toBe(expectedValue);
    });
  });
});
```

### Best Practices
1. **Descriptive Test Names**: Use clear, specific descriptions
2. **Arrange-Act-Assert**: Structure tests in three clear sections
3. **Single Responsibility**: Test one behavior per test case
4. **Mock External Dependencies**: Don't rely on real AWS services
5. **Edge Case Coverage**: Test error conditions and boundary values

### Mocking Guidelines
```typescript
// Mock AWS services
const mockDynamoDBClient = mockClient(DynamoDBClient);

// Mock external functions
jest.mock('../../../src/libs/inputValidation');

// Mock environment variables
process.env.TEST_VAR = 'test-value';
```

## 🚨 Common Issues & Solutions

### TypeScript Errors
- **Import Issues**: Ensure correct relative paths
- **Type Definitions**: Install `@types/jest` for Jest types
- **Module Resolution**: Check `tsconfig.json` paths

### Mock Problems
- **Mock Not Working**: Clear mocks between tests with `beforeEach`
- **Async Issues**: Use `async/await` and proper error handling
- **Timeout Errors**: Increase Jest timeout for complex operations

### Coverage Issues
- **Low Coverage**: Add tests for untested code paths
- **Branch Coverage**: Test both success and failure scenarios
- **Line Coverage**: Ensure all code paths are executed

## 📊 Coverage Reports

After running `npm run test:coverage`, view detailed reports:

- **Console Output**: Summary in terminal
- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV File**: `coverage/lcov.info` (for CI/CD integration)

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
- name: Run Tests
  run: |
    cd backend
    npm install
    npm test
    npm run test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./backend/coverage/lcov.info
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test"
    }
  }
}
```

## 🎓 Learning Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [AWS SDK Mocking Guide](https://aws.amazon.com/blogs/developer/mocking-modular-aws-sdk-for-javascript-v3-in-unit-tests/)
- [Serverless Testing Best Practices](https://www.serverless.com/blog/unit-testing-nodejs-serverless-jest)
- [TypeScript Testing Patterns](https://www.typescriptlang.org/docs/handbook/testing.html)

## 🤝 Contributing

When adding new tests:

1. **Follow Naming Convention**: `ComponentName.test.ts`
2. **Group Related Tests**: Use `describe` blocks for organization
3. **Maintain Coverage**: Aim for 90%+ coverage on new code
4. **Update Documentation**: Keep this README current
5. **Run All Tests**: Ensure no regressions before committing

## 📞 Support

For testing questions or issues:

1. Check existing tests for examples
2. Review Jest and AWS SDK documentation
3. Run tests with verbose output for debugging
4. Check test coverage reports for gaps

---

**Happy Testing! 🎉**
