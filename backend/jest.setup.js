// backend/jest.setup.js
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DB_NAME = 'clms_test';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';

// Increase timeout for tests
jest.setTimeout(30000);

// Global teardown
afterAll(async () => {
  // Clean up any open handles
  await new Promise(resolve => setTimeout(resolve, 500));
});