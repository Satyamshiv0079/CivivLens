# CivicLens — Civic Issue Reporting Platform

CivicLens is a full-stack web application that empowers citizens to report everyday urban issues (potholes, garbage dumps, broken streetlights, water leakage) with descriptions, photos, and interactive map coordinates. Municipal moderators can review, verify, update, and resolve reported issues through a dedicated dashboard.

---

## Technologies Used

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router DOM, Leaflet / React Leaflet, Lucide React
- **Backend**: Java 21, Spring Boot 3, Maven
- **Security**: Spring Security 6, JWT (JSON Web Tokens), BCrypt Password Encoder
- **Database**: PostgreSQL with Spring Data JPA
- **Database Migrations**: Flyway
- **Testing**: JUnit 5, Mockito
- **Containerization**: Docker Compose

---

## Repository Structure

```
CivicLens/
├── frontend/                   # React + TypeScript + Tailwind frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, MapView, etc.)
│   │   ├── pages/              # Application views (Home, Login, Dashboard, etc.)
│   │   ├── services/           # Axios/Fetch API client and endpoints
│   │   ├── types/              # TypeScript interfaces (User, Report, etc.)
│   │   ├── App.tsx             # Main routing and layout
│   │   └── main.tsx            # React entry point
│   ├── public/                 # Static assets
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── backend/                    # Spring Boot 3 + Java 21 backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/civiclens/
│   │   │   │   ├── config/     # App & security configuration
│   │   │   │   ├── controller/ # REST API controllers
│   │   │   │   ├── dto/        # Request & response data transfer objects
│   │   │   │   ├── entity/     # JPA entities (User, CivicReport, StatusHistory)
│   │   │   │   ├── repository/ # Spring Data JPA repositories
│   │   │   │   ├── service/    # Business logic & services
│   │   │   │   ├── security/   # JWT filter, user details, token provider
│   │   │   │   ├── exception/  # Global exception handlers
│   │   │   │   └── CivicLensApplication.java
│   │   │   └── resources/
│   │   │       ├── db/migration/ # Flyway SQL migrations
│   │   │       └── application.yml
│   │   └── test/               # JUnit 5 & Mockito tests
│   ├── pom.xml
│   ├── .env.example
│   └── README.md
├── docker-compose.yml          # Local PostgreSQL container service
├── .gitignore
├── .env.example
└── README.md
```

---

## Prerequisites

- **Java JDK 21** (or Java 17+)
- **Node.js** (v18+ or v20+) and **npm**
- **Maven 3.9+** (or use the included Maven commands)
- **Docker & Docker Compose** (or a local PostgreSQL installation)

---

## Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configure database credentials, JWT secret key, and port numbers if different from defaults.

---

## How to Start PostgreSQL

### Using Docker Compose
```bash
docker compose up -d
```

### Using Local PostgreSQL
Ensure PostgreSQL is running locally on port `5432` with a database named `civiclens_db`, user `civiclens_user`, and password `civiclens_pass` (or update `backend/src/main/resources/application.yml`).

---

## How to Run the Backend

```bash
cd backend
mvn spring-boot:run
```

The backend server starts at: `http://localhost:8080`

API Health Ping: `http://localhost:8080/api/health`

---

## How to Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend development server starts at: `http://localhost:5173`

---

## API Documentation (Endpoints Overview)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | Health and status check | Public |
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Log in and receive JWT token | Public |
| `GET` | `/api/reports` | List civic reports (filter by status/category) | Public / Authenticated |
| `GET` | `/api/reports/{id}` | Get report details and status history | Public / Authenticated |
| `POST` | `/api/reports` | Submit a new civic issue report | Citizen / Authenticated |
| `PUT` | `/api/reports/{id}` | Edit report (title/description) | Citizen Owner |
| `DELETE` | `/api/reports/{id}` | Withdraw report | Citizen Owner |
| `PATCH` | `/api/reports/{id}/status` | Update report status & history | Moderator / Admin |
| `GET` | `/api/reports/statistics` | Aggregated report counts and metrics | Moderator / Admin |
| `POST` | `/api/reports/ai-categorize` | Predict category from title and text | Public / Authenticated |
| `POST` | `/api/reports/check-duplicates` | Detect nearby duplicate issues using Haversine & NLP | Public / Authenticated |

---

## Default Demo Accounts

For local evaluation and testing, the application initializes the following accounts automatically:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Moderator** | `moderator@civiclens.gov` | `Moderator123!` | Review queue, verify/reject, update status, view stats |
| **Citizen** | `citizen@civiclens.gov` | `Citizen123!` | Submit issues, edit/withdraw owned reports |
| **Admin** | `admin@civiclens.gov` | `Admin123!` | Full system and moderation access |

*(You can also use the one-click demo account filler buttons directly on the `/login` screen).*

---

## How to Run Tests

### Backend Unit & Integration Tests
```bash
cd backend
mvn test
```

### Frontend Build & Lint Check
```bash
cd frontend
npm run build
```
