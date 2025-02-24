# Express TypeScript CRUD API

A RESTful API built with Express.js and TypeScript that provides CRUD operations for resources.

## Features

- Create, Read, Update, and Delete operations
- MongoDB integration using Mongoose
- TypeScript for type safety
- Input validation
- Query filtering
- Error handling

## Prerequisites

- Node.js (v14 or newer)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/MinDutch03/Duc_Nguyen_Minh.git
   cd problem_5
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

## License

MIT