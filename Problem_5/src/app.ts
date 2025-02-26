// Project Structure:
// src/
//   |- app.ts
//   |- server.ts
//   |- config/
//   |    |- db.config.ts
//   |- controllers/
//   |    |- resource.controller.ts
//   |- models/
//   |    |- resource.model.ts
//   |- routes/
//   |    |- resource.routes.ts
//   |- middleware/
//        |- validation.middleware.ts

import express, { Application } from 'express';
import cors from 'cors';
import resourceRoutes from './routes/resource_routes';
import { connectDB } from './config/db_config';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// Routes
app.use('/api/resources', resourceRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Resource Management API' });
});

export default app;
