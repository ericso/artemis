# AutoStat API

This is the backend API for the AutoStat application, designed to run on AWS Lambda with Aurora Serverless v2.

## Prerequisites

- Node.js 18.x or later
- AWS CLI configured with appropriate credentials
- Serverless Framework CLI (`npm install -g serverless`)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up AWS Systems Manager Parameter Store with the following parameters:
   - /autostat/{stage}/db/host
   - /autostat/{stage}/db/user
   - /autostat/{stage}/db/password
   - /autostat/{stage}/db/name
   - /autostat/{stage}/db/port
   - /autostat/{stage}/jwt/secret
   - /autostat/{stage}/frontend/url
   - /autostat/{stage}/vpc/securityGroupId
   - /autostat/{stage}/vpc/subnetId1
   - /autostat/{stage}/vpc/subnetId2

3. Create Aurora Serverless v2 cluster in AWS:
   - Use the AWS Console or CLI to create an Aurora Serverless v2 cluster
   - Configure the security group to allow access from Lambda functions
   - Note down the cluster endpoint and credentials

4. Run database migrations:
```bash
npm run migrate
```

## Development

For local development:
```bash
npm run dev
```

This will start the server locally using serverless-offline.

## Deployment

Deploy to development:
```bash
npm run deploy
```

Deploy to production:
```bash
npm run deploy:prod
```

## Architecture

- **API Gateway**: Handles HTTP requests and forwards them to Lambda
- **Lambda**: Runs the Express.js application
- **Aurora Serverless v2**: PostgreSQL-compatible database that scales automatically
- **VPC**: Lambda functions run in a VPC to securely connect to Aurora
- **Systems Manager**: Stores configuration and secrets

## Important Notes

1. The database connection pool is optimized for Lambda:
   - Uses a maximum of 1 connection per Lambda container
   - Configured with appropriate timeouts
   - SSL enabled for Aurora Serverless v2

2. Environment variables are managed through AWS Systems Manager Parameter Store

3. The application is configured to run in a VPC to access Aurora Serverless v2

4. Cold starts are minimized by:
   - Using connection pooling
   - Optimizing the Lambda package size
   - Setting appropriate memory and timeout values

## Features

- JWT Authentication
- PostgreSQL Database
- Database Migrations
- Development hot-reload
- Vitest Testing Suite
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

The server will start at `http://localhost:3000`.

### Testing

The project uses Vitest for testing.

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

## Local Development Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
   - Copy `config/local.example.json` to `config/local.env.json`
   - Update the values in `local.env.json` with your local database credentials and settings
   - For development environment, copy `config/dev.example.json` to `config/dev.env.json`

3. Start the development server:
```bash
npm run dev
```

The server will start at `http://localhost:3000`.

## Environment Configuration

The application uses different configuration files for different environments:

- `config/local.env.json`: Local development settings (not committed to git)
- `config/dev.env.json`: Development environment settings (not committed to git)
- `config/*.example.json`: Example configuration files (committed to git)

Required configuration variables:
- `DB_HOST`: Database host
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `DB_PORT`: Database port
- `JWT_SECRET`: Secret for JWT token generation
- `FRONTEND_URL`: URL of the frontend application
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS

### CORS Configuration

The application supports flexible CORS configuration through environment variables:

1. **Format**:
   - Comma-separated list of allowed origins
   - Example: `"http://localhost:5173,https://autostat.app,https://d26x71430m93jn.cloudfront.net"`

2. **Local Development**:
   ```json
   {
     "CORS_ALLOWED_ORIGINS": "http://localhost:5173,http://localhost:3000"
   }
   ```

3. **AWS Environments**:
   - Configured via AWS Systems Manager Parameter Store
   - Parameter name: `/autostat/{stage}/cors/allowed_origins`
   - Example:
     ```bash
     aws ssm put-parameter \
       --name "/autostat/dev/cors/allowed_origins" \
       --value "http://localhost:5173,https://autostat.app" \
       --type "SecureString" \
       --overwrite
     ```

4. **Security Considerations**:
   - Always use full URLs including protocol (http/https)
   - Avoid using wildcards (*) for production environments
   - Include both www and non-www versions if needed
   - Consider adding development/staging domains for testing

5. **Updating CORS Settings**:
   - Changes to CORS settings require redeployment
   - No code changes needed, just update the environment variable
   - Remember to update both API Gateway and Express CORS settings

## Available Scripts

- `npm run dev`: Start the development server with hot reload
- `npm run build`: Build the TypeScript code
- `npm run test`: Run tests
- `npm run deploy`: Deploy to AWS (requires AWS credentials)
