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

app.get('/api/users', async (req, res) =>{
  try{
    const users = await prisma.user.findMany({
      orderBy:{
        createdAt: 'desc',
      },
    });
    users.forEach(user => delete user.passwordHash);
    res.status(200).json(users);
  }
  catch(error){
    console.error('Error fetching users:',error);
    res.status(500).json({error: "Internal server error"});
  }
})

app.get('/api/users/:id', async (req, res) =>{
  try{
    const {id} = req.params;

    const user = await prisma.user.findUnique({
      where:{
        id: id,
      },
    });

    if(!user){
      return res.status(404).json({error: 'User not found'});
    }

    delete user.passwordHash;

    res.status(200).json(user);
  }
  catch(error){
    console.error(`Error fetching user with id: ${req.params.id}`, error);
    res.status(500).json({error: 'Internal server error'});
    }
})

app.patch('/api/users/:id', async (req, res) => {
  try{
    const {id} = req.params;
    const {firstName, lastName, phoneNumber, role} = req.body;

    const updatedUser = await prisma.user.update({
      where:{
        id: id,
      },

      data:{
        firstName,
        lastName,
        phoneNumber,
        role,
      },
    });

    if(!updatedUser){
      return res.status(404).json({error: 'User not found'});
    }
    delete updatedUser.passwordHash;

    res.status(200).json(updatedUser);
  }
  catch(error){
    console.error(`Error updating user with id: ${req.params.id}`, error);
    res.status(500).json({error: 'Internal server error'});

  }
})

app.delete('/api/users/:id', async (req, res) =>{
  try{
    const {id} = req.params;

    await prisma.user.delete({
      where:{
        id: id,
      },
    });

    res.status(204).send();
  }
  catch(error){
    if(error.code === 'P2025'){
      return res.status(404).json({error: 'User not found'});
    }
    console.error(`Error deleting user with id: ${req.params.id}`, error);
    res.status(500).json({error: 'Internal server error'});
  }
})

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});
