import express from 'express';
import {PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());


app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', message: 'Server is running' });
});

app.post('/api/users', async (req, res) =>{
  try{
    const {firstName, lastName, email, password, phoneNumber, role} = req.body;

    if(!firstName || !lastName || !email || !password){
      return res.status(400).json({error: "Missing required fields"});
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data:{
        firstName: firstName,
        lastName: lastName,
        email: email,
        passwordHash: hashedPassword,
        phoneNumber: phoneNumber,
        role: role,
      },
    });

    delete newUser.passwordHash;

    res.status(201).json(newUser);

  }
  catch(error){
    console.error('Error creating user:', error);
    if(error.code === 'P2002' && error.meta?.target?.includes('email')){
      return res.status(409).json({error: "User with this email already exists"});
    }
    res.status(500).json({error: "Internal server error"});
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});
