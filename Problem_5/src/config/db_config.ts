// src/config/db_config.ts
import mongoose from 'mongoose';

const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/resource_db';

export const connectDB = async () => {
  try {
    await mongoose.connect(dbUri);
    console.log('Successfully connected to MongoDB.');
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
};
