# Artemis Backend

The backend service for Artemis, built with Express.js and TypeScript. This service handles authentication, data persistence, and business logic for the Artemis application.

## Application Structure

```
backend/
├── src/
│   ├── config/           # Configuration files and environment setup
│   ├── controllers/      # Request handlers and business logic
│   ├── db/
│   │   ├── migrations/   # Database migration files
│   │   └── models/       # Database models and queries
│   ├── middleware/       # Express middleware (auth, validation, etc.)
│   ├── routes/          # API route definitions
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions and helpers
│   └── app.ts           # Express application setup
├── tests/               # Test files mirroring src/ structure
├── .env                 # Environment variables (not in repo)
└── tsconfig.json        # TypeScript configuration
```

Note: This project uses npm workspaces for dependency management. Dependencies are managed through the root `package.json`, but workspace-specific dependencies can be added using:
```bash
npm install <package> --workspace=backend
```

## Development Commands

From the root directory:
```bash
npm run dev:backend    # Start backend in development mode
npm test              # Run backend tests
npm start             # Start backend in production mode
```

## Key Technologies

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT-based
- **Testing**: Jest

## API Structure

The API follows RESTful conventions and is versioned. All endpoints are prefixed with `/api/v1/`.

### Authentication Endpoints

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh access token

### Protected Routes

All protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Error Handling

The application uses a centralized error handling system:

- Custom error classes in `src/utils/errors/`
- Global error middleware in `src/middleware/error.ts`
- Standardized error responses:
  ```typescript
  {
    error: {
      code: string,      // Error code (e.g., 'UNAUTHORIZED')
      message: string,   // User-friendly message
      details?: any      // Optional additional information
    }
  }
  ```

## Database Patterns

### Models

Models follow an Active Record-like pattern with static methods for queries:

```typescript
class User extends BaseModel {
  static async findByEmail(email: string): Promise<User | null> {
    // Implementation
  }
}
```

### Migrations

Migrations are timestamp-based and follow a consistent naming pattern:
```
YYYYMMDDHHMMSS_description.ts
```

## Development Practices

### Environment Variables

Required environment variables:
```
PORT=3000                  # Server port
NODE_ENV=development      # Environment (development/production)
DATABASE_URL=             # PostgreSQL connection string
JWT_SECRET=              # JWT signing secret
```

### Code Style

- ESLint configuration for TypeScript
- Prettier for code formatting
- Husky for pre-commit hooks

### Testing

Tests are organized to mirror the source structure:

```
tests/
├── integration/        # Integration tests
├── unit/              # Unit tests
└── fixtures/          # Test data and helpers
```

Run tests:
```bash
npm test               # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Security Features

- CORS configuration
- Helmet middleware

## Common Development Tasks

### Adding a New API Endpoint

1. Create route handler in `src/controllers/`
2. Add route definition in `src/routes/`
3. Add validation schema if needed
4. Add tests in `tests/`

### Creating a New Migration

1. Create migration file in `src/db/migrations/`
2. Add up/down SQL
3. Test migration and rollback
4. Update relevant models

### Adding New Environment Variables

1. Add to `.env`
2. Update `.env.example`
3. Add type in `src/config/env.ts`
4. Update documentation 
