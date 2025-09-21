import { Room } from './Room.js';
export class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(roomName, hostId) {
        // Generate a random 4-digit number
        const roomId = Math.floor(1000 + Math.random() * 9000).toString();
        const newRoom = new Room(roomId, roomName, hostId); // Pass hostId to Room constructor
        this.rooms.set(roomId, newRoom);
        console.log(`Room ${roomName} created with ID: ${roomId} by host ${hostId}`);
        return newRoom;
    }
    getRoom(id) {
        return this.rooms.get(id);
    }
    joinRoom(roomId, player) {
        const room = this.getRoom(roomId);
        if (room && room.addPlayer(player)) {
            console.log(`Player ${player.name} joined room ${room.name}`);
            return true;
        }
        console.log(`Failed to join room ${roomId} for player ${player.name}`);
        return false;
    }
    leaveRoom(roomId, playerId) {
        const room = this.getRoom(roomId);
        if (room) {
            room.removePlayer(playerId);
            if (room.players.size === 0) {
                this.rooms.delete(roomId);
                console.log(`Room ${room.name} (ID: ${roomId}) is empty and has been removed.`);
            }
        }
    }
}
