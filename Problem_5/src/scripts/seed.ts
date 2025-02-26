// src/scripts/seed.ts
import mongoose from 'mongoose';
import Resource from '../models/resource_model';
import { connectDB } from '../config/db_config';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Sample resource data
const sampleResources = [
  {
    name: 'MacBook Pro',
    description: 'High-performance laptop with M2 chip',
    category: 'electronics',
    status: 'available'
  },
  {
    name: 'Ergonomic Chair',
    description: 'Adjustable office chair with lumbar support',
    category: 'furniture',
    status: 'available'
  },
  {
    name: 'JavaScript: The Good Parts',
    description: 'Book about JavaScript best practices by Douglas Crockford',
    category: 'books',
    status: 'reserved'
  },
  {
    name: 'Wireless Headphones',
    description: 'Noise-cancelling Bluetooth headphones',
    category: 'electronics',
    status: 'available'
  },
  {
    name: 'Winter Jacket',
    description: 'Waterproof insulated jacket for cold weather',
    category: 'clothing',
    status: 'unavailable'
  },
  {
    name: 'Desk Lamp',
    description: 'LED desk lamp with adjustable brightness',
    category: 'furniture',
    status: 'available'
  },
  {
    name: 'Smart Watch',
    description: 'Fitness tracker with heart rate monitoring',
    category: 'electronics',
    status: 'available'
  },
  {
    name: 'The Design of Everyday Things',
    description: 'Book about design principles by Don Norman',
    category: 'books',
    status: 'available'
  }
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Delete existing resources
    await Resource.deleteMany({});
    console.log('Existing resources deleted');

    // Insert sample resources
    await Resource.insertMany(sampleResources);
    console.log('Database seeded with sample resources');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
