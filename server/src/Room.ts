import { Player } from './Player.js';

export class Room {
  public id: string;
  public name: string;
  public players: Map<string, Player>;
  private maxPlayers: number;

  constructor(id: string, name: string, maxPlayers: number = 2) {
    this.id = id;
    this.name = name;
    this.players = new Map<string, Player>();
    this.maxPlayers = maxPlayers;
  }

  addPlayer(player: Player): boolean {
    if (this.players.size < this.maxPlayers) {
      this.players.set(player.id, player);
      this.broadcast('playerJoined', { playerName: player.name });
      return true;
    }
    return false;
  }

  removePlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (player) {
      this.players.delete(playerId);
      this.broadcast('playerLeft', { playerName: player.name });
    }
  }

  broadcast(type: string, payload: any): void {
    this.players.forEach(player => {
      player.send(JSON.stringify({ type, payload }));
    });
  }

  // Add more room-specific methods for game logic
}
