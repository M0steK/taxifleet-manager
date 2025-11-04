import dotenv from 'dotenv';

const result = dotenv.config({
  path: './.env.test',
  override: true,
});

if (result.error) {
  console.error(
    'FATAL: Could not load .env.test file in jest.setup.js',
    result.error
  );
  process.exit(1);
}

console.log('--- jest.setup.js loaded ---');
console.log('Using DATABASE_URL:', process.env.DATABASE_URL);

process.env.NODE_ENV = 'test';
//888
