import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const CZESTOCHOWA_CENTER = { lat: 50.8118, lng: 19.1203 };

function generateCzestochowaCoordinates() {
  const latOffset = (Math.random() - 0.5) * 0.05;
  const lngOffset = (Math.random() - 0.5) * 0.07;

  return {
    latitude: CZESTOCHOWA_CENTER.lat + latOffset,
    longitude: CZESTOCHOWA_CENTER.lng + lngOffset,
  };
}

function generateLastWeekTimestamp() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const randomTime =
    sevenDaysAgo.getTime() +
    Math.random() * (now.getTime() - sevenDaysAgo.getTime());
  return new Date(randomTime);
}

async function seedPickups() {
  const userId = '98f2fbe6-c6af-468a-8d28-e7108e622854';
  const numberOfPickups = 873;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    console.error(`User with ID ${userId} not found!`);
    process.exit(1);
  }

  console.log(`Seeding pickups for user: ${user.firstName} ${user.lastName}`);

  const pickups = [];

  for (let i = 0; i < numberOfPickups; i++) {
    const coords = generateCzestochowaCoordinates();
    const timestamp = generateLastWeekTimestamp();

    pickups.push({
      userId,
      latitude: coords.latitude,
      longitude: coords.longitude,
      pickupTimestamp: timestamp,
    });
  }

  pickups.sort((a, b) => a.pickupTimestamp - b.pickupTimestamp);

  console.log(`Inserting ${numberOfPickups} pickup locations...`);

  const result = await prisma.pickupLocation.createMany({
    data: pickups,
  });

  console.log(`Successfully inserted ${result.count} pickup locations`);

  const days = ['Niedz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];
  const distribution = {};

  pickups.forEach((p) => {
    const day = days[p.pickupTimestamp.getDay()];
    distribution[day] = (distribution[day] || 0) + 1;
  });

  console.log('\nRozkład odbiorów po dniach tygodnia:');
  Object.entries(distribution).forEach(([day, count]) => {
    console.log(`  ${day}: ${count}`);
  });
}

seedPickups()
  .catch((e) => {
    console.error('Error seeding pickups:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
