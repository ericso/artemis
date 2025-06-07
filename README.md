# Artemis

An app that tracks your cars and their mileage.

## Project Structure

```
artemis/
├── backend/         # Express.js backend
├── frontend/        # React frontend
└── README.md        # This file
```

## Overview

Artemis is split into two main components:

- **Backend**: Express.js/TypeScript service handling data and business logic. See [backend/README.md](backend/README.md) for setup and development details.
- **Frontend**: React application providing the user interface. See [frontend/DEVELOPMENT_NOTES.md](frontend/DEVELOPMENT_NOTES.md) for more information.

## Getting Started

1. Set up the backend service following instructions in [backend/README.md](backend/README.md)
2. Set up the frontend application following instructions in [frontend/DEVELOPMENT_NOTES.md](frontend/DEVELOPMENT_NOTES.md)

## Development

Each component (backend/frontend) has its own development workflow and requirements. Please refer to their respective documentation for detailed instructions.

## Continuous Integration

The project uses GitHub Actions for continuous integration. The following checks are run on each pull request and push to the main branch:

- Unit tests across multiple Node.js versions (16.x, 18.x, 20.x)
- ESLint code linting
- TypeScript type checking

The workflow configuration can be found in `.github/workflows/test.yml`.