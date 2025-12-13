import express from 'express';
import prisma from '../config/database.js';
import { 
  getShiftWindow, 
  formatLocalDate, 
  getCurrentWeekDates, 
  getWeekDates 
} from '../utils/shiftHelpers.js';

const router = express.Router();

router.get('/:userId/dashboard', async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();

    const currentShift = await prisma.schedule.findFirst({
      where: {
        userId,
        startTime: { lte: now },
        endTime: { gte: now },
      },
      include: {
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            licensePlate: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    const nextShift = await prisma.schedule.findFirst({
      where: {
        userId,
        startTime: { gt: now },
      },
      include: {
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            licensePlate: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    const assignedVehicle = currentShift?.vehicle || nextShift?.vehicle || null;

    let pickupsSummary = {
      count: 0,
      avgMinutesBetweenPickups: null,
    };

    if (currentShift) {
      const pickups = await prisma.pickupLocation.findMany({
        where: {
          userId,
          pickupTimestamp: {
            gte: currentShift.startTime,
            lte: currentShift.endTime,
          },
        },
        orderBy: { pickupTimestamp: 'asc' },
        select: { pickupTimestamp: true },
      });

      const count = pickups.length;
      let avgMinutesBetweenPickups = null;
      if (count > 1) {
        let totalDiffMs = 0;
        for (let i = 1; i < pickups.length; i++) {
          totalDiffMs +=
            pickups[i].pickupTimestamp.getTime() -
            pickups[i - 1].pickupTimestamp.getTime();
        }
        const avgMs = totalDiffMs / (count - 1);
        avgMinutesBetweenPickups = Math.round(avgMs / (1000 * 60));
      }
      pickupsSummary = { count, avgMinutesBetweenPickups };
    }

    res.status(200).json({
      currentShift,
      nextShift,
      vehicle: assignedVehicle,
      pickupsSummary,
      alerts: [],
    });
  } catch (error) {
    console.error('Error fetching driver dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:userId/weekly-pickups', async (req, res) => {
  try {
    const { userId } = req.params;
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
        userId,
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
    console.error('Error fetching weekly pickups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:userId/week-availability', async (req, res) => {
  try {
    const { userId } = req.params;
    const { weekStart } = req.query;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'driver') {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const allActiveVehicles = await prisma.vehicle.findMany({
      where: { status: 'active' },
      select: { id: true, insuranceExpiry: true, nextInspectionDate: true },
    });

    const weekDays = weekStart ? getWeekDates(weekStart) : getCurrentWeekDates();
    const shiftTypes = ['morning', 'afternoon', 'night'];
    const results = [];

    const weekStartDate = weekDays[0];
    weekStartDate.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekDays[6]);
    weekEnd.setHours(23, 59, 59, 999);
    
    const allWeekSchedules = await prisma.schedule.findMany({
      where: {
        startTime: { lt: weekEnd },
        endTime: { gt: weekStartDate },
      },
      select: { vehicleId: true, userId: true, startTime: true, endTime: true },
    });

    for (const dayDate of weekDays) {
      const dateIso = formatLocalDate(dayDate);
      const dayInfo = { date: dateIso };
      let driverShift = null;
      let driverShiftData = null;
      
      const dayStart = new Date(dayDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      for (const shiftType of shiftTypes) {
        const { start, end } = getShiftWindow(dateIso, shiftType);
        
        const validVehicles = allActiveVehicles.filter((v) => {
          return v.insuranceExpiry >= end && v.nextInspectionDate >= end;
        });
        const shiftCapacity = validVehicles.length;
        
        const validVehicleIds = validVehicles.map(v => v.id);
        const schedules = allWeekSchedules.filter((s) => 
          s.startTime < end && s.endTime > start
        );
        const usedValidVehicleIds = new Set(
          schedules
            .filter(s => validVehicleIds.includes(s.vehicleId))
            .map(s => s.vehicleId)
        );
        const freeSlots = Math.max(shiftCapacity - usedValidVehicleIds.size, 0);
        dayInfo[shiftType] = { freeSlots, capacity: shiftCapacity };
        
        if (!driverShift) {
          const exactMatch = schedules.find((s) => 
            s.userId === userId && 
            s.startTime.getTime() === start.getTime() && 
            s.endTime.getTime() === end.getTime()
          );
          if (exactMatch) {
            driverShift = shiftType;
            driverShiftData = {
              startTime: exactMatch.startTime,
              endTime: exactMatch.endTime
            };
          }
        }
      }
      
      if (!driverShift) {
        // sprawdzenie czy ma jakas zmiane w dniu
        const anyShiftInDay = allWeekSchedules.find((s) => 
          s.userId === userId && 
          s.startTime >= dayStart && 
          s.startTime < dayEnd
        );
        
        if (anyShiftInDay) {
          // okreslanie typu zmiany na podstawie godzin
          const hour = anyShiftInDay.startTime.getHours();
          if (hour >= 6 && hour < 14) {
            driverShift = 'morning';
          } else if (hour >= 14 && hour < 22) {
            driverShift = 'afternoon';
          } else {
            driverShift = 'night';
          }
          driverShiftData = {
            startTime: anyShiftInDay.startTime,
            endTime: anyShiftInDay.endTime
          };
        }
      }
      
      if (driverShift) {
        dayInfo.driverShift = driverShift;
        if (driverShiftData) {
          dayInfo.driverShiftData = driverShiftData;
        }
      }
      results.push(dayInfo);
    }

    res.status(200).json({ days: results });
  } catch (error) {
    console.error('Error fetching week availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:userId/week-signup', async (req, res) => {
  try {
    const { userId } = req.params;
    const { assignments } = req.body;
    if (!Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({ error: 'No assignments provided' });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'driver') {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const created = [];
    const failed = [];

    for (const { date, shiftType } of assignments) {
      try {
        if (!date || !['morning', 'afternoon', 'night'].includes(shiftType)) {
          failed.push({ date, shiftType, reason: 'Invalid data' });
          continue;
        }
        
        const { start, end } = getShiftWindow(date, shiftType);
        
        const result = await prisma.$transaction(async (tx) => {
          const exactMatch = await tx.schedule.findFirst({
            where: {
              userId,
              startTime: start,
              endTime: end,
            },
            select: { id: true },
          });
          
          if (exactMatch) {
            return { success: false, reason: 'Driver already assigned to this exact shift' };
          }
          
          const overlappingDriver = await tx.schedule.findFirst({
            where: {
              userId,
              startTime: { lt: end },
              endTime: { gt: start },
            },
            select: { id: true },
          });
          
          if (overlappingDriver) {
            return { success: false, reason: 'Driver has overlapping shift' };
          }
          
          const allActiveVehicles = await tx.vehicle.findMany({
            where: { status: 'active' },
            select: { id: true, insuranceExpiry: true, nextInspectionDate: true },
          });
          
          const validVehicles = allActiveVehicles.filter((v) => {
            return v.insuranceExpiry >= end && v.nextInspectionDate >= end;
          });
          
          if (validVehicles.length === 0) {
            return { success: false, reason: 'No valid vehicles for this shift period' };
          }
          
          const validVehicleIds = validVehicles.map((v) => v.id);
          
          const overlapping = await tx.schedule.findMany({
            where: {
              startTime: { lt: end },
              endTime: { gt: start },
            },
            select: { vehicleId: true },
          });
          
          const usedVehicles = new Set(overlapping.map((s) => s.vehicleId));
          const freeVehicles = validVehicleIds.filter((id) => !usedVehicles.has(id));
          
          if (freeVehicles.length === 0) {
            return { success: false, reason: 'Shift full' };
          }
          
          const randomVehicleId = freeVehicles[Math.floor(Math.random() * freeVehicles.length)];
          
          const schedule = await tx.schedule.create({
            data: {
              userId,
              vehicleId: randomVehicleId,
              startTime: start,
              endTime: end,
              notes: ``,
            },
          });
          
          return { 
            success: true, 
            scheduleId: schedule.id, 
            vehicleId: randomVehicleId 
          };
        });
        
        if (result.success) {
          created.push({ 
            date, 
            shiftType, 
            scheduleId: result.scheduleId, 
            vehicleId: result.vehicleId 
          });
        } else {
          failed.push({ date, shiftType, reason: result.reason });
        }
        
      } catch (innerError) {
        console.error('Error assigning shift', innerError);
        failed.push({ date, shiftType, reason: 'Internal error' });
      }
    }

    res.status(200).json({ created, failed });
  } catch (error) {
    console.error('Error processing week signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
