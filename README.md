# Sola AI: AI Voice Assistant for Solana

Sola AI is a personalized AI voice assistant that bridges Solana blockchain technology and AI through a hands-free user experience.

![app-screenshot](https://github.com/user-attachments/assets/c6464910-2ab6-45fd-b751-071562775d44)

## Overview

This application provides seamless interaction between the user, OpenAI, and blockchain data using voice and text. Key features include:

* **Real-time Communication:** Utilizes WebRTC for seamless voice and text communication.
* **Modern Frontend:** Built with Next.js and styled with Tailwind CSS.
* **Scalable Backend:** Employs a microservices architecture for efficient data processing.
* **Blockchain Data Filtering:** Microservices filter and process blockchain data based on user queries.
* **Blockchain Interactions:** Supports Solana on-chain interactions (e.g., transfer, swap).

### Core Components

1. **Sola AI Application:** Serves as the central hub for processing user input, communicating with services, and integrating AI models with blockchain interactions.
   * Interfaces with OpenAI for natural language processing.
   * Routes user requests to appropriate microservices.
   * Provides AI powered intelligent interface.

2. **Data Service:**
   * Microservice providing blockchain data built using rust.
   * Filters and structures Solana blockchain and web data based on user queries.

3. **Wallet Service:**
   * Helps to build pre-defined transactions and provides transaction objects.
   * Built using Rust for fast data processing.

4. **User Service:**
   * Manages user data such as chat rooms management, chat history, user settings.

> Refer our [Docs](https://docs.solaai.xyz/application-overview/high-level-architecture) for a better understanding of the application architecture. 

### Workflow

1. **User Input:** Sola AI receives voice or text input.
2. **Data Fetching:** The Data Service retrieves and filters blockchain data.
3. **Transaction Building:** The Wallet Service handles transaction construction.
4. **Transaction Execution:** The transaction is executed using an embedded wallet or the user's custom wallet.
5. **Response:** Sola AI processes the results and responds to the user through the voice/text interface.

## Installation

### Quick Setup

1. Clone the repository
2. Install dependencies with `yarn install`
3. Set up your environment variables (see below)
4. Start the development server with `yarn dev`

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Authentication (Privy)
NEXT_PUBLIC_PRIVY_APP_ID=cm5lc4euv00c5kmrbpu9oj0u4
PRIVY_VERIFICATION_KEY=
PRIVY_APP_SECRET=

# Database
DATABASE_URL=

# OpenAI
OPENAI_API_KEY=

# Solana
NEXT_PUBLIC_SOLANA_RPC=
SOLANA_RPC_URL=
SOLANA_PRIVATE_KEY=

# Microservices
NEXT_PUBLIC_AUTH_SERVICE_URL=https://user-service.solaai.tech/api/v1/
NEXT_PUBLIC_DATA_SERVICE_URL=https://data-stream-service.solaai.tech/
NEXT_PUBLIC_WALLET_SERVICE_URL=https://wallet-service.solaai.tech/
```

For detailed installation instructions, please refer to the [INSTALL.md](INSTALL.md) file.

## Contributing

We welcome contributions! To contribute:

1. Fork the repository and create a new branch.
2. Make your changes and test thoroughly.
3. Submit a pull request with detailed explanations of your changes.

Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for more guidelines.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=TheSolaAI/sola-application&type=Date)](https://star-history.com/#TheSolaAI/sola-application&Date)

## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.