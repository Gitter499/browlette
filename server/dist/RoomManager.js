import { Room } from './Room.js';
export class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(name, maxPlayers) {
        const id = Math.random().toString(36).substring(2, 15); // Simple unique ID
        const room = new Room(id, name, maxPlayers);
        this.rooms.set(id, room);
        console.log(`Room '${name}' created with ID: ${id}`);
        return room;
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
