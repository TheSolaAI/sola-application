# Installation

To get started with Sola AI, follow these steps:

1. Clone the repository:

    ```sh
    git clone https://github.com/TheSolaAI/sola-application.git
    ```

2. Navigate to the project directory:

    ```sh
    cd sola-application
    ```

3. Install the dependencies:

    ```sh
    npm install
    ```

4. Create a `.env` file in the root folder and add your environment variables as described below.

5. Start the development server:

    ```sh
    npm run dev
    ```

6. Open your browser and navigate to `http://localhost:3000`.

## Environment Variables

Create a `.env` file in the root folder to store your API keys and other environment variables.

```env
# Application ID for PRVI
PRVI_APP_ID=your_prvi_app_id_here

# Helius API Key
HELIUS_API_KEY=your_helius_api_key_here

# Solana RPC URL
SOLANA_RPC=your_solana_rpc_url_here

# Wallet Service URL
WALLET_SERVICE_URL=your_wallet_service_url_here

# Data Service URL
DATA_SERVICE_URL=your_data_service_url_here

# Sentry Auth Token
SENTRY_AUTH_TOKEN=your_sentry_auth_token_here
```

> During production, use third-party services to keep the keys secure.

## Running the Application

To start the project:

```sh
npm run dev
```

## Troubleshooting

If you encounter any issues during installation or setup, try the following steps:

1. Ensure you have the correct version of Node.js and npm installed. Use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions.
2. Check that all required environment variables are set correctly in your `.env` file.
3. Delete the `node_modules` folder and reinstall dependencies:

    ```sh
    rm -rf node_modules
    npm install
    ```

4. If you encounter issues with specific dependencies, try updating them to the latest versions.
5. Refer to the project's GitHub issues page for any similar issues and their resolutions.

If the problem persists, please open an issue on GitHub with detailed information about the error.
