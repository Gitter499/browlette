import { WebSocketServer, WebSocket } from 'ws';
import { RoomManager } from './RoomManager.js';
import { Player } from './Player.js';

interface CustomWebSocket extends WebSocket {
  id: string;
  playerId?: string; // Optional playerId to link WebSocket to a Player instance
}

const wss = new WebSocketServer({ port: 8080 });
const roomManager = new RoomManager();

console.log('WebSocket server started on port 8080');

wss.on('connection', (ws: WebSocket) => {
  const customWs = ws as CustomWebSocket;
  customWs.id = Math.random().toString(36).substring(2, 15); // Unique ID for the WebSocket connection
  console.log(`Client ${customWs.id} connected`);

  customWs.on('message', (message: string) => {
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
        } else {
          customWs.send(JSON.stringify({ type: 'joinRoomFailed', message: 'Could not join room.' }));
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

  customWs.on('error', (error: Error) => {
    console.error(`WebSocket error for client ${customWs.id}:`, error);
  });
});

wss.on('error', (error: Error) => {
  console.error('WebSocket server error:', error);
});
