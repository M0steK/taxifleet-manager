import express from 'express';
import prisma from '../config/database.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', async (req, res) => {
  try {
    const { userId, vehicleId, startTime, endTime, notes } = req.body;

    if (!userId || !vehicleId || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // weryfikacja czy uzytkownik i pojazd naleza do tej samej firmy
    const targetUser = await prisma.user.findFirst({
      where: { id: userId, companyId: req.user.companyId },
    });
    if (!targetUser) {
      return res
        .status(404)
        .json({ error: 'Invalid user or not in your company' });
    }

    const targetVehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, companyId: req.user.companyId },
      select: { status: true, insuranceExpiry: true, nextInspectionDate: true },
    });
    if (!targetVehicle) {
      return res
        .status(404)
        .json({ error: 'Vehicle not found or not in your company' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ error: 'Start must be before end' });
    }

    if (targetVehicle.status !== 'active') {
      return res.status(400).json({ error: 'Pojazd nieaktywny' });
    }
    if (
      targetVehicle.insuranceExpiry < end ||
      targetVehicle.nextInspectionDate < end
    ) {
      return res
        .status(400)
        .json({ error: 'Vehicle documents invalid for entire shift period' });
    }

    const newSchedule = await prisma.schedule.create({
      data: {
        userId,
        vehicleId,
        startTime: start,
        endTime: end,
        notes,
      },
    });

    res.status(201).json(newSchedule);
  } catch (error) {
    console.error('Error creating schedule:', error);
    if (error.code === 'P2003') {
      return res
        .status(404)
        .json({ error: 'The specified user or vehicle does not exist' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({
      where: {
        user: {
          companyId: req.user.companyId,
        },
      },
      orderBy: {
        startTime: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            licensePlate: true,
          },
        },
      },
    });
    res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySchedules = await prisma.schedule.findMany({
      where: {
        startTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: {
        startTime: 'asc',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            licensePlate: true,
          },
        },
      },
    });

    res.status(200).json(todaySchedules);
  } catch (error) {
    console.error('Error fetching today schedules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await prisma.schedule.findUnique({
      where: {
        id: id,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            licensePlate: true,
          },
        },
      },
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.status(200).json(schedule);
  } catch (error) {
    console.error(`Error fetching schedule with id: ${req.params.id}`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, notes, userId, vehicleId } = req.body;

    const data = {
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      notes,
      userId: userId || undefined,
      vehicleId: vehicleId || undefined,
    };

    const existing = await prisma.schedule.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    const effectiveStart = data.startTime || existing.startTime;
    const effectiveEnd = data.endTime || existing.endTime;
    if (effectiveStart >= effectiveEnd) {
      return res.status(400).json({ error: 'Start must be before end' });
    }
    const effectiveVehicleId = data.vehicleId || existing.vehicleId;
    if (data.vehicleId || data.startTime || data.endTime) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: effectiveVehicleId },
        select: {
          status: true,
          insuranceExpiry: true,
          nextInspectionDate: true,
        },
      });
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      if (vehicle.status !== 'active') {
        return res.status(400).json({ error: 'Vehicle not active' });
      }
      if (
        vehicle.insuranceExpiry < effectiveEnd ||
        vehicle.nextInspectionDate < effectiveEnd
      ) {
        return res
          .status(400)
          .json({ error: 'Vehicle documents invalid for entire shift period' });
      }
    }

    const updatedSchedule = await prisma.schedule.update({
      where: { id: id },
      data,
    });

    res.status(200).json(updatedSchedule);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    if (error.code === 'P2003') {
      return res
        .status(404)
        .json({ error: 'The specified user or vehicle does not exist' });
    }
    console.error(`Error updating schedule with id: ${req.params.id}`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.schedule.delete({
      where: {
        id: id,
      },
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    console.error(`Error deleting schedule with id: ${req.params.id}`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
