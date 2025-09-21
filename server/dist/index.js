import 'dotenv/config';
import { WebSocketServer } from 'ws';
import { RoomManager } from './RoomManager.js';
import { Player } from './Player.js';
import { RoomState } from './RoomState.js';
import { GeminiClient } from './GeminiClient.js';
const wss = new WebSocketServer({ port: 8080 });
const roomManager = new RoomManager();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set. Please set it before starting the server.');
}
const geminiClient = new GeminiClient(GEMINI_API_KEY);
console.log('WebSocket server started on port 8080');
wss.on('connection', (ws) => {
    const customWs = ws;
    customWs.id = Math.random().toString(36).substring(2, 15); // Unique ID for the WebSocket connection
    console.log(`Client ${customWs.id} connected`);
    customWs.on('message', async (message) => {
        console.log(`Received message from ${customWs.id}: ${message}`);
        const parsedMessage = JSON.parse(message);
        switch (parsedMessage.type) {
            case 'createRoom':
                const newRoom = roomManager.createRoom(parsedMessage.roomName, customWs.id);
                // Host is not a player, so no Player object for host
                customWs.roomId = newRoom.id; // Link WebSocket to Room
                console.log(`Room ${newRoom.id} created. Current state: ${newRoom.currentState}`);
                customWs.send(JSON.stringify({
                    type: 'roomCreated',
                    roomId: newRoom.id,
                    roomName: newRoom.name,
                    hostId: newRoom.hostId,
                    players: [], // No players yet
                    submittedPlayerIds: [],
                    currentRound: newRoom.currentRound,
                    maxRounds: newRoom.maxRounds,
                }));
                break;
            case 'joinRoom':
                const playerName = parsedMessage.playerName || `Guest-${customWs.id.substring(0, 5)}`;
                const player = new Player(customWs.id, playerName, customWs);
                customWs.playerId = player.id; // Link WebSocket to Player
                customWs.roomId = parsedMessage.roomId; // Link WebSocket to Room
                if (roomManager.joinRoom(parsedMessage.roomId, player)) {
                    const room = roomManager.getRoom(parsedMessage.roomId);
                    if (room) {
                        console.log(`Player ${player.name} joined room ${room.id}. Current state: ${room.currentState}`);
                        customWs.send(JSON.stringify({
                            type: 'roomJoined',
                            roomId: room.id,
                            roomName: room.name,
                            playerName: playerName,
                            playerId: player.id,
                            hostId: room.hostId,
                            players: Array.from(room.players.values()).map(p => ({ id: p.id, name: p.name })),
                            submittedPlayerIds: Array.from(room.submittedSearchHistories.keys()),
                            currentRound: room.currentRound,
                            maxRounds: room.maxRounds,
                        }));
                        room.broadcast('playerJoined', { playerName: player.name }); // Notify others
                    }
                }
                else {
                    const room = roomManager.getRoom(parsedMessage.roomId);
                    let errorMessage = 'Could not join room.';
                    if (!room) {
                        errorMessage = 'Room not found.';
                    }
                    else if (Array.from(room.players.values()).some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
                        errorMessage = 'Player name already taken in this room.';
                    }
                    else { // If not found and not duplicate name, it must be full or some other reason for joinRoom to fail
                        errorMessage = 'Room is full or another error occurred.';
                    }
                    customWs.send(JSON.stringify({ type: 'error', message: errorMessage }));
                }
                break;
            case 'startGame':
                const roomToStart = roomManager.getRoom(parsedMessage.roomId);
                if (roomToStart) {
                    if (customWs.id !== roomToStart.hostId) { // Check if client is host (using customWs.id as hostId)
                        customWs.send(JSON.stringify({ type: 'error', message: 'Only the host can start the game.' }));
                        break;
                    }
                    if (roomToStart.currentState === RoomState.WAITING_FOR_PLAYERS) {
                        roomToStart.startNewRound(); // This will set IN_GAME state and currentTurnPlayerId
                        roomToStart.broadcast('gameStarted', {
                            roomId: roomToStart.id,
                            currentTurnPlayerId: roomToStart.currentTurnPlayerId,
                            currentRound: roomToStart.currentRound,
                            maxRounds: roomToStart.maxRounds,
                        });
                    }
                    else {
                        customWs.send(JSON.stringify({ type: 'error', message: 'Cannot start game at this time.' }));
                    }
                }
                else {
                    customWs.send(JSON.stringify({ type: 'error', message: 'Room not found.' }));
                }
                break;
            case 'submitSearchHistory':
                if (customWs.playerId && parsedMessage.roomId && parsedMessage.history) {
                    const room = roomManager.getRoom(parsedMessage.roomId);
                    if (room && room.currentState === RoomState.IN_GAME) {
                        // Validate turn
                        if (customWs.playerId !== room.currentTurnPlayerId) {
                            customWs.send(JSON.stringify({ type: 'error', message: `It's not your turn to submit history.` }));
                            break;
                        }
                        room.submittedSearchHistories.set(customWs.playerId, parsedMessage.history);
                        // Process the current player's history
                        const historyToProcess = parsedMessage.history; // Use the submitted history directly
                        if (historyToProcess) {
                            const geminiResult = await geminiClient.processSearchHistory(historyToProcess);
                            room.currentRoundSearchTerm = geminiResult.selectedSearchTerm;
                            room.currentRoundOwnerId = customWs.playerId; // The player who submitted is the owner
                            room.broadcast('searchRevealed', {
                                searchTerm: geminiResult.selectedSearchTerm,
                                ownerPlayerId: customWs.playerId, // Include owner ID
                            });
                            room.currentState = RoomState.IN_GAME; // Transition to IN_GAME after search revealed
                            room.advanceTurn(); // Advance turn after history is revealed and processed
                        }
                        else {
                            room.broadcast('error', { message: 'Failed to process search history.' });
                        }
                    }
                    else {
                        customWs.send(JSON.stringify({ type: 'error', message: 'Cannot submit history at this time.' }));
                    }
                }
                break;
            case 'submitRankings':
                if (customWs.playerId && parsedMessage.roomId && parsedMessage.rankings) {
                    const room = roomManager.getRoom(parsedMessage.roomId);
                    if (room && room.currentState === RoomState.RANKING) {
                        room.submitRankings(customWs.playerId, parsedMessage.rankings);
                    }
                    else {
                        customWs.send(JSON.stringify({ type: 'error', message: 'Cannot submit rankings at this time.' }));
                    }
                }
                break;
            case 'leaveRoom':
                if (customWs.playerId && parsedMessage.roomId) {
                    roomManager.leaveRoom(parsedMessage.roomId, customWs.playerId);
                    customWs.send(JSON.stringify({ type: 'roomLeft', roomId: parsedMessage.roomId }));
                }
                break;
            case 'startNextRound':
                if (parsedMessage.roomId) {
                    const room = roomManager.getRoom(parsedMessage.roomId);
                    if (room) {
                        if (customWs.id !== room.hostId) { // Only host can start next round
                            customWs.send(JSON.stringify({ type: 'error', message: 'Only the host can start the next round.' }));
                            break;
                        }
                        room.startNewRound();
                    }
                    else {
                        customWs.send(JSON.stringify({ type: 'error', message: 'Room not found.' }));
                    }
                }
                break;
            case 'setMaxRounds':
                if (parsedMessage.roomId && parsedMessage.maxRounds) {
                    const room = roomManager.getRoom(parsedMessage.roomId);
                    if (room) {
                        if (customWs.id !== room.hostId) { // Only host can set max rounds
                            customWs.send(JSON.stringify({ type: 'error', message: 'Only the host can set the maximum number of rounds.' }));
                            break;
                        }
                        room.setMaxRounds(parsedMessage.maxRounds);
                        customWs.send(JSON.stringify({ type: 'maxRoundsUpdated', maxRounds: room.maxRounds }));
                    }
                    else {
                        customWs.send(JSON.stringify({ type: 'error', message: 'Room not found.' }));
                    }
                }
                break;
            default:
                customWs.send(JSON.stringify({ type: 'error', message: 'Unknown message type.' }));
                break;
        }
    });
    customWs.on('close', () => {
        console.log(`Client ${customWs.id} disconnected`);
        // Handle player leaving rooms on disconnect
        if (customWs.roomId) {
            const room = roomManager.getRoom(customWs.roomId);
            if (room) {
                if (customWs.id === room.hostId) {
                    // Host disconnected, close the room and disconnect all players
                    room.players.forEach(player => player.send(JSON.stringify({ type: 'hostDisconnected', message: 'Host disconnected. Room closed.' })));
                    roomManager.rooms.delete(room.id);
                    console.log(`Host ${customWs.id} disconnected. Room ${room.name} (ID: ${room.id}) has been closed.`);
                }
                else if (customWs.playerId) {
                    // Player disconnected
                    room.removePlayer(customWs.playerId);
                    if (room.players.size === 0) {
                        roomManager.rooms.delete(room.id);
                        console.log(`Room ${room.name} (ID: ${room.id}) is empty and has been removed.`);
                    }
                }
            }
        }
    });
    customWs.on('error', (error) => {
        console.error(`WebSocket error for client ${customWs.id}:`, error);
    });
});
wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
});
