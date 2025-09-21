import { Player } from './Player.js';
import { RoomState } from './RoomState.js';

export class Room {
  public id: string;
  public name: string;
  public players: Map<string, Player>;
  private maxPlayers: number;
  public currentState: RoomState;
  public submittedSearchHistories: Map<string, any[]>; // Map of playerId to their submitted search history
  public submittedVotes: Map<string, any>; // Map of playerId to their submitted vote
  public currentRoundSearchTerm: string | null = null;

  constructor(id: string, name: string, maxPlayers: number = 2) {
    this.id = id;
    this.name = name;
    this.players = new Map<string, Player>();
    this.maxPlayers = maxPlayers;
    this.currentState = RoomState.WAITING_FOR_PLAYERS;
    this.submittedSearchHistories = new Map<string, any[]>();
    this.submittedVotes = new Map<string, any>();
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
