# Agentic Development Environment

This document provides the necessary context and instructions for agents to contribute to the Browlette project.

## Project Overview

Browlette is a multiplayer game where players share their browser search history in a "Russian roulette" style. The game aims to create funny and embarrassing narratives from players' search histories.

- **Frontend**: React-based Chrome Extension
- **Backend**: Node.js with ws (WebSockets)
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

### Backend Setup

1.  **Install backend dependencies:**
    ```bash
    cd server
    npm install
    ```
2.  **Start the backend server:**
    ```bash
    cd server
    npm run dev
    ```

### Frontend Setup (React Chrome Extension)

1.  **Install frontend dependencies:**
    ```bash
    cd extension
    npm install
    ```
2.  **Start the frontend development server:**
    ```bash
    cd extension
    npm run dev
    ```
3.  **Build the extension for production:**
    ```bash
    cd extension
    npm run build
    ```
4.  **Load the extension in Chrome:**
    - Open Chrome and navigate to `chrome://extensions`.
    - Enable "Developer mode".
    - Click "Load unpacked" and select the `extension/dist` directory.

5.  **Load the extension in Firefox:**
    - Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
    - Click "Load Temporary Add-on...".
    - Select the `extension/dist` directory.

## Task List

### Backend (Node.js/ws)

- [ ] Implement a 4-digit room code generation system.
- [ ] Implement player join/leave logic.
- [ ] Implement game state management (e.g., waiting for players, in-game, game over).
- [ ] Develop the core logic for the first game mode (embarrassing search reveal).
- [ ] Implement the ranking/voting system.
- [ ] Integrate with the Gemini API for search history processing.
- [ ] Add basic sound effect triggers.

### Frontend (React Chrome Extension)

- [ ] Create the initial UI for the player (privacy prompt, name/profile selection).
- [ ] Implement the host UI.
- [ ] Connect the frontend to the backend using ws.
- [ ] Create the "typing" animation and search reveal sequence.
- [ ] Display search results in an iframe.
- [ ] Implement the drag-and-drop ranking or voting UI.
- [ ] Add fun and bold styling, fonts, and animations.
- [ ] Play sound effects and background music based on game events from the server.
- [ ] Fetch and display browser history.

## Frontend-Backend Integration Plan

The goal is to integrate the frontend (browser extension) with the backend (WebSocket server) with basic styling.

### Phase 1: Establish WebSocket Connection from Frontend to Backend

1.  **Frontend: Create a WebSocket service/hook:**
    *   In `extension/src/`, create a new file (e.g., `websocketService.ts` or `useWebSocket.ts`) to encapsulate WebSocket logic.
    *   This service will handle connecting to `ws://localhost:8080`, sending messages, and receiving messages.
    *   It should expose functions for sending different types of messages (e.g., `createRoom`, `joinRoom`, `sendMessage`).
    *   It should also provide a way for React components to subscribe to incoming messages.
    *   **Decision:** For simplicity and initial testing, the WebSocket connection will be established directly from `App.tsx`. If persistence becomes an issue, it can be moved to a background script.

2.  **Frontend: Update `App.tsx` to use the WebSocket service:**
    *   Import and use the WebSocket service/hook in `App.tsx`.
    *   Display connection status (connected/disconnected).
    *   Add basic UI elements for testing:
        *   Input field for player name.
        *   Button to create a room.
        *   Input field for room ID and button to join a room.
        *   Display area for messages received from the server.

### Phase 2: Implement Basic Room Management in Frontend

1.  **Frontend: Handle `createRoom` and `joinRoom` responses:**
    *   When a `roomCreated` message is received, display the room ID and name.
    *   When a `roomJoined` message is received, display a confirmation and the player's name.
    *   Store the current room ID and player ID in the frontend state (e.g., using React Context or `useState`).

2.  **Frontend: Basic Lobby UI:**
    *   Once a player joins a room, display a simple lobby view.
    *   Show the room ID and a list of joined players (this will require the backend to send player list updates).
    *   Add a "Start Game" button (for testing for now).

### Phase 3: Implement Game Flow (Simplified)

1.  **Backend: Enhance `broadcast` functionality:**
    *   Ensure `room.broadcast` can broadcast updates about players joining/leaving a room.

2.  **Frontend: Handle `gameStarted` message:**
    *   When `gameStarted` is received, switch to a "game in progress" view.

3.  **Frontend: Implement `submitSearchHistory` (placeholder):**
    *   Add a simple input field for "search history" (e.g., a text area).
    *   Add a button to "Submit Search History".
    *   Send a `submitSearchHistory` message to the backend with dummy data.

4.  **Frontend: Handle `searchRevealed` message:**
    *   Display the `searchTerm`, `sentiment`, `keywords`, and `category` received from the backend.

5.  **Frontend: Implement `submitVote` (placeholder):**
    *   Add a simple input for a "vote".
    *   Add a button to "Submit Vote".
    *   Send a `submitVote` message to the backend with dummy data.

6.  **Frontend: Handle `roundResults` message:**
    *   Display the round results.

### Phase 4: Basic Chat Functionality

1.  **Frontend: Chat UI:**
    *   Add an input field for chat messages.
    *   Add a button to send a chat message.
    *   Display incoming chat messages in a scrollable area.

2.  **Frontend: Handle `chatMessage` message:**
    *   Display the sender and text of the chat message.

### Clarifications and Questions:

1.  **Browser Extension Permissions:** For now, assuming manual input for search history.
2.  **Player Identification:** The backend's use of `customWs.id` for WebSocket connection ID and `player.id` for player ID, linked to the WebSocket, is noted.
3.  **Room State Updates:** Assuming the backend will broadcast updates when players join/leave a room for frontend lobby view updates.
4.  **Error Handling:** Frontend will display backend error messages gracefully.
5.  **Styling:** Minimal CSS will be used for visibility and functionality, without focusing on aesthetics.

