# Score Service Module Documentation

## Overview
The Score Service module is responsible for handling user score updates and maintaining a live scoreboard of the top 10 users. This module ensures that score updates are secure, authorized, and reflected in real-time on the website.

## Diagrams
- [Flow Chart Diagram](./flowchart.md) - Visual representation of the score update process
- [Component Diagram](./component.md) - Architecture overview showing system components
- [Sequence Diagram](./sequence.md) - Detailed interaction between components

## Features
- Secure API endpoint for updating user scores
- Authentication and authorization for score update requests
- Real-time scoreboard updates
- Caching mechanism for efficient scoreboard retrieval
- Rate limiting to prevent abuse
- Fraud detection and anomaly monitoring
- Incremental WebSocket updates for improved performance
- Regional deployment support for low latency

## Architecture
The Score Service module is part of the backend application server and interacts with the database and front-end clients. It uses WebSockets for real-time updates and implements security measures to prevent unauthorized score manipulations.

### Key Components
1. **Score Update API**: Processes authenticated requests to update user scores
2. **Authorization Service**: Validates user permissions for score updates
3. **Scoreboard Manager**: Maintains and updates the top 10 leaderboard
4. **WebSocket Service**: Pushes real-time updates to connected clients
5. **Rate Limiter**: Prevents abuse of the score update API
6. **Fraud Detection System**: Identifies suspicious patterns and anomalies
7. **Cache Hierarchy**: Multi-level caching for optimal performance

For a visual representation of these components and their interactions, please refer to the [Component Diagram](./score-service-component.md).

## API Endpoints

### Update User Score
```
POST /api/v1/scores/update
```

**Request Headers:**
- Content-Type: application/json
- Authorization: Bearer {JWT_TOKEN}

**Request Body:**
```json
{
  "userId": "string",
  "actionId": "string",
  "actionProof": "string",
  "timestamp": "ISO8601 timestamp",
  "challengeToken": "string"
}
```

**Response:**
```json
{
  "success": true,
  "newScore": 150,
  "rank": 5,
  "distanceToNextRank": 20,
  "achievements": [
    {
      "id": "string",
      "name": "string",
      "unlocked": true
    }
  ]
}
```

**Error Responses:**
- 400 Bad Request: Invalid request format
- 401 Unauthorized: Invalid or missing authentication
- 403 Forbidden: User not authorized to update scores
- 429 Too Many Requests: Rate limit exceeded

For the complete process flow of score updates, see the [Flow Chart Diagram](./score-service-flowchart.md).

### Get Top Scoreboard
```
GET /api/v1/scores/leaderboard
```

**Response:**
```json
{
  "lastUpdated": "ISO8601 timestamp",
  "leaderboard": [
    {
      "userId": "string",
      "username": "string",
      "score": 300,
      "rank": 1
    },
    // ... more users up to 10
  ]
}
```

### Get Personal Ranking Context
```
GET /api/v1/scores/context/{userId}
```

**Response:**
```json
{
  "user": {
    "userId": "string",
    "username": "string",
    "score": 150,
    "rank": 42
  },
  "nearbyCompetitors": [
    {
      "userId": "string",
      "username": "string",
      "score": 160,
      "rank": 40
    },
    // ... more users (above and below the current user)
  ],
  "distanceToNextRank": 10
}
```

## WebSocket Events

### Score Update Event
```json
{
  "type": "SCORE_UPDATE",
  "data": {
    "userId": "string",
    "newScore": 150,
    "leaderboardChanged": true,
    "changes": [
      {
        "userId": "string",
        "oldRank": 5,
        "newRank": 4,
        "score": 200
      }
    ],
    "newLeaderboard": [
      // Only sent if leaderboardChanged is true and client opts-in to full updates
      // Contains the same structure as GET leaderboard response
    ]
  }
}
```

For a detailed view of the communication sequence, see the [Sequence Diagram](./score-service-sequence.md).

## Authentication & Security
The Score Service implements the following security measures:

