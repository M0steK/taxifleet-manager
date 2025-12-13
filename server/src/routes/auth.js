import express from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/database.js';

const router = express.Router();

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
    });

    const isPasswordValid = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    delete user.passwordHash;
    res.status(200).json(user);
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
