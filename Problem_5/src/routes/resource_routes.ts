// src/routes/resource.routes.ts
import { Router } from 'express';
import {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource
} from '../controllers/resource_controller';
import { validateResourceCreation, validateResourceId } from '../middleware/validation_middleware';

const router = Router();

// CREATE: Post endpoint to create a new resource
router.post('/', validateResourceCreation, createResource);

// READ: Get all resources with optional filtering
router.get('/', getResources);

// READ: Get a resource by id
router.get('/:id', validateResourceId, getResourceById);

// UPDATE: Update a resource
router.put('/:id', validateResourceId, updateResource);

// DELETE: Delete a resource
router.delete('/:id', validateResourceId, deleteResource);

export default router;
