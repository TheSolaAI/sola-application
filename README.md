# Sola AI: AI Voice Assistant for Solana

Sola AI is a personalized AI voice assistant that bridges Solana blockchain technology and AI through a hands-free user experience.

![Product](https://github.com/user-attachments/assets/b96d6d69-f30d-4d79-9229-973ffe6561f2)

## Overview

This application provides seamless interaction between the user, OpenAI, and blockchain data using voice and text. Key features include:

* **Real-time Communication:** Utilizes WebRTC for seamless voice and text communication.
* **Modern Frontend:** Built with Vite React and styled with Tailwind CSS.
* **Scalable Backend:** Employs a microservices architecture for efficient data processing.
* **Blockchain Data Filtering:** Microservices filter and process blockchain data based on user queries.
* **Blockchain Interactions:** Supports Solana on-chain interactions (e.g., transfer, swap).

## Prerequisites

Ensure you have the following:

* Node.js and npm (use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions)
* A GitHub account
* Access to the OpenAI API key
* Access to the Helius API key
* Solana RPC URL

## Installation

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

## Contributing

We welcome contributions. Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the GNU GENERAL PUBLIC LICENSE v3. See the [LICENSE](LICENSE) file for details.
