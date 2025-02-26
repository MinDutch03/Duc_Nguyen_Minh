// src/models/resource.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
  name: string;
  description: string;
  category: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ['electronics', 'books', 'furniture', 'clothing', 'other']
    },
    status: {
      type: String,
      required: true,
      enum: ['available', 'reserved', 'unavailable'],
      default: 'available'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IResource>('Resource', ResourceSchema);
