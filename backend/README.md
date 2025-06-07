# Artemis Backend

The backend service for Artemis, built with Express.js and TypeScript. This service handles authentication, data persistence, and business logic for the Artemis application.

## Features

- JWT Authentication
- PostgreSQL Database
- Database Migrations
- Development hot-reload
- Jest Testing Suite
- RESTful API design
- TypeScript support

## Quick Start

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
Create a `.env` file in the `backend` directory with:
```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/artemis
JWT_SECRET=your_secure_secret_key  # Required in production, defaults to 'just-for-dev' in development

# Alternative Database Configuration
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
```

Note: For production environments, always set a secure JWT_SECRET. The default development value should not be used in production.

3. Set up the database:
```bash
# Run migrations
npm run migrate

# Rollback migrations if needed
npm run migrate:down
```

⚠️ **Warning**: Down migrations will DROP tables and delete all data. Use with caution, especially in production environments.

## Development

Start the development server with hot reload:
```bash
npm run dev
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Production Build

```bash
npm run build
npm start
```

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

## API Structure

The API follows RESTful conventions and is versioned. All endpoints are prefixed with `/api/v1/`.

### Authentication

All requests to authenticated endpoints must include a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Available Endpoints

#### Public Endpoints (No Authentication Required)
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh access token using a valid refresh token

#### Authenticated Endpoints (Require Valid JWT)
- **Cars**
  - `GET /api/v1/cars` - List all cars owned by the authenticated user
  - `POST /api/v1/cars` - Create a new car
  - `GET /api/v1/cars/:id` - Get details of a specific car
  - `PUT /api/v1/cars/:id` - Update a car's details
  - `DELETE /api/v1/cars/:id` - Delete a car

- **User**
  - `GET /api/v1/user/profile` - Get authenticated user's profile
  - `PUT /api/v1/user/profile` - Update user profile
  - `PUT /api/v1/user/password` - Change password

Any request to an authenticated endpoint without a valid JWT token will receive a 401 Unauthorized response:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

## Database

### Migrations

The application uses a simple migration system located in `src/db/migrate.ts`. Migrations are executed in order and can be rolled back if needed.

Current migrations:
1. Create users table (`001_create_users_table`)
2. Create cars table (`002_create_cars_table`) - Stores vehicle information with user ownership

To create new migrations:
1. Create migration file in `src/db/migrations/` using the format: `YYYYMMDDHHMMSS_description.ts`
2. Add up/down SQL
3. Test migration and rollback
4. Update relevant models

### Migration Safety

- **Up migrations** create or modify database structures in a non-destructive way
- **Down migrations** (rollbacks) will DROP affected tables and DELETE ALL DATA
- Always backup your database before running migrations in production
- Test migrations in a development environment first

### Timestamp Conventions

All models in the system follow these timestamp conventions:

#### created_at
- Automatically set when a record is created
- Non-nullable
- Set by the database using `DEFAULT CURRENT_TIMESTAMP`
- Never modified after creation

#### updated_at
- Nullable
- Initially undefined/null when record is created
- Only set when the record's data is explicitly updated
- Not modified during soft deletion
- Updated via application logic, not database triggers

#### deleted_at
- Nullable
- Initially undefined/null when record is created
- Set to current timestamp when record is soft-deleted
- Never modified once set (no un-deletion)
- Used to filter out soft-deleted records in queries

These conventions ensure consistent behavior across all models and make it clear:
- When a record was created
- If/when it was last modified
- If/when it was soft-deleted

Example queries should always include `WHERE deleted_at IS NULL` unless specifically querying for deleted records.

## API Error Handling

Currently, error responses are handled directly in the controllers, following this standard format:
```typescript
{
  error: {
    code: string,      // Error code (e.g., 'UNAUTHORIZED', 'BAD_REQUEST')
    message: string,   // User-friendly error message
    details?: any      // Optional additional error details
  }
}
```

Common error responses:

- **401 Unauthorized**
  ```json
  {
    "error": {
      "code": "UNAUTHORIZED",
      "message": "Authentication required"
    }
  }
  ```

- **400 Bad Request**
  ```json
  {
    "error": {
      "code": "BAD_REQUEST",
      "message": "Invalid input data",
      "details": {
        "email": "Must be a valid email address"
      }
    }
  }
  ```

- **404 Not Found**
  ```json
  {
    "error": {
      "code": "NOT_FOUND",
      "message": "Resource not found"
    }
  }
  ```

- **500 Internal Server Error**
  ```json
  {
    "error": {
      "code": "INTERNAL_SERVER_ERROR",
      "message": "An unexpected error occurred"
    }
  }
  ```

### TODO: Error Type Definition

To improve type safety and consistency, we should define error types in a central location. Suggested implementation:

1. Create `src/types/errors.ts`:
```typescript
export type ErrorCode = 
  | 'UNAUTHORIZED'
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR';

export interface ApiError {
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  }
}
```

2. Use these types in controllers and middleware for consistent error handling.

## Common Development Tasks

### Adding a New API Endpoint

1. Create route handler in `src/controllers/`
2. Add route definition in `src/routes/`
3. Add validation schema if needed
4. Add tests in `tests/`

### Adding New Environment Variables

1. Add to `.env`
2. Update `.env.example`
3. Add type in `src/config/env.ts`
4. Update documentation
