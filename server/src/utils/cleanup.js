import prisma from '../config/database.js';

export const cleanupOldPickups = async () => {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const result = await prisma.pickupLocation.deleteMany({
      where: {
        pickupTimestamp: {
          lt: threeMonthsAgo,
        },
      },
    });
    
    if (result.count > 0) {
      console.log(`[Cleanup] Removed ${result.count} old pickup records.`);
    }
  } catch (error) {
    console.error('[Cleanup] Error cleaning up old pickups:', error);
  }
};
