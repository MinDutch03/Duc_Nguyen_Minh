# Express TypeScript CRUD API

A RESTful API built with Express.js and TypeScript that provides CRUD operations for resources.

## Features

- Create, Read, Update, and Delete operations
- MongoDB integration using Mongoose
- TypeScript for type safety
- Input validation
- Query filtering
- Error handling
- Unit tests for API endpoints

## Prerequisites

- Node.js (v14 or newer)
- MongoDB (local or Atlas)
- npm or yarn


## Installation

1. Clone the repository:
   ```
   git clone https://github.com/MinDutch03/Duc_Nguyen_Minh.git
   cd Problem_5
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your configuration:
   ```
   PORT=8080
   MONGODB_URI=mongodb://localhost:27017/resource_db
   ```

## Project structure
Problem_5/
│
├── src/                          # Source code directory
│   ├── app.ts                    # Express application setup
│   ├── server.ts                 # Server entry point
│   ├── config/                   # Configuration files
│   │   └── db.config.ts          # Database connection configuration
│   │
│   ├── controllers/              # Request handlers
│   │   └── resource.controller.ts # Resource CRUD operations
│   │
│   ├── models/                   # Database models
│   │   └── resource.model.ts     # Resource schema and interface
│   │
│   ├── routes/                   # API routes
│   │   └── resource.routes.ts    # Resource endpoints
│   │
│   ├── middleware/               # Custom middleware
│   │   └── validation.middleware.ts # Input validation
│   │
│   ├── tests/                # Test directory
│   │   ├── controllers/          # Controller unit tests
│   │   │   └── resource_controller_test.ts
│   │   ├── middleware/           # Middleware unit tests
│   │   │   └── validation_middleware_test.ts
│   │   ├── routes/               # Route tests
│   │   │   └── resource_routes_test.ts
│
├── dist/                         # Compiled JavaScript output (generated after build)
│
├── node_modules/                 # Node.js dependencies (generated after npm install)
│
├── .env                          # Environment variables (to be created)
├── .env.example                  # Example environment variables
├── .gitignore                    # Git ignore file
├── package.json                  # Project metadata and dependencies
├── tsconfig.json                 # TypeScript configuration
├── jest-config.js                # TypeScript and test coverage settings
└── README.md                     # Project documentation


## Database Setup

### Option 1: Using the seed script

The project includes a database seed script that populates MongoDB with sample resources:

```
npm run seed
```

This will:
1. Connect to your configured MongoDB database
2. Clear any existing resources
3. Insert 8 sample resources across different categories

### Option 2: Manual setup

You can also manually create the database:

1. Start MongoDB:
   ```
   mongod
   ```

2. Connect to MongoDB using the mongo shell:
   ```
   mongosh
   ```

3. Create and use the database:
   ```
   use resource_db
   ```

4. Create a sample document:
   ```javascript
   db.resources.insertOne({
     name: "MacBook Pro",
     description: "High-performance laptop with M2 chip",
     category: "electronics",
     status: "available",
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

## Running the Application

### Development mode

```
npm run dev
```

This will start the server with hot-reloading enabled.

### Production mode

```
npm run build
npm start
```

## API Endpoints

### Resources

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resources` | Create a new resource |
| GET | `/api/resources` | Get all resources (with optional filtering) |
| GET | `/api/resources/:id` | Get a single resource by ID |
| PUT | `/api/resources/:id` | Update a resource |
| DELETE | `/api/resources/:id` | Delete a resource |

## Filtering

You can filter resources using query parameters:

```
GET /api/resources?category=electronics&status=available&name=laptop
```

## Data Model

### Resource

```typescript
{
  name: string;          // Required
  description: string;   // Required
  category: string;      // Required, one of: 'electronics', 'books', 'furniture', 'clothing', 'other'
  status: string;        // One of: 'available', 'reserved', 'unavailable', default: 'available'
  createdAt: Date;       // Automatically added
  updatedAt: Date;       // Automatically added
}
```

## Example Requests

### Create a Resource

```bash
curl -X POST http://localhost:8080/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High performance laptop",
    "category": "electronics",
    "status": "available"
  }'
```

### Get All Resources

```bash
curl http://localhost:8080/api/resources
```

### Get Resources with Filtering

```bash
# Get all electronics
curl http://localhost:8080/api/resources?category=electronics

# Get available books
curl http://localhost:8080/api/resources?category=books&status=available

# Search by name (case-insensitive partial match)
curl http://localhost:8080/api/resources?name=mac
```

### Get a Specific Resource

```bash
curl http://localhost:8080/api/resources/60d21b4667d0d8992e610c85
```

### Update a Resource

```bash
curl -X PUT http://localhost:8080/api/resources/60d21b4667d0d8992e610c85 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "reserved",
    "description": "Updated description for high performance laptop"
  }'
```

### Delete a Resource

```bash
curl -X DELETE http://localhost:8080/api/resources/60d21b4667d0d8992e610c85
```

## Unit Testing

The application includes unit tests for all the API endpoints. The tests use Jest as the testing framework and Supertest for HTTP assertions.

### Running Tests

```
npm test
```

### Test Files Structure

Tests are located in the `src/tests` directory, mirroring the structure of the source code:

```
src/
└── tests/
    ├── controllers/
    │   └── resource_controller_test.ts
    ├── middleware/
    │   └── validation_middleware_test.ts
    └── routes/
        └── resource_routes_test.ts
```

### Sample Unit Test

Here's an example unit test for the `createResource` controller function:

```typescript
// src/__tests__/controllers/resource_controller_test.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Resource from '../../models/resource_model';
import { createResource } from '../../controllers/resource_controller';

describe('Resource Controller', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Create an in-memory MongoDB server for testing
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Clear the database after each test
    await Resource.deleteMany({});
  });

  describe('createResource', () => {
    it('should create a new resource and return 201 status', async () => {
      // Mock request and response
      const req = {
        body: {
          name: 'Test Resource',
          description: 'Test Description',
          category: 'electronics',
          status: 'available'
        }
      } as Request;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;
      
      // Call the controller function
      await createResource(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Resource',
          description: 'Test Description',
          category: 'electronics',
          status: 'available'
        })
      );
      
      // Verify the resource was saved to the database
      const resources = await Resource.find();
      expect(resources).toHaveLength(1);
      expect(resources[0].name).toBe('Test Resource');
    });
    
    it('should return 500 status when there is an error', async () => {
      // Mock a failed save operation
      jest.spyOn(Resource.prototype, 'save').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      const req = {
        body: {
          name: 'Test Resource',
          description: 'Test Description',
          category: 'electronics'
        }
      } as Request;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;
      
      // Call the controller function
      await createResource(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Failed to create resource',
          error: 'Database error'
        })
      );
    });
  });
});
```

### Setting Up Test Environment

To set up the test environment, install the required dependencies:

```bash
npm install --save-dev jest ts-jest @types/jest supertest mongodb-memory-server
```

And add the following configuration to your `jest-config.js` file:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/scripts/seed.ts'
  ]
};
```

To run tests with coverage reporting:

```bash
npm test -- --coverage
```

## License

MIT