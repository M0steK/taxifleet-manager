import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', message: 'Server is running' });
});

// ----------------- User Endpoints ---------------- //
app.post('/api/users', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, role } =
      req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        passwordHash: hashedPassword,
        phoneNumber: phoneNumber,
        role: role,
      },
    });

    delete newUser.passwordHash;

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res
        .status(409)
        .json({ error: 'User with this email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    users.forEach((user) => delete user.passwordHash);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    delete user.passwordHash;

    res.status(200).json(user);
  } catch (error) {
    console.error(`Error fetching user with id: ${req.params.id}`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phoneNumber, role } = req.body;

    const updatedUser = await prisma.user.update({
      where: {
        id: id,
      },

      data: {
        firstName,
        lastName,
        phoneNumber,
        role,
      },
    });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    delete updatedUser.passwordHash;

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(`Error updating user with id: ${req.params.id}`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: {
        id: id,
      },
    });

    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    console.error(`Error deleting user with id: ${req.params.id}`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------------- Vehicle Endpoints ---------------- //

app.post('/api/vehicles', async (req, res) => {
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
    const newVehicle = await prisma.vehicle.create({
      data: {
        brand,
        model,
        productionYear,
        licensePlate,
        vin,
        status,
        mileage,
        insuranceExpiry: new Date(insuranceExpiry),
        nextInspectionDate: new Date(nextInspectionDate),
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

app.get('/api/vehicles', async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
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

app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id: id,
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

app.patch('/api/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { mileage, status, insuranceExpiry, nextInspectionDate } = req.body;

    const updatedVehicle = await prisma.vehicle.update({
      where: {
        id: id,
      },
      data: {
        mileage,
        status,
        insuranceExpiry: insuranceExpiry
          ? new Date(insuranceExpiry)
          : undefined,
        nextInspectionDate: nextInspectionDate
          ? new Date(nextInspectionDate)
          : undefined,
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

app.delete('/api/vehicles/:id', async (req, res) => {
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

// ---------------------- schedules ---------------------------- //

app.post('/api/schedules', async (req, res) => {
  try {
    const { userId, vehicleId, startTime, endTime, notes } = req.body;

    if (!userId || !vehicleId || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newSchedule = await prisma.schedule.create({
      data: {
        userId,
        vehicleId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
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

app.get('/api/schedules', async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({
      orderBy: {
        createdAt: 'desc',
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
    res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/schedules/:id', async (req, res) => {
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

app.patch('/api/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, notes } = req.body;

    const updatedSchedule = await prisma.schedule.update({
      where: {
        id: id,
      },
      data: {
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        notes,
      },
    });

    res.status(200).json(updatedSchedule);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    console.error(`Error updating schedule with id: ${req.params.id}`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/schedules/:id', async (req, res) => {
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

// ---------------------- Pickup Locations ---------------------------- //

app.post('/api/pickups', async (req, res) => {
  try {
    const { userId, latitude, longitude, pickupTimestamp } = req.body;

    if (!userId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newPickup = await prisma.pickupLocation.create({
      data: {
        userId,
        latitude,
        longitude,
        pickupTimestamp: pickupTimestamp
          ? new Date(pickupTimestamp)
          : new Date(),
      },
    });

    res.status(201).json(newPickup);
  } catch (error) {
    console.error('Error creating pickup:', error);
    if (error.code === 'P2003') {
      return res
        .status(404)
        .json({ error: 'The specified user does not exist' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/pickups', async (req, res) => {
  try {
    const pickups = await prisma.pickupLocation.findMany({
      orderBy: {
        pickupTimestamp: 'desc',
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    res.status(200).json(pickups);
  } catch (error) {
    console.error('Error fetching pickups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`);
  });
}
