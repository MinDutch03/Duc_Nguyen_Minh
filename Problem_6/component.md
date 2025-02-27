# Component Diagram
graph TB
    Client[Client Application]
    APIGateway[API Gateway]
    AuthService[Authentication Service]
    ScoreService[Score Service Module]
    WebSocketManager[WebSocket Manager]
    RateLimiter[Rate Limiter]
    CacheManager[Cache Manager]
    DB[(Database)]
    
    Client -->|1. Score Update Request| APIGateway
    APIGateway -->|2. Validate Request| AuthService
    APIGateway -->|3. Forward Request| ScoreService
    
    subgraph "Score Service Module"
        ScoreService -->|4. Check Rate Limits| RateLimiter
        ScoreService -->|5. Update Score| DB
        ScoreService -->|6. Fetch/Update Leaderboard| CacheManager
        ScoreService -->|7. Broadcast Updates| WebSocketManager
    end
    
    WebSocketManager -->|8. Real-time Updates| Client
    CacheManager -.->|Cached Reads| DB
    
    classDef primary fill:#d73a4a,stroke:#333,stroke-width:2px,color:white
    classDef secondary fill:#0366d6,stroke:#333,stroke-width:1px,color:white
    classDef external fill:#6f42c1,stroke:#333,stroke-width:1px,color:white
    
    class ScoreService,WebSocketManager,RateLimiter,CacheManager primary
    class APIGateway,AuthService secondary
    class Client,DB external