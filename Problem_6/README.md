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
7. **Cache Hierarchy**: Multi-level caching for optimal performance

For a visual representation of these components and their interactions, please refer to the [Component Diagram](./component.md).

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

## Unit Testing

The Score Service module should have comprehensive unit tests to ensure reliability and security. Below are key test cases that should be implemented:

### ScoreServiceTest

```javascript
describe('ScoreService', () => {
  // Authentication & Authorization Tests
  test('should reject requests with invalid JWT tokens', async () => {
    const invalidToken = 'invalid.jwt.token';
    const result = await scoreService.updateScore({
      headers: { Authorization: `Bearer ${invalidToken}` },
      body: validScoreUpdateRequest
    });
    
    expect(result.statusCode).toBe(401);
    expect(result.body.success).toBe(false);
    expect(result.body.message).toContain('Invalid authentication token');
  });
  
  test('should reject requests with missing action proof', async () => {
    const requestWithoutProof = { ...validScoreUpdateRequest, actionProof: undefined };
    const result = await scoreService.updateScore({
      headers: { Authorization: `Bearer ${validToken}` },
      body: requestWithoutProof
    });
    
    expect(result.statusCode).toBe(400);
    expect(result.body.success).toBe(false);
    expect(result.body.message).toContain('Action proof is required');
  });
  
  // Score Update Tests
  test('should successfully update score with valid request', async () => {
    const result = await scoreService.updateScore({
      headers: { Authorization: `Bearer ${validToken}` },
      body: validScoreUpdateRequest
    });
    
    expect(result.statusCode).toBe(200);
    expect(result.body.success).toBe(true);
    expect(result.body.newScore).toBeGreaterThan(0);
    expect(typeof result.body.rank).toBe('number');
  });
  
  test('should detect and reject duplicate action submissions', async () => {
    // First submission (valid)
    await scoreService.updateScore({
      headers: { Authorization: `Bearer ${validToken}` },
      body: validScoreUpdateRequest
    });
    
    // Duplicate submission attempt
    const duplicateResult = await scoreService.updateScore({
      headers: { Authorization: `Bearer ${validToken}` },
      body: validScoreUpdateRequest
    });
    
    expect(duplicateResult.statusCode).toBe(409);
    expect(duplicateResult.body.success).toBe(false);
    expect(duplicateResult.body.message).toContain('Action already processed');
  });
  
  // Rate Limiting Tests
  test('should enforce rate limits', async () => {
    // Send multiple requests in rapid succession
    const results = await Promise.all(
      Array(20).fill().map(() => scoreService.updateScore({
        headers: { Authorization: `Bearer ${validToken}` },
        body: { ...validScoreUpdateRequest, actionId: generateUniqueActionId() }
      }))
    );
    
    // At least some of the later requests should be rate limited
    expect(results.some(result => result.statusCode === 429)).toBe(true);
  });
  
  // Challenge Token Tests
  test('should validate challenge tokens', async () => {
    const invalidChallengeRequest = { 
      ...validScoreUpdateRequest, 
      challengeToken: 'invalid-token'
    };
    
    const result = await scoreService.updateScore({
      headers: { Authorization: `Bearer ${validToken}` },
      body: invalidChallengeRequest
    });
    
    expect(result.statusCode).toBe(403);
    expect(result.body.message).toContain('Invalid challenge token');
  });
});
```

### LeaderboardManagerTest

