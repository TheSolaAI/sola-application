# Installation

To set up the project locally:

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

## Environment Variables

Create a `.env` file in the root folder to store your API keys and other environment variables.

```env
# OpenAI API Key
OPEN_AI_API_KEY=your_openai_api_key_here

# Application ID for PRVI
PRVI_APP_ID=your_prvi_app_id_here

# Helius API Key
HELIUS_API_KEY=your_helius_api_key_here

# Solana RPC URL
SOLANA_RPC=your_solana_rpc_url_here
```

> During production, use third-party services to keep the keys secure.

## Running the Application

To start the project:

```sh
npm run dev
```
