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

app.post('/api/vehicles', async (req, res) => {
  try{
    const {brand, model, productionYear, licensePlate, vin, status, mileage, insuranceExpiry, nextInspectionDate} = req.body;

    if(!brand || !model || !productionYear || !licensePlate || !vin || !status || !mileage || !insuranceExpiry || !nextInspectionDate){
      return res.status(400).json({error: "Missing required fields"});
    }
  const newVehicle = await prisma.vehicle.create({
    data:{
      brand,
      model,
      productionYear,
      licensePlate,
      vin,
      status,
      mileage,
      insuranceExpiry: new Date(insuranceExpiry),
      nextInspectionDate: new Date(nextInspectionDate),
    },
  });

  res.status(201).json(newVehicle);
  }catch(error){
    console.error('Error creating vehicle:', error);
    if(error.code === 'P2002' && error.meta?.target?.includes('licensePlate')){
      return res.status(409).json({error: "Vehicle with this license plate already exists"});
    }
    res.status(500).json({error: "Internal server error"});
  }
});

app.get('/api/vehicles', async(req, res) =>{
  try{
    const vehicles = await prisma.vehicle.findMany({
      orderBy:{
        createdAt: 'desc',
      },
    });
    res.status(200).json(vehicles);
      
  }
  catch(error){
    console.error('Error fetching vehicles:', error);
    res.status(500).json({error: "Internal server error"});
  }
})

app.get('/api/vehicles/:id', async (req, res) =>{
  try{
    const {id} = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where:{
        id: id,
      },
    });

    if(!vehicle){
      return res.status(404).json({error: 'Vehicle not found'});
    }
    
    res.status(200).json(vehicle);
  }
  catch(error){
    console.error(`Error fetching vehicle with id: ${req.params.id}`, error);
    res.status(500).json({error: 'Internal server error'});
  }
});

app.patch('/api/vehicles/:id', async (req, res) =>{
  try{
    const {id} = req.params;
    const {mileage, status, insuranceExpiry, nextInspectionDate} = req.body;

    const updatedVehicle = await prisma.vehicle.update({
      where:{
        id: id,
      },
      data:{
        mileage,
        status,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : undefined,
        nextInspectionDate: nextInspectionDate ? new Date(nextInspectionDate) : undefined,
      },
    });

    res.status(200).json(updatedVehicle);
  }catch(error){
    if(error.code === 'P2025'){
      return res.status(404).json({error: 'Vehicle not found'});
    }
    
    console.error(`Error updating vehicle with id: ${req.params.id}`, error);
    res.status(500).json({error: 'Internal server error'});
  }
})

app.delete('/api/vehicles/:id', async (req, res) =>{
  try{
    const {id} = req.params;
    await prisma.vehicle.delete({
      where:{
        id: id,
      },
    });
    res.status(204).send();
    
  }catch(error){

  }
})
app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});
