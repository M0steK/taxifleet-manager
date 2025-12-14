import express from 'express';
import prisma from '../config/database.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', async (req, res) => {
  try {
    const {
      brand,
      model,
      productionYear,
      licensePlate,
      vin,
      status,
      mileage,
      insuranceExpiry,
      nextInspectionDate,
    } = req.body;

    if (
      !brand ||
      !model ||
      !productionYear ||
      !licensePlate ||
      !vin ||
      !status ||
      !mileage ||
      !insuranceExpiry ||
      !nextInspectionDate
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const insDate = new Date(insuranceExpiry);
    const inspDate = new Date(nextInspectionDate);
    const now = new Date();
    const autoStatus = insDate >= now && inspDate >= now ? 'active' : status;

    const newVehicle = await prisma.vehicle.create({
      data: {
        brand,
        model,
        productionYear,
        licensePlate,
        vin,
        status: autoStatus,
        mileage,
        insuranceExpiry: insDate,
        nextInspectionDate: inspDate,
        companyId: req.user.companyId,
      },
    });

    res.status(201).json(newVehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    if (
      error.code === 'P2002' &&
      (error.meta?.target?.includes('license_plate') ||
        error.meta?.target?.includes('vin'))
    ) {
      return res.status(409).json({
        error: 'Vehicle with this license plate or vin already exists',
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        companyId: req.user.companyId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: id,
        companyId: req.user.companyId,
      },
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.status(200).json(vehicle);
  } catch (error) {
    console.error(`Error fetching vehicle with id: ${req.params.id}`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { mileage, status, insuranceExpiry, nextInspectionDate } = req.body;

    const existing = await prisma.vehicle.findUnique({
      where: { id },
      select: { insuranceExpiry: true, nextInspectionDate: true, status: true },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const finalInsurance = insuranceExpiry
      ? new Date(insuranceExpiry)
      : existing.insuranceExpiry;
    const finalInspection = nextInspectionDate
      ? new Date(nextInspectionDate)
      : existing.nextInspectionDate;
    const now = new Date();
    const docsValid = finalInsurance >= now && finalInspection >= now;
    const finalStatus = docsValid ? 'active' : status || existing.status;

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        mileage,
        status: finalStatus,
        insuranceExpiry: insuranceExpiry ? finalInsurance : undefined,
        nextInspectionDate: nextInspectionDate ? finalInspection : undefined,
      },
    });

    res.status(200).json(updatedVehicle);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    console.error(`Error updating vehicle with id: ${req.params.id}`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.vehicle.delete({
      where: {
        id: id,
      },
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    console.error(`Error deleting vehicle with id: ${req.params.id}`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
