// src/controllers/resource.controller.ts
import { Request, Response } from 'express';
import Resource, { IResource } from '../models/resource_model';

// Create a new resource
export const createResource = async (req: Request, res: Response): Promise<void> => {
  try {
    const newResource = new Resource(req.body);
    const savedResource = await newResource.save();
    res.status(201).json(savedResource);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create resource",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get all resources with filters
export const getResources = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, status, name } = req.query;

    // Build filter object based on query parameters
    const filter: any = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (name) filter.name = { $regex: name, $options: 'i' }; // Case-insensitive search

    const resources = await Resource.find(filter);
    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve resources",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get a resource by ID
export const getResourceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const resourceId = req.params.id;
    const resource = await Resource.findById(resourceId);

    if (!resource) {
      res.status(404).json({ message: `Resource with id ${resourceId} not found` });
      return;
    }

    res.status(200).json(resource);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve resource",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Update a resource
export const updateResource = async (req: Request, res: Response): Promise<void> => {
  try {
    const resourceId = req.params.id;
    const updatedResource = await Resource.findByIdAndUpdate(
      resourceId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedResource) {
      res.status(404).json({ message: `Resource with id ${resourceId} not found` });
      return;
    }

    res.status(200).json(updatedResource);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update resource",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Delete a resource
export const deleteResource = async (req: Request, res: Response): Promise<void> => {
  try {
    const resourceId = req.params.id;
    const deletedResource = await Resource.findByIdAndDelete(resourceId);

    if (!deletedResource) {
      res.status(404).json({ message: `Resource with id ${resourceId} not found` });
      return;
    }

    res.status(200).json({ message: "Resource successfully deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete resource",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
