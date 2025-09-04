module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // File extensions to test
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.spec.ts'
  ],
  
  // Transform TypeScript files
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  
  // TypeScript configuration
  preset: 'ts-jest',
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Collect coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/types/**/*.ts'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Force exit after tests
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Clear cache
  clearMocks: true,
  
  // Reset mocks between tests
  resetMocks: true,
  
  // Restore mocks after tests
  restoreMocks: true,
  
  // TypeScript configuration for ts-jest
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
};
