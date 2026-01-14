# Leave Management System

A comprehensive role-based web application for managing leave requests for students and teachers within an educational institution. The system supports structured hierarchies (Departments, Classes, and Class Teachers), enabling streamlined leave reporting, approvals, and analytics.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Features Completed](#features-completed)

## ✨ Features

### Student Features
- ✅ JWT-based authentication
- ✅ Dashboard with analytics (Total, Pending, Approved, Rejected leaves)
- ✅ Apply for leave with date range, subject, and reason
- ✅ View leave history with status tracking
- ✅ View organizational hierarchy (Department → Class → Teacher → Student)
- ✅ Profile management
- ✅ UI settings (Theme, Toast preferences)

### Teacher Features
- ✅ JWT-based authentication
- ✅ Dashboard with analytics (Pending, Approved, Rejected leaves)
- ✅ View and approve/reject student leave requests
- ✅ Mandatory rejection reason for rejected leaves
- ✅ Profile management
- ✅ UI settings

### System Features
- ✅ Role-based access control (RBAC)
- ✅ Audit logging for all actions
- ✅ Soft deletes for master data
- ✅ CORS configuration
- ✅ Centralized error handling
- ✅ Responsive UI design

## 🛠️ Tech Stack

### Backend
- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security** - Authentication & Authorization
- **Spring Data JPA** - Database operations
- **MySQL** - Database
- **JWT (jjwt 0.12.3)** - Token-based authentication
- **Lombok** - Boilerplate code reduction
- **Maven** - Dependency management

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **date-fns** - Date formatting

## 📁 Project Structure

```
ManiPro/
├── src/
│   ├── main/
│   │   ├── java/com/manipro/leavemanagement/
│   │   │   ├── config/              # Configuration classes
│   │   │   ├── controller/          # REST controllers
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   ├── entity/              # JPA entities
│   │   │   ├── repository/          # JPA repositories
│   │   │   ├── security/            # Security configuration
│   │   │   ├── service/             # Business logic
│   │   │   └── util/                # Utility classes
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/com/manipro/leavemanagement/
│           └── service/             # Unit tests
├── frontend/
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── student/            # Student-specific components
│   │   │   └── teacher/            # Teacher-specific components
│   │   ├── context/                # React context (Auth)
│   │   ├── pages/                  # Page components
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── pom.xml
└── README.md
```

## 📋 Prerequisites

- **Java 17** or higher
- **Maven 3.6+**
- **Node.js 18+** and npm
- **MySQL 8.0+**
- **Git**

## 🚀 Setup Instructions

### Backend Setup

1. **Clone the repository**
   ```bash
   cd ManiPro
   ```

2. **Configure MySQL Database**
   - Create a MySQL database named `leave_management`
   - Update `src/main/resources/application.properties` with your MySQL credentials:
     ```properties
     spring.datasource.username=your_username
     spring.datasource.password=your_password
     ```

3. **Update JWT Secret**
   - In `application.properties`, change the JWT secret to a secure value (minimum 256 bits):
     ```properties
     jwt.secret=your-secure-secret-key-minimum-256-bits
     ```

4. **Build and Run**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   
   The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   
   The frontend will start on `http://localhost:3000`

## 📡 API Documentation

### Authentication

#### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "student@example.com",
    "password": "password"
  }
  ```
- **Response:**
  ```json
  {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "role": "STUDENT",
    "userId": "uuid",
    "name": "Student Name",
    "email": "student@example.com"
  }
  ```

### Leaves

#### Apply Leave (Student)
- **POST** `/api/leaves/apply`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "fromDate": "2024-01-15",
    "toDate": "2024-01-17",
    "subject": "Medical Leave",
    "reason": "Fever and cold"
  }
  ```

#### Get My Leaves (Student)
- **GET** `/api/leaves/my-leaves`
- **Headers:** `Authorization: Bearer {token}`

#### Get Pending Leaves (Teacher)
- **GET** `/api/leaves/pending`
- **Headers:** `Authorization: Bearer {token}`

