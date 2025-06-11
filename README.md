# AutoStat

An app that tracks your cars and their mileage.

## Project Structure

```
autostat/
├── backend/         # Express.js backend
├── frontend/        # React frontend
├── aws/            # AWS configuration and scripts
└── README.md        # This file
```

## Overview

AutoStat is split into two main components:

- **Backend**: Express.js/TypeScript service handling data and business logic. See [backend/README.md](backend/README.md) for setup and development details.
- **Frontend**: React application providing the user interface. See [frontend/DEVELOPMENT_NOTES.md](frontend/DEVELOPMENT_NOTES.md) for more information.

## Getting Started

1. Set up the backend service following instructions in [backend/README.md](backend/README.md)
2. Set up the frontend application following instructions in [frontend/DEVELOPMENT_NOTES.md](frontend/DEVELOPMENT_NOTES.md)

## Development

Each component (backend/frontend) has its own development workflow and requirements. Please refer to their respective documentation for detailed instructions.

## Deployment

### Backend Deployment

The backend is deployed as an AWS Lambda function using the [Serverless Framework](https://www.serverless.com). Key deployment files:

- `backend/serverless.yml` - Serverless Framework configuration
- `backend/src/lambda.ts` - Lambda handler with CORS configuration
- `aws/lambda-vpc-policy.json` - VPC access policy for Lambda
- `aws/lambda-role-trust-policy.json` - IAM role trust policy

To deploy the backend:
```bash
cd backend
npm run deploy
```

### Frontend Deployment

The frontend is built as a static site using Vite. The build output in `frontend/dist` can be deployed to any static hosting service.

To deploy the frontend:
```bash
cd frontend
npm run deploy
```

### AWS Infrastructure

The `aws/` directory contains configuration files and scripts for AWS infrastructure:

- IAM policies for Lambda and SSM
- SSM user data script for instance configuration
- AWS CLI installation scripts

## Continuous Integration

The project uses GitHub Actions for continuous integration. The following checks are run on each pull request and push to the main branch:

- Unit tests across multiple Node.js versions (16.x, 18.x, 20.x)
- ESLint code linting
- TypeScript type checking

The workflow configuration can be found in `.github/workflows/test.yml`.

## Environment Variables

### Backend
Required environment variables for production deployment:
- `DB_HOST` - PostgreSQL database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - Secret for JWT token signing
- `FRONTEND_URL` - Frontend application URL (for CORS)

### Frontend
Required environment variables for production build:
- `VITE_API_URL` - Backend API URL

This URL is provided by the deploy script for the backend. It is provided at `frontend/.env.production`.

### AWS Parameter Store
The environment variables are provided by the AWS Parameter Store. To update these values from the command line, execute the following commands:
```bash
aws ssm put-parameter --name "/autostat/dev/db/host" --value "VALUE" --type "SecureString" --overwrite
aws ssm put-parameter --name "/autostat/dev/db/user" --value "VALUE" --type "SecureString" --overwrite
aws ssm put-parameter --name "/autostat/dev/db/password" --value "VALUE" --type "SecureString" --overwrite
aws ssm put-parameter --name "/autostat/dev/db/name" --value "VALUE" --type "SecureString" --overwrite
aws ssm put-parameter --name "/autostat/dev/db/port" --value "VALUE" --type "SecureString" --overwrite

aws ssm put-parameter --name "/autostat/dev/jwt/secret" --value "VALUE" --type "SecureString" --overwrite
aws ssm put-parameter --name "/autostat/dev/frontend/url" --value "VALUE" --type "SecureString" --overwrite
```

The `/autostat/dev/frontend/url` is the URL from which the static asset frontend is served.

### Security Group ID and Subnet IDs
Additionally, AWS has security group and subnets setup. These are the parameter store keys for setting these values.
```bash
aws ssm put-parameter --name "/autostat/dev/vpc/securityGroupId" --value "VALUE" --type "SecureString" --overwrite
aws ssm put-parameter --name "/autostat/dev/vpc/subnetId1" --value "VALUE" --type "SecureString" --overwrite
aws ssm put-parameter --name "/autostat/dev/vpc/subnetId2" --value "VALUE" --type "SecureString" --overwrite
```