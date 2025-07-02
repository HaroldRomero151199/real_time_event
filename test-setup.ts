// Test setup file for e2e tests
// This file is executed before all tests

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.PORT = '3001';
process.env.SWAGGER_ENABLED = 'false';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.LOG_LEVEL = 'error';

// Increase test timeout for database operations
jest.setTimeout(30000);
