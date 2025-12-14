import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

function generateJoinCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

router.post('/register-company', async (req, res) => {
  try {
    const { companyName, firstName, lastName, email, password, phoneNumber } =
      req.body;

    if (!companyName || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    let joinCode = generateJoinCode();
    let isUnique = false;
    while (!isUnique) {
      const existingCompany = await prisma.company.findUnique({
        where: { joinCode },
      });
      if (!existingCompany) isUnique = true;
      else joinCode = generateJoinCode();
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (prisma) => {
      const company = await prisma.company.create({
        data: {
          name: companyName,
          joinCode,
        },
      });

      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          passwordHash,
          phoneNumber,
          role: 'admin',
          status: 'active',
          companyId: company.id,
        },
      });

      return { company, user };
    });

    delete result.user.passwordHash;
    res.status(201).json(result);
  } catch (error) {
    console.error('Error during company registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register-driver', async (req, res) => {
  try {
    const { joinCode, firstName, lastName, email, password, phoneNumber } =
      req.body;

    if (!joinCode || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const company = await prisma.company.findUnique({ where: { joinCode } });
    if (!company) {
      return res.status(400).json({ error: 'Invalid join code' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        phoneNumber,
        role: 'driver',
        status: 'pending',
        companyId: company.id,
      },
    });

    delete user.passwordHash;
    res.status(201).json(user);
  } catch (error) {
    console.error('Error during driver registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        company: {
          select: {
            joinCode: true,
            name: true,
          },
        },
      },
    });

    const isPasswordValid = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status === 'pending') {
      return res
        .status(403)
        .json({ error: 'Twoje konto oczekuje na akceptację administratora.' });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'Twoje konto zostało odrzucone.' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not defined in env');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        companyId: user.companyId,
      },
      secret,
      { expiresIn: '12h' }
    );

    delete user.passwordHash;
    res.status(200).json({ user, token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
