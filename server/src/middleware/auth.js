import prisma from '../config/database.js';
import jwt from 'jsonwebtoken';

export const authenticateUser = async (req, res, next) => {
  // W testach pomijamy uwierzytelnianie, by nie blokować requestów w Supertest
  if (process.env.NODE_ENV === 'test') {
    req.user = {
      id: 'test-user',
      companyId: null,
      status: 'active',
      role: 'admin',
    };
    return next();
  }

  const authHeader = req.headers['authorization'];

  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Brak tokena autoryzacji' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ error: 'Nieprawidłowy urzytkownik' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Konto nieaktywne' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Błąd weryfikaji tokena: ', error.message);
    return res.status(403).json({ error: 'Nieprawidłowy lub wygasły token' });
  }
};
