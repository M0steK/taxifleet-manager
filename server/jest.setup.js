import dotenv from 'dotenv';

// Próbuj załadować .env.test, ale nie przerywaj jeśli nie istnieje (np. w CI)
const result = dotenv.config({
  path: './.env.test',
  override: true,
});

// Tylko w środowisku lokalnym (nie CI) wymagaj pliku .env.test
if (result.error && !process.env.CI) {
  console.error(
    'FATAL: Could not load .env.test file in jest.setup.js',
    result.error
  );
  process.exit(1);
}

// Sprawdź czy DATABASE_URL jest ustawiony
if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL is not set');
  process.exit(1);
}

console.log('--- jest.setup.js loaded ---');
console.log('Using DATABASE_URL:', process.env.DATABASE_URL);

process.env.NODE_ENV = 'test';
