import dotenv from 'dotenv';

const result = dotenv.config({ path: './.env.test' });

if (result.error) {
  console.error(
    'FATAL: Could not load .env.test file in jest.setup.js',
    result.error
  );
  process.exit(1);
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

console.log('--- jest.setup.js loaded ---');
console.log('Using DATABASE_URL:', process.env.DATABASE_URL);

process.env.NODE_ENV = 'test';
