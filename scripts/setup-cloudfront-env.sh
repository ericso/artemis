#!/bin/bash

# Get stack outputs
STACK_NAME="autostat-frontend"
REGION="us-east-1"

echo "Fetching CloudFormation stack outputs..."
DISTRIBUTION_ID="E2SUR8TQL3JQOZ"
DISTRIBUTION_DOMAIN="d26x71430m93jn.cloudfront.net"

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create the environment variable file
cat > frontend/.env.production << EOF
VITE_API_URL=https://api.autostat.app
VITE_APP_URL=https://autostat.app
EOF

# Export CloudFront variables
echo "export CLOUDFRONT_DISTRIBUTION_ID=\"$DISTRIBUTION_ID\"" > frontend/.env.cloudfront
echo "export CLOUDFRONT_DISTRIBUTION_ARN=\"arn:aws:cloudfront::${ACCOUNT_ID}:distribution/${DISTRIBUTION_ID}\"" >> frontend/.env.cloudfront
echo "export CLOUDFRONT_DOMAIN=\"$DISTRIBUTION_DOMAIN\"" >> frontend/.env.cloudfront

echo "Environment files created:"
echo "- frontend/.env.production"
echo "- frontend/.env.cloudfront"
echo ""
echo "To load the CloudFront variables into your shell, run:"
echo "source frontend/.env.cloudfront" 