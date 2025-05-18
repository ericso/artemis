# Artemis Frontend

A modern Vue.js frontend application for user authentication and management, built with Vue 3, TypeScript, and Pinia.

## Features

- 🔐 Secure JWT-based authentication
- 📱 Responsive design
- 🎯 Type-safe development with TypeScript
- 🏪 State management with Pinia
- 🧪 Comprehensive test coverage
- 🛣️ Vue Router with navigation guards

## Tech Stack

- Vue.js 3.x with Composition API
- TypeScript
- Pinia for state management
- Vue Router for navigation
- Vitest for unit testing
- Axios for API communication

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd artemis/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test:unit` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## Project Structure

```
frontend/
├── src/
│   ├── assets/          # Static assets
│   ├── components/      # Reusable Vue components
│   ├── router/          # Vue Router configuration
│   ├── stores/          # Pinia stores
│   ├── services/        # API services
│   ├── views/           # Page components
│   ├── App.vue         # Root component
│   └── main.ts         # Application entry point
├── public/             # Public static assets
├── tests/              # Test files
└── env.d.ts           # Environment variables types
```

## Authentication

The application uses JWT-based authentication. The auth flow includes:

- User registration
- User login
- Protected routes
- Automatic token management
- Session persistence

### Protected Routes

Routes can be protected using meta fields:

```typescript
{
  path: '/dashboard',
  meta: { requiresAuth: true }
}
```

### Guest Routes

Routes that should only be accessible to non-authenticated users:

```typescript
{
  path: '/login',
  meta: { requiresGuest: true }
}
```

## State Management

The application uses Pinia for state management. The main stores are:

- `auth` - Handles authentication state and operations
- Additional stores can be added as needed

## Testing

The application includes comprehensive unit tests using Vitest. Test files are co-located with their respective components/modules with the `.spec.ts` extension.

### Running Tests

```bash
# Run unit tests
npm run test:unit

# Run unit tests in watch mode
npm run test:unit -- --watch

# Run with coverage
npm run test:unit -- --coverage
```

### Test Structure

- Component tests: `src/components/__tests__/`
- Store tests: `src/stores/__tests__/`
- View tests: `src/views/__tests__/`
- Router guard tests: `src/router/__tests__/`

## API Integration

The application communicates with the backend API using Axios. The base configuration can be found in `src/services/api.ts`.

## Contributing

1. Create a feature branch
2. Make your changes
3. Write or update tests
4. Update documentation
5. Submit a pull request

## Environment Variables

The following environment variables are required:

- `VITE_API_URL`: Backend API URL (default: http://localhost:3000)

Additional environment variables can be added as needed.

## Build and Deployment

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory and can be served using any static file server.

## Continuous Integration

The project uses GitHub Actions for continuous integration. The following checks are run on each pull request and push to the main branch:

- Unit tests across multiple Node.js versions (16.x, 18.x, 20.x)
- ESLint code linting
- TypeScript type checking

The workflow configuration can be found in `.github/workflows/test.yml`.

### Status Badges

[![Frontend Tests](https://github.com/ericso/artemis/actions/workflows/test.yml/badge.svg)](https://github.com/<username>/artemis/actions/workflows/test.yml)

## License

[MIT License](LICENSE)
