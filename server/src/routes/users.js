import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, role } =
      req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Niepoprawny email' });
    }

    if (password.length < 7) {
      return res
        .status(400)
        .json({ error: 'Hasło musi mieć co najmniej 7 znaków' });
    }

    if (phoneNumber && String(phoneNumber).replace(/\D/g, '').length < 9) {
      return res
        .status(400)
        .json({ error: 'Numer telefonu musi zawierać co najmniej 9 cyfr' });
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
        companyId: req.user.companyId,
        status: 'active',
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

router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        companyId: req.user.companyId,
      },
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

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findFirst({
      where: {
        id: id,
        companyId: req.user.companyId,
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

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phoneNumber, role, status } = req.body;

    // upewnienie sie ze nalezy do firmy
    const existingUser = await prisma.user.findFirst({
      where: { id, companyId: req.user.companyId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: id,
      },

      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        role,
        status,
      },
    });

    delete updatedUser.passwordHash;

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(`Error updating user with id: ${req.params.id}`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // upewnienie sie ze nalezy do firmy
    const existingUser = await prisma.user.findFirst({
      where: { id, companyId: req.user.companyId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

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

export default router;
