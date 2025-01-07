# Sola AI: AI Voice Assistant for Solana

Sola AI is a personalized AI voice assistant that bridges Solana blockchain technology and AI through a hands-free user experience.

![img](https://github.com/user-attachments/assets/b7217eeb-20bc-408f-89c9-0883c13dd175)

## Overview

This application provides seamless interaction between the user, OpenAI, and blockchain data using voice and text. Key features include:

* **Real-time Communication:** Utilizes WebRTC for seamless voice and text communication.
* **Modern Frontend:** Built with Vite React and styled with Tailwind CSS.
* **Scalable Backend:** Employs a microservices architecture for efficient data processing.
* **Blockchain Data Filtering:** Microservices filter and process blockchain data based on user queries.
* **Blockchain Interactions:** Supports Solana on-chain interactions (e.g., transfer, swap).

## Architecture

![{16D54172-2C55-4994-8BA7-3B246A0B0994}](https://github.com/user-attachments/assets/f83edd23-b696-4630-a2e6-2f6bc59f6107)

### Components

1. **Sola AI Application:** Serves as the central hub for processing user input, communicating with services, and integrating AI models with blockchain interactions.
   * Interfaces with OpenAI for natural language processing.
   * Routes user requests to appropriate microservices.

2. **Data Service:**
   * Microservice providing blockchain data.
   * Filters and structures Solana blockchain data based on user queries.

3. **Wallet Service:**
   * Helps to build pre-defined transactions and provides transaction objects.

### Workflow

1. **User Input:** Sola AI receives voice or text input.
2. **Data Fetching:** The Data Service retrieves and filters blockchain data.
3. **Transaction Building:** The Wallet Service handles transaction construction.
4. **Transaction Execution:** The transaction is executed using an embedded wallet or the user's custom wallet.
5. **Response:** Sola AI processes the results and responds to the user through the voice/text interface.

## Installation

For detailed installation instructions, please refer to the [INSTALL.md](INSTALL.md) file.

## Contributing

We welcome contributions! To contribute:

1. Fork the repository and create a new branch.
2. Make your changes and test thoroughly.
3. Submit a pull request with detailed explanations of your changes.

Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for more guidelines.

## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.
