import 'dotenv/config';
import { WebSocketServer } from 'ws';
import { RoomManager } from './RoomManager.js';
import { Player } from './Player.js';
import { RoomState } from './RoomState.js';
import { GeminiClient } from './GeminiClient.js';
const wss = new WebSocketServer({ port: 8080 });
const roomManager = new RoomManager();
// TODO: Get Gemini API Key from environment variable
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
                const newRoom = roomManager.createRoom(parsedMessage.roomName);
                customWs.send(JSON.stringify({ type: 'roomCreated', roomId: newRoom.id, roomName: newRoom.name }));
                break;
            case 'joinRoom':
                const playerName = parsedMessage.playerName || `Guest-${customWs.id.substring(0, 5)}`;
                const player = new Player(customWs.id, playerName, customWs);
                customWs.playerId = player.id; // Link WebSocket to Player
                if (roomManager.joinRoom(parsedMessage.roomId, player)) {
                    customWs.send(JSON.stringify({ type: 'roomJoined', roomId: parsedMessage.roomId, playerName: playerName }));
                }
                else {
                    customWs.send(JSON.stringify({ type: 'joinRoomFailed', message: 'Could not join room.' }));
                }
                break;
            case 'startGame':
                const roomToStart = roomManager.getRoom(parsedMessage.roomId);
                if (roomToStart && roomToStart.currentState === RoomState.WAITING_FOR_PLAYERS) {
                    roomToStart.currentState = RoomState.IN_GAME;
                    roomToStart.broadcast('gameStarted', { roomId: roomToStart.id });
                    console.log(`Game started in room ${roomToStart.id}`);
                }
                else {
                    customWs.send(JSON.stringify({ type: 'error', message: 'Cannot start game.' }));
                }
                break;
            case 'submitSearchHistory':
                if (customWs.playerId && parsedMessage.roomId && parsedMessage.history) {
                    const room = roomManager.getRoom(parsedMessage.roomId);
                    if (room && room.currentState === RoomState.IN_GAME) {
                        room.submittedSearchHistories.set(customWs.playerId, parsedMessage.history);
                        console.log(`Player ${customWs.playerId} submitted search history for room ${room.id}`);
                        // Check if all players have submitted their search history
                        if (room.submittedSearchHistories.size === room.players.size) {
                            console.log(`All players submitted history in room ${room.id}. Processing with Gemini...`);
                            // Select a random player's history for now
                            const randomPlayerId = Array.from(room.players.keys())[Math.floor(Math.random() * room.players.size)];
                            const historyToProcess = room.submittedSearchHistories.get(randomPlayerId);
                            if (historyToProcess) {
                                const geminiResult = await geminiClient.processSearchHistory(historyToProcess);
                                room.currentRoundSearchTerm = geminiResult.selectedSearchTerm;
                                room.broadcast('searchRevealed', {
                                    searchTerm: geminiResult.selectedSearchTerm,
                                    sentiment: geminiResult.sentiment,
                                    keywords: geminiResult.keywords,
                                    category: geminiResult.category,
                                });
                                room.currentState = RoomState.VOTING;
                                console.log(`Search term revealed in room ${room.id}: ${geminiResult.selectedSearchTerm}`);
                            }
                            else {
                                console.error(`No history found for random player ${randomPlayerId} in room ${room.id}`);
                                room.broadcast('error', { message: 'Failed to process search history.' });
                            }
                            // Clear submitted histories for the next round
                            room.submittedSearchHistories.clear();
                        }
                    }
                    else {
                        customWs.send(JSON.stringify({ type: 'error', message: 'Cannot submit history at this time.' }));
                    }
                }
                break;
            case 'submitVote':
                if (customWs.playerId && parsedMessage.roomId && parsedMessage.vote) {
                    const room = roomManager.getRoom(parsedMessage.roomId);
                    if (room && room.currentState === RoomState.VOTING) {
                        room.submittedVotes.set(customWs.playerId, parsedMessage.vote);
                        console.log(`Player ${customWs.playerId} submitted vote for room ${room.id}`);
                        // Check if all players have voted
                        if (room.submittedVotes.size === room.players.size) {
                            console.log(`All players voted in room ${room.id}. Calculating scores...`);
                            // TODO: Implement actual score calculation based on drag-and-drop rank voting
                            // For now, just broadcast a placeholder result
                            room.broadcast('roundResults', { message: 'Scores calculated (placeholder).' });
                            room.submittedVotes.clear();
                            room.currentState = RoomState.IN_GAME; // Or GAME_OVER if all rounds are done
                        }
                    }
                    else {
                        customWs.send(JSON.stringify({ type: 'error', message: 'Cannot submit vote at this time.' }));
                    }
                }
                break;
            case 'leaveRoom':
                if (customWs.playerId && parsedMessage.roomId) {
                    roomManager.leaveRoom(parsedMessage.roomId, customWs.playerId);
                    customWs.send(JSON.stringify({ type: 'roomLeft', roomId: parsedMessage.roomId }));
                }
                break;
            case 'chatMessage':
                // Example: broadcast chat message to room
                if (customWs.playerId && parsedMessage.roomId && parsedMessage.text) {
                    const room = roomManager.getRoom(parsedMessage.roomId);
                    const playerInRoom = room?.players.get(customWs.playerId);
                    if (room && playerInRoom) {
                        room.broadcast('chatMessage', { sender: playerInRoom.name, text: parsedMessage.text });
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
        roomManager.rooms.forEach(room => {
            if (customWs.playerId && room.players.has(customWs.playerId)) {
                room.removePlayer(customWs.playerId);
            }
        });
    });
    customWs.on('error', (error) => {
        console.error(`WebSocket error for client ${customWs.id}:`, error);
    });
});
wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
});
