# CivicLens Backend Service

Spring Boot 3 REST API service for CivicLens.

## Technologies
- Java 21
- Spring Boot 3.3.4 (Web, Data JPA, Security, Validation)
- PostgreSQL
- Flyway Migrations
- JJWT (JSON Web Token)
- JUnit 5 & Mockito

## Package Structure
- `config/`: Security, WebMvc, CORS, and application configurations
- `controller/`: REST API endpoints
- `dto/`: Request and response data structures
- `entity/`: JPA database entities (`User`, `CivicReport`, `ReportStatusHistory`)
- `repository/`: Spring Data JPA database queries
- `service/`: Core business logic
- `security/`: JWT token utilities and authentication filters
- `exception/`: Unified exception handling

## Running the Backend
Ensure PostgreSQL is running, then run:
```bash
mvn spring-boot:run
```

## Running Tests
```bash
mvn test
```
