# Score Board API Module Specification

## Overview
This module handles the management and real-time updates of a score board system that displays the top 10 users based on their scores. The system securely processes score update requests, validates user actions, and broadcasts updated leaderboard information to connected clients.

## Key Features
- Secure score update API endpoint
- Real-time score board updates
- Authentication and authorization
- Rate limiting to prevent abuse
- WebSocket support for live updates
- Caching mechanism for performance
- Audit logging for security and debugging

## Architecture Components

### 1. Score Update Service
Responsible for validating and processing score update requests:
- Validates user authentication
- Verifies the action completion signature
- Updates user score in the database
- Triggers score board update

### 2. Score Board Manager
Responsible for maintaining and distributing the current state of the score board:
- Retrieves top 10 users from database
- Caches the current leaderboard state
- Processes score updates and recalculates rankings
- Broadcasts updates to connected clients
- Optimizes update frequency to prevent overload

### 3. WebSocket Service
Handles real-time communication with clients:
- Manages client connections
- Authenticates clients
- Delivers score board updates
- Handles reconnection logic

### 4. Security Manager
Enforces security policies:
- Validates authentication tokens
- Verifies action signatures
- Implements rate limiting
- Detects suspicious activity
- Logs security events

## API Endpoints

### POST /api/scores/update
Updates a user's score after completing an action.

**Request Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
  "userId": "string",
  "actionId": "string",
  "actionSignature": "string",
  "actionTimestamp": "ISO8601 timestamp",
  "scoreIncrement": "number"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "newScore": "number",
  "newRank": "number" // Optional, included if in top 10
}
```

**Error Responses:**
- 401 Unauthorized: Invalid or missing authentication
- 403 Forbidden: Invalid action signature or unauthorized action
- 429 Too Many Requests: Rate limit exceeded

### GET /api/scores/leaderboard
Retrieves the current top 10 users and their scores.

**Request Headers:**
```
Authorization: Bearer {jwt_token} // Optional, may be public
```

**Response (200 OK):**
```json
{
  "lastUpdated": "ISO8601 timestamp",
  "leaderboard": [
    {
      "userId": "string",
      "username": "string",
      "score": "number",
      "rank": "number"
    },
    // ... up to 10 entries
  ]
}
```

## WebSocket API

### Connection
```
ws://{server_url}/ws/scoreboard?token={jwt_token}
```

### Events

**Server to Client:**
- `leaderboard_update`: Sent when the leaderboard changes
  ```json
  {
    "type": "leaderboard_update",
    "timestamp": "ISO8601 timestamp",
    "data": {
      // Same format as GET /api/scores/leaderboard response
    }
  }
  ```

- `user_score_update`: Sent to a specific user when their score changes
  ```json
  {
    "type": "user_score_update",
    "timestamp": "ISO8601 timestamp",
    "data": {
      "userId": "string",
      "newScore": "number",
      "newRank": "number" // Optional, included if in top 100
    }
  }
  ```

## Security Measures

### Action Signature Verification
To prevent unauthorized score updates, each action must be cryptographically signed by the game server:

1. When a user completes an action, the game server:
   - Creates a payload: `{userId}:{actionId}:{timestamp}:{scoreIncrement}:{secretKey}`
   - Computes HMAC-SHA256 signature of the payload
   - Sends the signature with the score update request

2. The API server:
   - Recreates the payload using the received parameters and server's secret key
   - Computes and compares signatures
   - Rejects the request if signatures don't match or if timestamp is too old

### Rate Limiting
- Limit score update requests to prevent abuse:
  - Per user: 10 requests per minute
  - Per IP: 20 requests per minute
  - Global: Configurable based on system capacity

### JWT Authentication
- All requests must include a valid JWT token with appropriate permissions
- Tokens should have short expiration times (15-30 minutes)
- Include user role and permissions in the token payload

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  total_score BIGINT NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE
);
```

### Scores Table
```sql
CREATE TABLE scores (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  action_id VARCHAR(100) NOT NULL,
  score_increment INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(user_id, action_id)
);
```

### Audit Log Table
```sql
CREATE TABLE score_audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  action_id VARCHAR(100) NOT NULL,
  score_increment INTEGER NOT NULL,
  request_ip VARCHAR(45) NOT NULL,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  success BOOLEAN NOT NULL,
  failure_reason TEXT
);
```

## Caching Strategy
- Cache the leaderboard in Redis with:
  - Sorted set for quick rank calculations
  - Hash for storing user details
- Set TTL of 5 minutes with cache invalidation on score updates
- Implement optimistic updates to minimize database load

## Implementation Guidelines

### Tech Stack Recommendations
- Node.js with Express/Nest.js or Go with Gin/Echo
- PostgreSQL for relational data
- Redis for caching and pub/sub
- Socket.IO or native WebSockets for real-time updates
- JWT for authentication

### Optimization Considerations
- Batch database updates to reduce load
- Implement debounce mechanism for WebSocket broadcasts (max 1 update per second)
- Use database transactions for data consistency
- Consider read replicas for high-traffic deployments

### Testing Requirements
- Unit tests for all services and validators
- Integration tests for API endpoints
- Load testing to ensure system can handle peak traffic
- Security testing including penetration testing

## Deployment Considerations
- Use containerization (Docker) for consistent environment
- Implement horizontal scaling for WebSocket servers
- Configure proper monitoring and alerting
- Set up CI/CD pipeline with automated testing

## Monitoring
- Track error rates and response times
- Monitor WebSocket connection count
- Alert on suspicious activity patterns
- Log all authentication failures