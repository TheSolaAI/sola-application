# Contributing to Sola Application

Thank you for considering contributing to the Sola Application! We welcome contributions from the community.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Issues](#issues)
- [License](#license)

## Getting Started

1. Fork the repository.
2. Clone your fork:

    ```sh
    git clone https://github.com/TheSolaAI/sola-application.git
    ```

3. Navigate to the project directory:

    ```sh
    cd sola-application
    ```

4. Install dependencies:

    ```sh
    npm install
    ```

## Development Environment

To set up the development environment:

1. Ensure you have Node.js and npm installed. We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions.
2. Install the required dependencies:

    ```sh
    npm install
    ```

3. Start the development server:

    ```sh
    npm run dev
    ```

4. Open your browser and navigate to `http://localhost:3000`.

## Code Style

- Follow the existing code style and conventions.
- Use [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) to maintain code quality and consistency.

## Commit Messages

- Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages.
- Example commit message:

    ```sh
    feat(component): add new feature to component
    ```

## Pull Request Process

1. Ensure your fork is up to date with the main repository. First, add the main repository as a remote named `upstream` if you haven't already:

    ```sh
    git remote add upstream https://github.com/TheSolaAI/sola-application.git
    ```

    Then, fetch and merge changes from `upstream`:

    ```sh
    git fetch upstream
    git checkout main
    git merge upstream/main
    ```

2. Create a new branch for your feature or bugfix:

    ```sh
    git checkout -b feature/your-feature-name
    ```

3. Make your changes and commit them following the [Commit Messages](#commit-messages) guidelines.
4. Ensure your code follows the [Code Style](#code-style) guidelines.
5. Push your branch to your fork:

    ```sh
    git push origin feature/your-feature-name
    ```

6. Open a pull request against the `main` branch of the main repository.

## Issues

If you find a bug or have a feature request, please open an issue on GitHub. Provide as much detail as possible to help us address the issue quickly.

## License

By contributing to Sola Application, you agree that your contributions will be licensed under the [License](LICENSE).