```javascript
describe('LeaderboardManager', () => {
  beforeEach(async () => {
    // Setup test data
    await setupTestUsers([
      { userId: 'user1', score: 100 },
      { userId: 'user2', score: 200 },
      { userId: 'user3', score: 300 },
      // ... more users
    ]);
  });
  
  test('should return top 10 users ordered by score', async () => {
    const leaderboard = await leaderboardManager.getLeaderboard();
    
    expect(leaderboard.length).toBeLessThanOrEqual(10);
    expect(leaderboard[0].score).toBeGreaterThanOrEqual(leaderboard[1].score);
    // Verify the entire list is properly sorted
    for (let i = 0; i < leaderboard.length - 1; i++) {
      expect(leaderboard[i].score).toBeGreaterThanOrEqual(leaderboard[i+1].score);
    }
  });
  
  test('should update ranks when scores change', async () => {
    // Get initial leaderboard
    const initialLeaderboard = await leaderboardManager.getLeaderboard();
    
    // Update a user's score
    await scoreService.updateScore({
      headers: { Authorization: `Bearer ${validToken}` },
      body: {
        userId: 'user10',
        actionId: 'test-action',
        actionProof: 'valid-proof',
        challengeToken: 'valid-token',
        timestamp: new Date().toISOString()
      }
    });
    
    // Get updated leaderboard
    const updatedLeaderboard = await leaderboardManager.getLeaderboard();
    
    // Verify ranks have been updated correctly
    for (const user of updatedLeaderboard) {
      // Verify that rank is based on score order
      const usersWithHigherScores = updatedLeaderboard.filter(u => 
        u.score > user.score
      ).length;
      expect(user.rank).toBe(usersWithHigherScores + 1);
    }
  });
  
  test('should correctly calculate personal ranking context', async () => {
    const userId = 'user5';
    const context = await leaderboardManager.getPersonalRankingContext(userId);
    
    expect(context.user.userId).toBe(userId);
    expect(context.nearbyCompetitors.length).toBeGreaterThan(0);
    expect(context.distanceToNextRank).toBeGreaterThanOrEqual(0);
    
    // Verify that nearby competitors are actually nearby in rank
    const userRank = context.user.rank;
    for (const competitor of context.nearbyCompetitors) {
      expect(Math.abs(competitor.rank - userRank)).toBeLessThanOrEqual(5);
    }
  });
});
```

### WebSocketManagerTest

```javascript
describe('WebSocketManager', () => {
  let mockClient;
  
  beforeEach(() => {
    // Setup mock websocket client
    mockClient = {
      send: jest.fn(),
      on: jest.fn(),
      readyState: 1 // OPEN
    };
    webSocketManager.addClient(mockClient);
  });
  
  test('should broadcast score updates to connected clients', async () => {
    const updateData = {
      userId: 'user1',
      newScore: 150,
      leaderboardChanged: true,
      changes: [
        { userId: 'user1', oldRank: 5, newRank: 4, score: 150 }
      ]
    };
    
    await webSocketManager.broadcastScoreUpdate(updateData);
    
    expect(mockClient.send).toHaveBeenCalled();
    const sentData = JSON.parse(mockClient.send.mock.calls[0][0]);
    expect(sentData.type).toBe('SCORE_UPDATE');
    expect(sentData.data.userId).toBe('user1');
    expect(sentData.data.newScore).toBe(150);
  });
  
  test('should handle client disconnections gracefully', async () => {
    const disconnectedClient = {
      send: jest.fn(() => { throw new Error('Client disconnected'); }),
      readyState: 1
    };
    webSocketManager.addClient(disconnectedClient);
    
    // This should not throw an error
    await webSocketManager.broadcastScoreUpdate({ userId: 'user1', newScore: 100 });
    
    // The client should be removed from active clients
    expect(webSocketManager.getActiveClientCount()).toBe(1); // Only the mockClient remains
  });
  
  test('should send incremental updates when possible', async () => {
    const updateData = {
      userId: 'user1',
      newScore: 150,
      leaderboardChanged: true,
      changes: [
        { userId: 'user1', oldRank: 5, newRank: 4, score: 150 }
      ]
    };
    
    // Configure a client to receive incremental updates
    const incrementalClient = {
      send: jest.fn(),
      preferences: { incrementalUpdates: true },
      readyState: 1
    };
    webSocketManager.addClient(incrementalClient);
    
    await webSocketManager.broadcastScoreUpdate(updateData);
    
    // Verify the incremental client received only changes
    const sentData = JSON.parse(incrementalClient.send.mock.calls[0][0]);
    expect(sentData.data.changes).toBeDefined();
    expect(sentData.data.newLeaderboard).toBeUndefined();
  });
});
```

