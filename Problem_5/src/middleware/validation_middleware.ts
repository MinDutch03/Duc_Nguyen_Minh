// src/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// Validate resource creation request body
export const validateResourceCreation = (req: Request, res: Response, next: NextFunction): void => {
  const { name, description, category } = req.body;

  if (!name || !description || !category) {
    res.status(400).json({ message: "Name, description, and category are required fields" });
    return;
  }

  // Validate category
  const validCategories = ['electronics', 'books', 'furniture', 'clothing', 'other'];
  if (!validCategories.includes(category)) {
    res.status(400).json({
      message: `Category must be one of: ${validCategories.join(', ')}`
    });
    return;
  }

  // Optional validation for status if provided
  const { status } = req.body;
  if (status) {
    const validStatuses = ['available', 'reserved', 'unavailable'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
      return;
    }
  }

  next();
};

// Validate resource ID
export const validateResourceId = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid resource ID format" });
    return;
  }

  next();
};
