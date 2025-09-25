# AceInterview Backend Server

A robust NestJS backend server for the AceInterview application, featuring secure authentication, user management, and interview preparation tools.

![NestJS](https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Convex](https://img.shields.io/badge/convex-FF6B6B?style=for-the-badge&logo=convex&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

## 🚀 Features

- ✅ **Secure Authentication** - JWT-based authentication with BetterAuth integration
- ✅ **User Management** - Complete user registration, login, and profile management
- ✅ **Password Security** - bcrypt encryption with salt rounds for secure password storage
- ✅ **Session Management** - Token-based sessions with automatic cleanup
- ✅ **Real-time Database** - Convex DB for scalable, real-time data operations
- ✅ **Type Safety** - Full TypeScript support with strict type checking
- ✅ **Input Validation** - Comprehensive DTO validation with class-validator
- ✅ **CORS Support** - Configured for frontend integration

## 🏗️ Architecture

### Technology Stack

- **Framework**: [NestJS](https://nestjs.com/) - A progressive Node.js framework
- **Database**: [Convex](https://www.convex.dev/) - Real-time database with TypeScript support
- **Authentication**: [BetterAuth](https://better-auth.com/) + JWT tokens
- **Password Hashing**: [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- **Validation**: [class-validator](https://github.com/typestack/class-validator)
- **Language**: TypeScript with strict type checking

### Authentication Flow

The authentication system uses **BetterAuth** principles with custom JWT implementation:

1. **User Registration** - Secure password hashing with bcrypt
2. **JWT Token Generation** - 24-hour expiration tokens
3. **Session Management** - Database-stored sessions for security
4. **Token Validation** - JWT strategy with Passport.js
5. **Automatic Cleanup** - Expired sessions are automatically removed

### Database Schema (Convex)

```typescript
// User Table
users: {
  email: string,           // Unique user email (indexed)
  name: string,           // User's display name
  hashedPassword: string, // bcrypt hashed password
  emailVerified: boolean, // Email verification status
  createdAt: number,      // Unix timestamp
  updatedAt: number       // Unix timestamp
}

// Sessions Table
sessions: {
  userId: string,     // Reference to user ID
  token: string,      // JWT token (indexed)
  expiresAt: number, // Token expiration timestamp
  createdAt: number  // Session creation timestamp
}
```

## 🛠️ Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Convex account (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server-aceinterview
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-here
   CONVEX_DEPLOYMENT=your-convex-deployment-url
   ```

4. **Deploy Convex schema**
   ```bash
   npx convex dev
   ```

5. **Start the development server**
   ```bash
   npm run start:dev
   ```

The server will start on `http://localhost:3001` (NestJS)
Convex database will run on `http://localhost:3000`

## 📡 API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/signup` | Register new user | ❌ |
| `POST` | `/auth/signin` | User login | ❌ |
| `GET` | `/auth/profile` | Get user profile | ✅ |
| `GET` | `/auth/me` | Get current user | ✅ |
| `POST` | `/auth/signout` | User logout | ✅ |

### Request/Response Examples

#### Sign Up
```bash
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Sign In
```bash
POST /auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Profile (Protected Route)
```bash
GET /auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "emailVerified": false,
  "createdAt": 1704067200000,
  "updatedAt": 1704067200000
}
```

## 🛠️ Development Commands

```bash
# Development with hot reload
npm run start:dev

# Production build
npm run build
npm run start:prod

# Linting and formatting
npm run lint
npm run format

# Testing
npm run test
npm run test:e2e
npm run test:cov
```

## 🏗️ Project Structure

```
server-aceinterview/
├── convex/                    # Convex database functions
│   ├── schema.ts             # Database schema definitions
│   ├── users.ts              # User & session database functions
│   └── _generated/           # Auto-generated Convex types
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── dto/             # Data transfer objects
│   │   ├── auth.controller.ts # Auth REST endpoints
│   │   ├── auth.service.ts   # Auth business logic
│   │   ├── auth.module.ts    # Auth module config
│   │   ├── jwt.strategy.ts   # JWT authentication strategy
│   │   └── jwt-auth.guard.ts # JWT route guard
│   ├── convex/              # Convex integration
│   │   └── convex.service.ts # Convex database service
│   ├── app.module.ts        # Main application module
│   └── main.ts              # Application bootstrap
├── test/                    # E2E tests
├── .env                     # Environment variables
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **JWT Tokens**: Stateless authentication with 24-hour expiration
- **Session Management**: Server-side session tracking for enhanced security
- **Input Validation**: Comprehensive validation using class-validator
- **CORS Configuration**: Properly configured for frontend integration
- **Environment Variables**: Sensitive data stored in environment variables

## 🚀 Deployment

### Environment Variables for Production

```env
JWT_SECRET=your-super-secure-production-jwt-secret
CONVEX_DEPLOYMENT=https://your-production-convex-deployment.convex.cloud
NODE_ENV=production
PORT=3001
```

### Build and Deploy

```bash
# Build the application
npm run build

# Start in production mode
npm run start:prod
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you have any questions or need help, please:

1. Check the [NestJS Documentation](https://docs.nestjs.com)
2. Review the [Convex Documentation](https://docs.convex.dev)
3. Open an issue in this repository
4. Contact the development team

---

**Made with ❤️ for AceInterview - Helping you ace your next interview!**
