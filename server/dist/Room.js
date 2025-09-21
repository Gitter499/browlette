export class Room {
    constructor(id, name, maxPlayers = 2) {
        this.id = id;
        this.name = name;
        this.players = new Map();
        this.maxPlayers = maxPlayers;
    }
    addPlayer(player) {
        if (this.players.size < this.maxPlayers) {
            this.players.set(player.id, player);
            this.broadcast('playerJoined', { playerName: player.name });
            return true;
        }
        return false;
    }
    removePlayer(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            this.players.delete(playerId);
            this.broadcast('playerLeft', { playerName: player.name });
        }
    }
    broadcast(type, payload) {
        this.players.forEach(player => {
            player.send(JSON.stringify({ type, payload }));
        });
    }
}