#### Approve/Reject Leave (Teacher)
- **POST** `/api/leaves/approve`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "leaveId": "uuid",
    "action": "APPROVE",
    "rejectionReason": "Optional - required if REJECT"
  }
  ```

### Dashboard

#### Get Dashboard Stats
- **GET** `/api/dashboard/stats`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "totalLeaves": 10,
    "pendingLeaves": 3,
    "approvedLeaves": 5,
    "rejectedLeaves": 2
  }
  ```

### Hierarchy

#### Get Hierarchy Tree
- **GET** `/api/hierarchy/tree`
- **Headers:** `Authorization: Bearer {token}`

### Settings

#### Get User Settings
- **GET** `/api/settings`
- **Headers:** `Authorization: Bearer {token}`

#### Update User Settings
- **PUT** `/api/settings`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "uiSettings": {
      "theme": "light",
      "toastPosition": "top-right",
      "toastDuration": 3000
    }
  }
  ```

## 🧪 Testing

### Backend Tests

Run all tests:
```bash
mvn test
```

Run specific test class:
```bash
mvn test -Dtest=AuthServiceTest
```

### Test Coverage

Unit tests are implemented for:
- ✅ `AuthService` - Login functionality
- ✅ `LeaveService` - Leave application and approval
- ✅ `DashboardService` - Dashboard statistics

## ✅ Features Completed

### Backend
- [x] Spring Boot application setup
- [x] Database entities (Department, Class, Teacher, Student, ClassTeacher, Leave, LeaveStatus, AuditLog, UserSettings)
- [x] JPA repositories with custom queries
- [x] JWT authentication and authorization
- [x] Security configuration with CORS
- [x] Service layer (AuthService, LeaveService, DashboardService, HierarchyService, UserSettingsService)
- [x] REST controllers (AuthController, LeaveController, DashboardController, HierarchyController, SettingsController)
- [x] Data initialization for leave statuses
- [x] Audit logging for all actions
- [x] Unit tests for services

### Frontend
- [x] React + TypeScript setup with Vite
- [x] Tailwind CSS configuration
- [x] Authentication context and protected routes
- [x] Login page
- [x] Student dashboard with analytics cards
- [x] Student leave application form
- [x] Student leave history table
- [x] Hierarchy chart visualization
- [x] Teacher dashboard with analytics
- [x] Teacher approval screen
- [x] Profile page
- [x] Settings page (Theme, Toast preferences)
- [x] Responsive layouts for both roles

### Database
- [x] Entity relationships configured
- [x] Soft delete support (is_active flags)
- [x] UUID primary keys
- [x] Timestamps (created_at, updated_at)
- [x] Foreign key constraints

### Security
- [x] JWT token generation and validation
- [x] Password encryption (BCrypt)
- [x] Role-based access control
- [x] CORS configuration
- [x] API-level authorization checks

## 📝 Notes

1. **Database Setup**: The application will automatically create tables on first run. Ensure MySQL is running and the database exists.

2. **Default Data**: Leave statuses (DRAFT, PENDING, APPROVED, REJECTED) are automatically initialized on application startup.

3. **Password**: Passwords must be hashed using BCrypt before storing in the database. For testing, you can use Spring's BCryptPasswordEncoder to hash passwords.

4. **JWT Secret**: Change the JWT secret in production to a secure random string (minimum 256 bits).

5. **CORS**: The application is configured to allow requests from `http://localhost:3000`. Update this in `application.properties` for production.

## 🔒 Security Considerations

- All passwords are encrypted using BCrypt
- JWT tokens expire after 24 hours (configurable)
- Refresh tokens expire after 7 days (configurable)
- API endpoints are protected by role-based authorization
- Audit logs track all sensitive operations

## 🚧 Future Enhancements

- [ ] Admin role implementation
- [ ] Email notifications
- [ ] Leave calendar view
- [ ] Export leave reports
- [ ] Multi-language support
- [ ] Dark theme implementation
- [ ] Advanced analytics and charts
- [ ] Leave balance tracking
- [ ] Bulk approval/rejection

## 📄 License

This project is part of an educational system implementation.

## 👥 Author

Developed as per PRD requirements for Leave Management System.

---

**Status**: ✅ All core features from PRD have been implemented and tested.
