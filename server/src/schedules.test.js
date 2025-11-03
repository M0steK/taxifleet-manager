import request from 'supertest';
import app from './index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

describe('Schedule API endpoints', () => {
  let testUser, testVehicle;

  beforeAll(async () => {
    await prisma.pickupLocation.deleteMany({});
    await prisma.vehicle.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.schedule.deleteMany({});

    testUser = await prisma.user.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test.user@test.com',
        passwordHash: 'password',
        role: 'driver',
      },
    });

    testVehicle = await prisma.vehicle.create({
      data: {
        brand: 'Opel',
        model: 'Vectra',
        productionYear: 2003,
        licensePlate: 'XYZ-1234',
        vin: '1HGCM82633A123456',
        mileage: 333000,
        status: 'active',
        insuranceExpiry: new Date('2026-05-20'),
        nextInspectionDate: new Date('2026-12-15'),
      },
    });
  });

  beforeEach(async () => {
    await prisma.schedule.deleteMany({});
  });

  afterAll(async () => {
    await prisma.pickupLocation.deleteMany({});
    await prisma.schedule.deleteMany({});
    await prisma.vehicle.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/schedules', () => {
    it('should create a new schedule and return 201 code', async () => {
      const newSchedule = {
        userId: testUser.id,
        vehicleId: testVehicle.id,
        startTime: new Date('2025-11-10T08:00:00.000Z'),
        endTime: new Date('2025-11-10T16:00:00.000Z'),
        notes: 'Test',
      };

      const response = await request(app)
        .post('/api/schedules')
        .send(newSchedule);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.userId).toBe(newSchedule.userId);
      expect(response.body.vehicleId).toBe(newSchedule.vehicleId);
      expect(response.body.notes).toBe(newSchedule.notes);
    });

    it('should return 404 if user does not exist', async () => {
      const wrongUserId = '123e4567-e89b-12d3-a456-426614174000';
      const newSchedule = {
        userId: wrongUserId,
        vehicleId: testVehicle.id,
        startTime: new Date('2025-11-10T08:00:00.000Z'),
        endTime: new Date('2025-11-10T16:00:00.000Z'),
        notes: 'Test',
      };

      const response = await request(app)
        .post('/api/schedules')
        .send(newSchedule);

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/schedules', () => {
    it('should return a list of schedules with 200 code', async () => {
      await prisma.schedule.create({
        data: {
          userId: testUser.id,
          vehicleId: testVehicle.id,
          startTime: new Date('2025-11-10T08:00:00.000Z'),
          endTime: new Date('2025-11-10T16:00:00.000Z'),
          notes: 'Test',
        },
      });

      const response = await request(app).get('/api/schedules');

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].user.firstName).toBe('John');
      expect(response.body[0].vehicle.brand).toBe('Opel');
    });
  });

  describe('Get /api/schedules/:id', () => {
    it('should return a single schedule if ID exists with 200 code', async () => {
      const newSchedule = await prisma.schedule.create({
        data: {
          userId: testUser.id,
          vehicleId: testVehicle.id,
          startTime: new Date('2025-11-10T08:00:00.000Z'),
          endTime: new Date('2025-11-10T16:00:00.000Z'),
          notes: 'Test',
        },
      });

      const response = await request(app).get(
        `/api/schedules/${newSchedule.id}`
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(newSchedule.id);
      expect(response.body.user.lastName).toBe('Doe');
    });
  });

  describe('PATCH /api/schedules/:id', () => {
    it('should return updated schedule data with 200 code', async () => {
      const newSchedule = await prisma.schedule.create({
        data: {
          userId: testUser.id,
          vehicleId: testVehicle.id,
          startTime: new Date('2025-11-10T08:00:00.000Z'),
          endTime: new Date('2025-11-10T16:00:00.000Z'),
          notes: 'Test',
        },
      });
      const response = await request(app)
        .patch(`/api/schedules/${newSchedule.id}`)
        .send({
          notes: 'Updated Test',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(newSchedule.id);
      expect(response.body.notes).toBe('Updated Test');
    });
  });

  describe('DELETE /api/schedules/:id', () => {
    it('should delete schedule and return 204 code', async () => {
      const newSchedule = await prisma.schedule.create({
        data: {
          userId: testUser.id,
          vehicleId: testVehicle.id,
          startTime: new Date('2025-11-10T08:00:00.000Z'),
          endTime: new Date('2025-11-10T16:00:00.000Z'),
          notes: 'Test',
        },
      });

      const response = await request(app).delete(
        `/api/schedules/${newSchedule.id}`
      );

      expect(response.statusCode).toBe(204);

      const getResponse = await request(app).get(
        `/api/schedules/${newSchedule.id}`
      );
      expect(getResponse.statusCode).toBe(404);
    });
  });
});