### RateLimiterTest

```javascript
describe('RateLimiter', () => {
  test('should allow requests within rate limits', async () => {
    const userId = 'test-user';
    
    // First request should always be allowed
    const result1 = await rateLimiter.checkLimit(userId);
    expect(result1.allowed).toBe(true);
    
    // Second request within a short time should still be allowed
    const result2 = await rateLimiter.checkLimit(userId);
    expect(result2.allowed).toBe(true);
  });
  
  test('should block requests exceeding rate limits', async () => {
    const userId = 'test-user';
    
    // Make multiple requests
    for (let i = 0; i < 100; i++) {
      await rateLimiter.checkLimit(userId);
    }
    
    // After many requests, should be rate limited
    const result = await rateLimiter.checkLimit(userId);
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });
  
  test('should reset limits after specified time period', async () => {
    const userId = 'test-user';
    
    // Exhaust rate limit
    for (let i = 0; i < 100; i++) {
      await rateLimiter.checkLimit(userId);
    }
    
    // Verify user is rate limited
    const limitedResult = await rateLimiter.checkLimit(userId);
    expect(limitedResult.allowed).toBe(false);
    
    // Mock time passing
    jest.advanceTimersByTime(60 * 1000); // Advance 1 minute
    
    // Should be allowed again
    const resetResult = await rateLimiter.checkLimit(userId);
    expect(resetResult.allowed).toBe(true);
  });
});
```

### Integration Tests

```javascript
describe('Score Service Integration', () => {
  test('end-to-end score update flow', async () => {
    // 1. User completes an action
    const actionId = 'test-action-123';
    const userId = 'test-user-456';
    
    // 2. User requests challenge token
    const challengeResponse = await request(app)
      .post('/api/v1/scores/challenge')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ userId, actionId })
      .expect(200);
    
    const { challengeToken } = challengeResponse.body;
    
    // 3. User submits score update with challenge token
    const updateResponse = await request(app)
      .post('/api/v1/scores/update')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        userId,
        actionId,
        actionProof: 'valid-proof',
        challengeToken,
        timestamp: new Date().toISOString()
      })
      .expect(200);
    
    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.newScore).toBeDefined();
    expect(updateResponse.body.rank).toBeDefined();
    
    // 4. Verify leaderboard is updated
    const leaderboardResponse = await request(app)
      .get('/api/v1/scores/leaderboard')
      .expect(200);
    
    expect(leaderboardResponse.body.leaderboard).toBeDefined();
    
    // If user made it to top 10, they should be in the leaderboard
    if (updateResponse.body.rank <= 10) {
      const userInLeaderboard = leaderboardResponse.body.leaderboard
        .some(entry => entry.userId === userId);
      expect(userInLeaderboard).toBe(true);
    }
  });
});
```

## Testing Considerations

1. **Mocking External Dependencies**: Use dependency injection to mock:
   - Database connections
   - WebSocket servers
   - Authentication services
   - Cache services

2. **Test Data Management**:
   - Use a test database or in-memory database
   - Reset test data between test runs
   - Include diverse test scenarios (new users, top users, etc.)

3. **Security Testing**:
   - Extensively test authentication and authorization
   - Include tests for rate limiting and DDoS protection
   - Test for SQL injection and other security vulnerabilities
   
4. **Performance Testing**:
   - Test cache hit rates
   - Measure response times under load
   - Test WebSocket broadcast performance with many clients

5. **Edge Cases**:
   - Test tie-breaking in leaderboard rankings
   - Test behavior when users have identical scores
   - Test with extremely large scores

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