# Agentic Development Environment

This document provides the necessary context and instructions for agents to contribute to the Browlette project.

## Project Overview

Browlette is a multiplayer game where players share their browser search history in a "Russian roulette" style. The game aims to create funny and embarrassing narratives from players' search histories.

- **Frontend**: React-based Chrome Extension
- **Backend**: Node.js with Socket.IO
- **AI**: Gemini API for search history processing

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

