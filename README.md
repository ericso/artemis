# Prometheus

A monorepo containing a full-stack TypeScript application with Express backend and Vue.js frontend.

## Project Structure

```
prometheus/
├── backend/         # Express.js + TypeScript backend
├── frontend/        # Vue.js frontend
└── README.md       # This file
```

## Backend

The backend service is built with Express.js and TypeScript, featuring:
- JWT Authentication
- PostgreSQL Database
- Database Migrations
- Development hot-reload
- Jest Testing Suite

### Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
Create a `.env` file in the `backend` directory with:
```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/prometheus
JWT_SECRET=your_secure_secret_key  # Required in production, defaults to 'just-for-dev' in development

# Alternative Database Configuration
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
```

Note: For production environments, always set a secure JWT_SECRET. The default development value should not be used in production.

3. Database Setup:
```bash
cd backend
# Run migrations
npm run migrate

# Rollback migrations if needed
npm run migrate:down
```

⚠️ **Warning**: Down migrations will DROP tables and delete all data. Use with caution, especially in production environments.

### Backend Development

```bash
cd backend
npm run dev
```

### Backend Testing

```bash
cd backend
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Backend Production Build

```bash
cd backend
npm run build
npm start
```

## Frontend

For frontend development notes and setup instructions, see [frontend/DEVELOPMENT_NOTES.md](frontend/DEVELOPMENT_NOTES.md).

## Database Migrations

The application uses a simple migration system located in `backend/src/db/migrate.ts`. Migrations are executed in order and can be rolled back if needed.

Current migrations:
1. Create users table (`001_create_users_table`)

To create new migrations, add them to the `backend/src/db/migrations` directory and update the `migrate.ts` file accordingly.

### Migration Safety

- **Up migrations** create or modify database structures in a non-destructive way
- **Down migrations** (rollbacks) will DROP affected tables and DELETE ALL DATA
- Always backup your database before running migrations in production
- Test migrations in a development environment first

## Timestamp Conventions

All models in the system follow these timestamp conventions:

### created_at
- Automatically set when a record is created
- Non-nullable
- Set by the database using `DEFAULT CURRENT_TIMESTAMP`
- Never modified after creation

### updated_at
- Nullable
- Initially undefined/null when record is created
- Only set when the record's data is explicitly updated
- Not modified during soft deletion
- Updated via application logic, not database triggers

### deleted_at
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
