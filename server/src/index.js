import express from 'express';
import usersRouter from './routes/users.js';
import vehiclesRouter from './routes/vehicles.js';
import schedulesRouter from './routes/schedules.js';
import pickupsRouter from './routes/pickups.js';
import dashboardRouter from './routes/dashboard.js';
import driverRouter from './routes/driver.js';
import adminRouter from './routes/admin.js';
import authRouter from './routes/auth.js';
import { cleanupOldPickups } from './utils/cleanup.js';

const app = express();
const PORT = process.env.PORT || 3001;

// czyszczenie starych danych codziennie (pomijamy w testach, by uniknąć otwartych timerów)
if (process.env.NODE_ENV !== 'test') {
  const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000;
  setInterval(cleanupOldPickups, CLEANUP_INTERVAL);
  cleanupOldPickups();
}

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', message: 'Server is running' });
});

app.use('/api/users', usersRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/pickups', pickupsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/driver', driverRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);

export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`);
  });
}
