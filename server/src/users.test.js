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
      expect(response.statusCode).toBe(201);
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

      expect(response.statusCode).toBe(409);
      expect(response.body.error).toBe('User with this email already exists');
    });
  });

  describe('GET /api/users', () => {
    it('should return a list of users with 200 code', async () => {
      await prisma.user.create({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          passwordHash: 'hashedpassword',
        },
      });

      const response = await request(app).get('/api/users');

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].email).toBe('john.doe@example.com');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a single user if ID exists with 200 code', async () => {
      const user = await prisma.user.create({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          passwordHash: 'hashedpassword',
        },
      });

      const response = await request(app).get(`/api/users/${user.id}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(user.id);
      expect(response.body.email).toBe('john.doe@example.com');
    });

    it('should return 404 code if user ID does not exist', async () => {
      const response = await request(app).get('/api/users/9999');

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should return updated user data with 200 code', async () => {
      const user = await prisma.user.create({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          passwordHash: 'hashedpassword',
        },
      });

      const updatedUser = {
        firstName: 'Updated',
        lastName: 'Smith',
        phoneNumber: '123456789',
      };

      const response = await request(app)
        .patch(`/api/users/${user.id}`)
        .send(updatedUser);

      expect(response.statusCode).toBe(200);
      expect(response.body.firstName).toBe(updatedUser.firstName);
      expect(response.body.phoneNumber).toBe(updatedUser.phoneNumber);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should return 204 code on successful delete', async () => {
      const user = await prisma.user.create({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          passwordHash: 'hashedpassword',
        },
      });

      const response = await request(app).delete(`/api/users/${user.id}`);

      expect(response.statusCode).toBe(204);

      const getResponse = await request(app).get(`/api/users/${user.id}`);
      expect(getResponse.statusCode).toBe(404);
    });
  });
});
