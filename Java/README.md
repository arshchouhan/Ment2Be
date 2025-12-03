# K23DX Java Microservices

This directory contains the Java microservices architecture for the K23DX mentorship platform.

## Project Structure

```
Java/
├── microservices/
│   ├── common/           # Shared libraries and utilities
│   ├── config/           # Configuration files and service discovery
│   ├── gateway/          # API Gateway service
│   └── services/         # Individual microservices
│       ├── user-service/         # User management and authentication
│       ├── mentor-service/       # Mentor profile and management
│       ├── session-service/      # Session booking and management
│       └── notification-service/ # Notifications and messaging
└── README.md
```

## Getting Started

Each microservice is designed to be independently deployable and scalable. 

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- Docker (for containerization)
- Spring Boot 3.x

### Architecture Overview
- **API Gateway**: Central entry point for all client requests
- **Service Discovery**: Eureka server for service registration
- **User Service**: Handles user registration, authentication, and profiles
- **Mentor Service**: Manages mentor profiles and availability
- **Session Service**: Handles session booking, scheduling, and management
- **Notification Service**: Manages email, SMS, and in-app notifications

### Development Guidelines
1. Each service should be independently testable
2. Use Spring Boot for rapid development
3. Implement proper logging and monitoring
4. Follow REST API best practices
5. Use Docker for containerization
