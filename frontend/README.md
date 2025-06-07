# Artemis Frontend

React frontend for the Artemis application, providing a modern and responsive user interface for car mileage tracking.

## Features

- JWT-based authentication
- Protected and guest routes
- Real-time form validation
- Responsive design
- Comprehensive test coverage
- Type-safe development with TypeScript

## Tech Stack

- **Framework**: React 18.x
- **Language**: TypeScript
- **State Management**: React Context API
- **Routing**: React Router v6
- **Testing**: 
  - Vitest + React Testing Library for unit testing
  - Cypress for end-to-end testing
- **HTTP Client**: Axios
- **Build Tool**: Vite

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:3000  # Backend API URL
```

3. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test:unit` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

### Project Structure

```
frontend/
├── src/
│   ├── assets/          # Static assets (images, styles)
│   ├── components/      # Reusable React components
│   │   └── __tests__/  # Component tests
│   ├── pages/          # Page components
│   │   └── __tests__/  # Page tests
│   ├── router/         # React Router configuration
│   ├── stores/         # Context providers
│   │   └── __tests__/  # Store tests
│   ├── services/       # API services and utilities
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Root component
│   └── main.tsx        # Application entry point
├── public/             # Public static assets
├── tests/              # Test setup and utilities
└── env.d.ts           # Environment variables types
```

## Authentication

The application implements JWT-based authentication with the following features:

### Auth Flow
- User registration with email validation
- User login with credentials
- Automatic token refresh
- Session persistence using localStorage
- Logout with token cleanup

### Route Protection

#### Protected Routes
Routes that require authentication use the `ProtectedRoute` component:
```typescript
{
  path: '/dashboard',
  element: <ProtectedRoute><Dashboard /></ProtectedRoute>
}
```

#### Guest Routes
Routes only accessible to non-authenticated users:
```typescript
{
  path: '/login',
  element: <GuestRoute><Login /></GuestRoute>
}
```

## State Management

The application uses React Context API for state management:

### Available Contexts

- **AuthContext**: Manages authentication state
  - User information
  - Token management
  - Login/Logout operations
  - Registration flow

### Usage Example
```typescript
const { user, login, logout } = useAuth();
```

## API Integration

### Error Handling

API errors are handled consistently throughout the application:

```typescript
try {
  await api.post('/endpoint');
} catch (err) {
  if (err.response?.status === 401) {
    // Handle unauthorized
  } else if (err.response?.status === 404) {
    // Handle not found
  } else {
    // Handle unexpected errors
  }
}
```

## Testing

### Unit Testing

Run unit tests with:
```bash
# Run all tests
npm run test:unit

# Watch mode
npm run test:unit -- --watch

# Coverage report
npm run test:unit -- --coverage
```

### Test Environment Setup

The test environment includes special handling for:

- WebCrypto API polyfill for Node.js environment
- Proper ESM support
- Test isolation

For detailed test environment configuration, see [DEVELOPMENT_NOTES.md](./DEVELOPMENT_NOTES.md).

## Build and Deployment

### Production Build

Create a production build:
```bash
npm run build
```

The build output will be in the `dist` directory, ready for deployment to any static file server.

### Environment Configuration

Required environment variables:
- `VITE_API_URL`: Backend API URL (default: http://localhost:3000)

For development-specific configuration, create a `.env.development` file.
For production, use `.env.production`.
