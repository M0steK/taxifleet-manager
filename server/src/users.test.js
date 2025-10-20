import request from 'supertest';
import app from './index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('API User endpoints', () => {
  beforeEach(async () => {
    await prisma.pickupLocation.deleteMany({});
    await prisma.schedule.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterEach(async () => {
    await prisma.pickupLocation.deleteMany({});
    await prisma.schedule.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/users', () => {
    it('should create a new user and return 201 code', async () => {
      const newUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test.user@test.com',
        password: 'password',
        role: 'driver',
      };

      const response = await request(app).post('/api/users').send(newUser);

      expect(response.body).toHaveProperty('id');
      expect(response.status).toBe(201);
      expect(response.body).not.toHaveProperty('passwordHash');
      expect(response.body.email).toBe(newUser.email);
    });

    it('should return 409 code for already existing email', async () => {
      const existingUser = {
        firstName: 'Existing',
        lastName: 'User',
        email: 'existing.user@example.com',
        password: 'password',
      };
      await request(app).post('/api/users').send(existingUser);

      const response = await request(app).post('/api/users').send(existingUser);

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('User with this email already exists');
    });
  });
});
