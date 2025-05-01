# Installation Guide

This guide will help you set up and run the Sola AI application locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- Yarn package manager
- Git
- A code editor of your choice (VS Code recommended)
- A Solana wallet with SOL tokens for testing

## Quick Start

1. Clone the repository:

```sh
git clone https://github.com/TheSolaAI/sola-application.git
```

2. Navigate to the project directory:

```sh
cd sola-application
```

3. Install dependencies:

```sh
yarn install
```

4. Set up environment variables (see env configuration and details section below)

5. Start the development server:

```sh
yarn dev
```

6. Open your browser and navigate to `http://localhost:5173`

## Configuration

Create a `.env` file in the root directory with the following environment variables:

### Required Environment Variables

```env
# Base URL
NEXT_PUBLIC_BASE_URL=https://beta.solaai.xyz

# Authentication (Privy)
NEXT_PUBLIC_PRIVY_APP_ID=cm5lc4euv00c5kmrbpu9oj0u4
PRIVY_VERIFICATION_KEY=
PRIVY_APP_SECRET=

# OpenAI Configuration
OPENAI_API_KEY=

# Database Configuration
DATABASE_URL=

# Solana Configuration
NEXT_PUBLIC_SOLANA_RPC=
SOLANA_RPC_URL=
SOLANA_PRIVATE_KEY=

# Microservices URLs
NEXT_PUBLIC_WALLET_SERVICE_URL=https://wallet-service.solaai.tech/
NEXT_PUBLIC_DATA_SERVICE_URL=https://data-stream-service.solaai.tech/
NEXT_PUBLIC_AUTH_SERVICE_URL=https://user-service.solaai.tech/api/v1/

# Monitoring (Optional)
SENTRY_AUTH_TOKEN=
```

### Environment Variable Details

- **NEXT_PUBLIC_BASE_URL**: The base URL for the application (e.g., https://beta.solaai.xyz)
- **NEXT_PUBLIC_PRIVY_APP_ID**: Use `cm5lc4euv00c5kmrbpu9oj0u4` or your own Privy app ID
- **PRIVY_VERIFICATION_KEY**: Your Privy verification key for server-side authentication
- **PRIVY_APP_SECRET**: Your Privy app secret for secure server-side operations
- **OPENAI_API_KEY**: Your OpenAI API key for AI functionality
- **DATABASE_URL**: PostgreSQL database connection string for Prisma
- **NEXT_PUBLIC_SOLANA_RPC**: Public-facing Solana RPC endpoint
- **SOLANA_RPC_URL**: Server-side Solana RPC endpoint
- **SOLANA_PRIVATE_KEY**: Solana private key for signing transactions
- **SENTRY_AUTH_TOKEN**: Sentry authentication token for error monitoring (optional for development)

### Security Note

For production deployments:

- Use Cloudflare Workers or similar service to secure sensitive keys
- Never commit the `.env` file to version control
- Implement proper key rotation and management
- Use environment-specific configuration

## Development

Start the development server:

```sh
yarn dev
```

The application will be available at `http://localhost:5173`

## Troubleshooting

If you encounter issues during setup:

1. **Node.js Version**

   - Ensure you're using Node.js v18 or higher
   - Use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions:
     ```sh
     nvm install 18
     nvm use 18
     ```

2. **Dependencies Issues**

   - Clear dependency cache and reinstall:
     ```sh
     rm -rf node_modules yarn.lock
     yarn cache clean
     yarn install
     ```

3. **Environment Variables**

   - Verify all required variables are set in `.env`
   - Check for typos in variable names
   - Ensure service endpoints are accessible

4. **Database Connection**

   - Verify your PostgreSQL database is running
   - Check that your DATABASE_URL is correctly formatted
   - Run `npx prisma generate` to update the Prisma client

5. **Network Issues**

   - Check your internet connection
   - Verify Solana RPC endpoint is responsive
   - Ensure you have access to required microservices

## Support

If you continue to experience issues:

1. Check existing [GitHub Issues](https://github.com/TheSolaAI/sola-application/issues)
2. Review the [Documentation](https://github.com/TheSolaAI/sola-application/docs)
3. Open a new GitHub issue with:
   - Detailed error description
   - Environment details (OS, Node version)
   - Steps to reproduce
   - Relevant error logs

## Contributing

Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.