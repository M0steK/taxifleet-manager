import express from 'express';
import prisma from '../config/database.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', async (req, res) => {
  try {
    const { userId, latitude, longitude, pickupTimestamp } = req.body;

    if (!userId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // sprawdzenie czy nalezy do firmy
    const user = await prisma.user.findFirst({
      where: { id: userId, companyId: req.user.companyId },
    });
    if (!user) {
      return res
        .status(400)
        .json({ error: 'Invalid user or not in your company' });
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

router.get('/', async (req, res) => {
  try {
    const pickups = await prisma.pickupLocation.findMany({
      where: {
        user: {
          companyId: req.user.companyId,
        },
      },
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

router.get('/recommendations', async (req, res) => {
  try {
    const { day, hour } = req.query;

    const now = new Date();
    // dostosowanie do strefy czasowej jezeli potrzebne
    const targetDay = day !== undefined ? parseInt(day) : now.getDay();
    const targetHour = hour !== undefined ? parseInt(hour) : now.getHours();

    // okno czasowe na godzine przed i po
    const hours = [
      (targetHour - 1 + 24) % 24,
      targetHour,
      (targetHour + 1) % 24,
    ];

    // zapytanie sql do filtracji
    const pickups = await prisma.$queryRaw`
      SELECT * FROM "PickupLocation"
      WHERE EXTRACT(DOW FROM "pickup_timestamp") = ${targetDay}
      AND EXTRACT(HOUR FROM "pickup_timestamp") IN (${hours[0]}, ${hours[1]}, ${hours[2]})
    `;

    // formatowanie odpowiedzi
    const formattedPickups = pickups.map((p) => ({
      id: p.id,
      userId: p.user_id,
      latitude: p.latitude,
      longitude: p.longitude,
      pickupTimestamp: p.pickup_timestamp,
      createdAt: p.created_at,
    }));

    res.status(200).json(formattedPickups);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
