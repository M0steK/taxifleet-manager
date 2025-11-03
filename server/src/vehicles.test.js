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

describe('Vehicle API endpoints', () => {
  beforeEach(async () => {
    await prisma.schedule.deleteMany({});
    await prisma.vehicle.deleteMany({});
  });

  afterEach(async () => {
    await prisma.schedule.deleteMany({});
    await prisma.vehicle.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/vehicles', () => {
    it('should create a new vehicle and return 201 code', async () => {
      const newVehicle = {
        brand: 'Opel',
        model: 'Vectra',
        productionYear: 2003,
        licensePlate: 'XYZ-1234',
        vin: '1HGCM82633A123456',
        mileage: 333000,
        status: 'active',
        insuranceExpiry: new Date('2026-05-20'),
        nextInspectionDate: new Date('2026-12-15'),
      };

      const response = await request(app)
        .post('/api/vehicles')
        .send(newVehicle);

      expect(response.statusCode).toBe(201);
      expect(response.body.brand).toBe(newVehicle.brand);
      expect(response.body).toHaveProperty('id');
    });

    it('should return 409 code for already existing license plate', async () => {
      const newVehicle = {
        brand: 'Opel',
        model: 'Vectra',
        productionYear: 2003,
        licensePlate: 'XYZ-1234',
        vin: '1HGCM82633A123456',
        mileage: 333000,
        status: 'active',
        insuranceExpiry: new Date('2026-05-20'),
        nextInspectionDate: new Date('2026-12-15'),
      };

      await prisma.vehicle.create({ data: newVehicle });

      const response = await request(app)
        .post('/api/vehicles')
        .send({
          ...newVehicle,
          vin: '2HGCM82633A654321', // different VIN
        });

      expect(response.statusCode).toBe(409);
    });
  });

  describe('GET /api/vehicles', () => {
    it('should return a list of vechicles with 200 code', async () => {
      await prisma.vehicle.create({
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

      const response = await request(app).get('/api/vehicles');

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].licensePlate).toBe('XYZ-1234');
    });
  });

  describe('GET /api/vehicles/:id', () => {
    it('should return a single vehicle if ID exists with 200 code', async () => {
      const vehicle = await prisma.vehicle.create({
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

      const response = await request(app).get(`/api/vehicles/${vehicle.id}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(vehicle.id);
    });
  });

  describe('PATCH /api/vehicles/:id', () => {
    it('should update vehicle details and return 200 code', async () => {
      const updatedVehicle = await prisma.vehicle.create({
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
      const response = await request(app)
        .patch(`/api/vehicles/${updatedVehicle.id}`)
        .send({
          mileage: 335000,
          status: 'inactive',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.mileage).toBe(335000);
      expect(response.body.status).toBe('inactive');
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('should delete vehicle and return 204 code', async () => {
      const vehicle = await prisma.vehicle.create({
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
      const response = await request(app).delete(`/api/vehicles/${vehicle.id}`);

      expect(response.statusCode).toBe(204);

      const getResponse = await request(app).get(`/api/vehicles/${vehicle.id}`);

      expect(getResponse.statusCode).toBe(404);
    });
  });
});
