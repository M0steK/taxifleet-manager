import express from 'express';
import prisma from '../config/database.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    
    const totalVehicles = await prisma.vehicle.count();
    
    const activeSchedules = await prisma.schedule.findMany({
      where: {
        startTime: { lte: now },
        endTime: { gte: now },
      },
      select: { 
        vehicleId: true,
        userId: true,
      },
    });

    const vehicleIdsOnRoad = new Set(activeSchedules.map(s => s.vehicleId));
    const driverIdsOnShift = new Set(activeSchedules.map(s => s.userId));
    
    const vehiclesOnRoadCount = vehicleIdsOnRoad.size;
    const availableVehicles = totalVehicles - vehiclesOnRoadCount;

    const totalDrivers = await prisma.user.count({
      where: { role: 'driver' },
    });
    const availableDrivers = totalDrivers - driverIdsOnShift.size;

    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const upcomingMaintenance = await prisma.vehicle.findMany({
      where: {
        OR: [
          {
            nextInspectionDate: {
              lte: sevenDaysFromNow,
            },
          },
          {
            insuranceExpiry: {
              lte: sevenDaysFromNow,
            },
          },
        ],
      },
      orderBy: {
        nextInspectionDate: 'asc',
      },
      select: {
        id: true,
        brand: true,
        model: true,
        licensePlate: true,
        nextInspectionDate: true,
        insuranceExpiry: true,
      },
    });

    res.status(200).json({
      vehicles: {
        total: totalVehicles,
        available: availableVehicles,
        onRoad: vehiclesOnRoadCount,
      },
      drivers: {
        total: totalDrivers,
        available: availableDrivers,
      },
      upcomingMaintenance,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