1. **JWT Authentication**: All score update requests must include a valid JWT token
2. **Action Proof Validation**: Each score update must include cryptographic proof that the action was completed
3. **Challenge-Response System**: 
   - Server issues unique challenge tokens when actions begin
   - Client must submit the challenge token with the completed action
   - Prevents replay attacks and unauthorized score submissions
4. **Rate Limiting**: Users are limited to a specific number of score updates per time period
5. **Action Verification**: The service validates that the action ID is legitimate and worth the appropriate score
6. **Fraud Detection**:
   - Monitors for unusual score jumps
   - Identifies multiple accounts with similar patterns
   - Detects geographic anomalies
7. **Two-Factor Verification**: Optional additional verification for high-value actions

## Database Schema

### User Scores Table
```
user_id: string (primary key)
username: string
current_score: integer
last_updated: timestamp
rank: integer
```

### User Actions Table
```
action_id: string (primary key)
user_id: string (foreign key)
timestamp: timestamp
score_value: integer
proof_hash: string
challenge_token: string
ip_address: string
geo_location: string
device_fingerprint: string
```

### Achievements Table
```
achievement_id: string (primary key)
name: string
description: string
threshold: integer
badge_image_url: string
```

### User Achievements Table
```
user_id: string (foreign key)
achievement_id: string (foreign key)
unlocked_at: timestamp
primary key (user_id, achievement_id)
```

## Implementation Guidelines

### Score Update Process
1. Validate JWT token and user identity
2. Verify the action proof and challenge token
3. Check rate limiting rules
4. Update the user's score in the database
5. Check if achievements were unlocked
6. Check if the top 10 leaderboard needs updating
7. Broadcast incremental updates via WebSocket if necessary

The complete update process is illustrated in the [Flow Chart Diagram](./score-service-flowchart.md) and [Sequence Diagram](./score-service-sequence.md).

### Performance Considerations
- Implement a cache hierarchy:
  - In-memory cache for immediate score lookups
  - Redis for distributed caching of leaderboards
  - Tiered expiration policies based on access patterns
- Use database transactions to ensure data consistency
- Implement appropriate indexes on the database tables
- Consider read/write separation with:
  - Write-optimized database for score updates
  - Read-optimized replicas for leaderboard queries
- Use incremental WebSocket updates instead of full leaderboard transmission

### Scalability Considerations
- Implement microservice decomposition:
  - Separate services for authentication, score processing, and real-time updates
  - Use event-driven architecture with message queues for high volumes
- Deploy regionally for lower latency:
  - Multiple regional deployments close to users
  - Implement eventual consistency between regions
- Database sharding strategy:
  - Shard by user ID ranges
  - Implement "hot" database for active users and "cold" storage for inactive ones

The component architecture supporting these considerations is detailed in the [Component Diagram](./score-service-component.md).

## Deployment Requirements
- Redis for caching and rate limiting
- Database with support for transactions and indexing
- WebSocket server capability
- Load balancer configuration for horizontal scaling
- Message queue system (RabbitMQ/Kafka) for event processing
- CDN for static assets

## Monitoring
- Track API response times
- Monitor WebSocket connection count
- Log authentication failures
- Alert on unusual score update patterns
- Business metrics:
  - User engagement through score update frequency
  - Distribution of scores to identify gameplay balance issues
  - Leaderboard volatility and competitiveness
- Operational metrics:
  - WebSocket connection stability
  - Database query performance
  - Authentication service response times

## User Experience Enhancements
- Personal ranking context:
  - Show users their position relative to nearby competitors
  - Provide "distance to next rank" metrics
- Social features:
  - Allow users to follow specific competitors
  - Implement notifications for rank changes
- Achievements system:
  - Create milestones based on score thresholds
  - Award badges for consistent performance

## Future Improvements
- Implement tiered leaderboards (daily, weekly, monthly)
- Add user achievement system
- Integrate with notification service for milestone alerts
- Implement regional or group-based leaderboards
- Add seasonal events with temporary score multipliers
- Develop an anti-cheat system with machine learning detection