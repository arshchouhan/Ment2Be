# JavaMaven Spring Boot Setup Guide

## Project Structure

```
JavaMaven/
├── pom.xml                          # Maven configuration file
├── SETUP_GUIDE.md                   # This file
├── src/
│   ├── main/
│   │   ├── java/com/app/
│   │   │   ├── AppApplication.java  # Spring Boot main application class
│   │   │   ├── karma/
│   │   │   │   └── KarmaController.java  # Karma API endpoints
│   │   │   └── chat/
│   │   │       └── ChatController.java   # Chat API endpoints
│   │   └── resources/
│   │       └── application.properties    # Application configuration
│   └── test/
│       └── java/com/app/
│           └── AppTest.java
└── target/                          # Compiled output (generated after build)
```

## Prerequisites

- **Java 17** or higher
- **Maven 3.6+** installed
- **Git** (optional, for version control)

## Setup Instructions

### 1. Build the Project

Navigate to the JavaMaven directory and run:

```bash
mvn clean package
```

This command will:
- Clean previous builds
- Download dependencies
- Compile the source code
- Run tests
- Package the application as a JAR file

### 2. Run the Application

After building, run the application using:

```bash
java -jar target/JavaMaven-1.0-SNAPSHOT.jar
```

Or use Maven directly:

```bash
mvn spring-boot:run
```

### 3. Verify the Application

Once running, the application will be available at:
- **Base URL**: `http://localhost:8081`
- **Health Check**: `http://localhost:8081/actuator/health`

## API Endpoints

### Karma Service
- `GET /api/karma/calculate?userId={userId}` - Calculate karma for a user
- `POST /api/karma/update` - Update user karma
- `GET /api/karma/user/{userId}` - Get user karma details

### Chat Service
- `GET /api/chat/messages/{conversationId}` - Get messages from a conversation
- `POST /api/chat/send` - Send a new message
- `GET /api/chat/conversations/{userId}` - Get all conversations for a user
- `DELETE /api/chat/messages/{messageId}` - Delete a message

## Configuration

Edit `src/main/resources/application.properties` to customize:
- Server port (default: 8081)
- Logging levels
- Database connection (if using a database)
- Jackson serialization options

## Development

### Adding Dependencies

Edit `pom.xml` and add new dependencies in the `<dependencies>` section:

```xml
<dependency>
    <groupId>group.id</groupId>
    <artifactId>artifact-id</artifactId>
    <version>version</version>
</dependency>
```

Then run:
```bash
mvn clean install
```

### Creating New Controllers

1. Create a new package under `src/main/java/com/app/`
2. Create a controller class with `@RestController` annotation
3. Define endpoints with `@GetMapping`, `@PostMapping`, etc.
4. Run `mvn clean package` to rebuild

### Running Tests

```bash
mvn test
```

## Troubleshooting

### Port Already in Use
If port 8081 is already in use, change it in `application.properties`:
```properties
server.port=8082
```

### Maven Not Found
Ensure Maven is installed and added to your system PATH:
```bash
mvn -v
```

### Build Failures
Clear Maven cache and rebuild:
```bash
mvn clean install -U
```

## Integration with Node.js Backend

This Spring Boot application can be called from the Node.js backend:

```javascript
const response = await fetch('http://localhost:8081/api/karma/calculate?userId=user123');
const data = await response.json();
```

## Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Maven Documentation](https://maven.apache.org/guides/)
- [REST API Best Practices](https://restfulapi.net/)

## Support

For issues or questions, refer to the main project documentation or contact the development team.
