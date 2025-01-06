# Sola AI : AI Voice assistant for Solana

Sola AI is a personalized AI voice assistant that bridges Solana blockchain technology and AI through hands free user experience.

![Product](https://github.com/user-attachments/assets/b96d6d69-f30d-4d79-9229-973ffe6561f2)

## Overview

This application provides a seamless interaction between the user, OpenAI, and blockchain data and on-chain interaction using voice and text through a robust architecture. Key features include:

* **Real-time Communication:** Utilizes WebRTC for seamless voice and text communication between the client and OpenAI, ensuring a robust and responsive user experience.
* **Modern Frontend:** The client is built with Vite React and styled with Tailwind CSS, providing a responsive and modern user interface.
* **Scalable Backend:** Employs a microservices architecture to handle blockchain data processing based on user queries. This design allows the client to scale efficiently without being burdened by complex data handling.
* **Blockchain Data Filtering:** Microservices filter and process blockchain data according to user queries, significantly reducing client-side overhead and improving performance.
* **Blockchain Interactions:** The application Solana on-chain interactions (like transfer, swap etc..) from the client side.

> Centralized Server Migration (Previous Version): <br>
The previous version of Sola AI leveraged a centralized server to manage the connection between the client application and OpenAI. You can find the code for this version here: [Previous Application](https://github.com/The-SolaAI/sola-application/tree/Previous-Application).

**Important Note:** Blockchain interactions from the previous application haven't been fully migrated to the current version yet. This functionality is under development and will be integrated in a future update.

## Prerequisites

Before you begin, ensure you have met the following requirements:

* Node.js and npm installed. We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions.
* A GitHub account.
* Access to the OpenAI API key.
* Access to the Helius API key.
* Solana RPC URL.

## Installation

To set up the project locally, follow these steps:

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

Create a `.env` file in the root folder of the project to store your API keys and other environment variables.

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

> During production, use third-party services to keep the keys secure. Refer to Cloudflare tools.

## Running the Application

To start the project, run the following commands:

```sh
npm run dev
```

## Contributing

We welcome contributions from the community. Please read our [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
