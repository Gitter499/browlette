# Agentic Development Environment

This document provides the necessary context and instructions for agents to contribute to the Browlette project.

## Project Overview

Browlette is a multiplayer game where players share their browser search history in a "Russian roulette" style. The game aims to create funny and embarrassing narratives from players' search histories.

- **Frontend**: React-based Chrome Extension
- **Backend**: Node.js with Socket.IO
- **AI**: Gemini API for search history processing

## Branching Strategy

All development should be done on a `dev` branch. For new features, create a branch from `dev` with the naming convention `dev/<feature-name>`.

## Git Workflow

To contribute to the project, please follow these steps:

1.  **Switch to the `dev` branch:**
    ```bash
    git checkout dev
    ```
2.  **Pull the latest changes:**
    ```bash
    git pull origin dev
    ```
3.  **Create a new feature branch:**
    ```bash
    git checkout -b dev/<feature-name>
    ```
    Replace `<feature-name>` with a short, descriptive name for your feature (e.g., `dev/player-profile`).

4.  **Make your changes and commit them:**
    ```bash
    git add .
    git commit -m "feat: your descriptive commit message"
    ```
    Use a conventional commit message format (e.g., `feat:`, `fix:`, `docs:`).

5.  **Push your feature branch to the remote repository:**
    ```bash
    git push origin dev/<feature-name>
    ```

6.  **Create a pull request:**
    - Go to the GitHub repository in your browser.
    - You should see a prompt to create a pull request from your new branch.
    - Create a pull request from your feature branch to the `dev` branch.

## Development Setup

### Prerequisites

- Node.js and npm
- A Gemini API Key

### Installation

1.  **Clone the repository.**
2.  **Install backend dependencies:**
    ```bash
    cd server
    npm install
    ```
3.  **Install frontend dependencies:**
    ```bash
    cd extension
    npm install
    ```

### Running the Application

1.  **Start the backend server:**
    ```bash
    cd server
    npm run dev
    ```
2.  **Build the extension:**
    ```bash
    cd extension
    npm run build
    ```
3.  **Load the extension in Chrome:**
    - Open Chrome and navigate to `chrome://extensions`.
    - Enable "Developer mode".
    - Click "Load unpacked" and select the `extension/dist` directory.

## Task List

### Backend (Node.js/Socket.IO)

- [ ] Implement a 4-digit room code generation system.
- [ ] Set up Socket.IO namespaces for rooms.
- [ ] Implement player join/leave logic.
- [ ] Implement game state management (e.g., waiting for players, in-game, game over).
- [ ] Develop the core logic for the first game mode (embarrassing search reveal).
- [ ] Implement the ranking/voting system.
- [ ] Integrate with the Gemini API for search history processing.
- [ ] Add basic sound effect triggers.

### Frontend (React Chrome Extension)

- [ ] Create the initial UI for the player (privacy prompt, name/profile selection).
- [ ] Implement the host UI.
- [ ] Connect the frontend to the backend using Socket.IO.
- [ ] Create the "typing" animation and search reveal sequence.
- [ ] Display search results in an iframe.
- [ ] Implement the drag-and-drop ranking or voting UI.
- [ ] Add fun and bold styling, fonts, and animations.
- [ ] Integrate sound effects and a background soundtrack.
- [ ] Fetch and display browser history.

