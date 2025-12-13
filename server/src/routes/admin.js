import express from 'express';
import prisma from '../config/database.js';

const router = express.Router();

router.get('/weekly-pickups', async (req, res) => {
  try {
    const now = new Date();
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayOfWeek = today.getDay(); 
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysToMonday - 7); 
    
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    lastSunday.setHours(23, 59, 59, 999);

    const pickups = await prisma.pickupLocation.findMany({
      where: {
        pickupTimestamp: {
          gte: lastMonday,
          lte: lastSunday,
        },
      },
      select: {
        pickupTimestamp: true,
      },
    });

    const weekly = [0, 0, 0, 0, 0, 0, 0];
    pickups.forEach(pickup => {
      const day = pickup.pickupTimestamp.getDay(); 
      const index = day === 0 ? 6 : day - 1;
      weekly[index]++;
    });

    res.status(200).json({ weekly });
  } catch (error) {
    console.error('Error fetching admin weekly pickups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/top-drivers', async (req, res) => {
  try {
    const now = new Date();
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayOfWeek = today.getDay(); 
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysToMonday - 7); 
    
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    lastSunday.setHours(23, 59, 59, 999);

    const pickups = await prisma.pickupLocation.findMany({
      where: {
        pickupTimestamp: {
          gte: lastMonday,
          lte: lastSunday,
        },
      },
      select: {
        userId: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const driverCounts = {};
    pickups.forEach(pickup => {
      const driverId = pickup.userId;
      if (!driverCounts[driverId]) {
        driverCounts[driverId] = {
          userId: driverId,
          firstName: pickup.user.firstName,
          lastName: pickup.user.lastName,
          count: 0,
        };
      }
      driverCounts[driverId].count++;
    });

    const topDrivers = Object.values(driverCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.status(200).json({ topDrivers });
  } catch (error) {
    console.error('Error fetching top drivers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
