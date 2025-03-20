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
# OpenAI Configuration
NEXT_PUBLIC_OPENAI_API_URL=https://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview-2024-12-17
OPENAI_API_KEY= #your open-ai key

# Authentication
NEXT_PUBLIC_PRIVY_APP_ID=cm5lc4euv00c5kmrbpu9oj0u4  

# Solana Configuration
NEXT_PUBLIC_SOLANA_RPC= #Solana RPC
SOLANA_RPC_URL= #Solana RPC

# Microservices URLs
NEXT_PUBLIC_WALLET_SERVICE_URL=https://wallet-service.solaai.tech/  
NEXT_PUBLIC_DATA_SERVICE_URL=https://data-stream-service.solaai.tech/  
NEXT_PUBLIC_AUTH_SERVICE_URL=https://user-service.solaai.tech/api/v1/  
```

### Environment Variable Details

- **OPENAI_API_URL**: Use GPT-4.0 realtime or realtime mini model url
- **PRIVY_APP_ID**: Use `cm5lc4euv00c5kmrbpu9oj0u4` or your own privy ID.
- **HELIUS_API_KEY**: Your Helius API key for Solana data access
- **SOLANA_RPC**: Your Solana RPC endpoint (Helius RPC recommended)
- **ATA_PRIV_KEY**: Solana private key for general validation (not used in transactions)
- **SENTRY_AUTH_TOKEN**: Can use dummy value for development

### Security Note

For production deployments:

- Use Cloudflare Workers or similar service to secure sensitive keys
- Never commit the `.env` file to version control
- Implement proper key rotation and management
- Use environment-specific configuration

## Development

Start the development server:

```sh
yarn dev -p 5173
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

4. **Network Issues**

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
