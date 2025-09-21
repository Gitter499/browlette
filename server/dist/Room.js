import { RoomState } from './RoomState.js';
export class Room {
    constructor(id, name, hostId, maxPlayers = 1000) {
        this.currentRoundSearchTerm = null;
        this.currentRoundOwnerId = null;
        // Turn-based properties
        this.currentTurnPlayerId = null;
        this.playerOrder = [];
        this.currentTurnIndex = -1;
        // Round-based properties
        this.maxRounds = 3; // Default to 3 rounds
        this.currentRound = 0;
        // Ranking properties
        this.submittedRankings = new Map(); // Map of playerId to their ordered list of ranked playerIds
        this.id = id;
        this.name = name;
        this.hostId = hostId;
        this.players = new Map();
        this.maxPlayers = maxPlayers;
        this.currentState = RoomState.WAITING_FOR_PLAYERS;
        console.log(`Room ${this.id} created. Initial state: ${this.currentState}`);
        this.submittedSearchHistories = new Map();
        this.submittedVotes = new Map();
        this.playerScores = new Map();
    }
    addPlayer(player) {
        if (this.players.size >= this.maxPlayers) {
            return false; // Room is full
        }
        // Check for duplicate player names (case-insensitive)
        for (const existingPlayer of this.players.values()) {
            if (existingPlayer.name.toLowerCase() === player.name.toLowerCase()) {
                return false; // Player with this name already exists in the room
            }
        }
        this.players.set(player.id, player);
        this.playerScores.set(player.id, 0); // Initialize score for new player
        this.broadcast('playerJoined', { playerName: player.name });
        return true;
    }
    removePlayer(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            this.players.delete(playerId);
            this.playerScores.delete(playerId); // Remove score for leaving player
            // If the removed player was the current turn player, advance the turn
            if (this.currentTurnPlayerId === playerId) {
                this.advanceTurn();
            }
            // Remove from playerOrder if present
            this.playerOrder = this.playerOrder.filter(id => id !== playerId);
            this.broadcast('playerLeft', { playerName: player.name });
            // If room becomes empty, it will be handled by RoomManager
        }
    }
    broadcast(type, payload) {
        const playerList = Array.from(this.players.values()).map(p => ({ id: p.id, name: p.name }));
        const submittedPlayerIds = Array.from(this.submittedSearchHistories.keys());
        this.players.forEach(player => {
            player.send(JSON.stringify({
                type,
                payload,
                players: playerList,
                submittedPlayerIds: submittedPlayerIds,
                hostId: this.hostId,
                currentTurnPlayerId: this.currentTurnPlayerId,
                currentRound: this.currentRound,
                maxRounds: this.maxRounds,
            }));
        });
    }
    startNewRound() {
        this.submittedSearchHistories.clear();
        this.submittedVotes.clear();
        this.submittedRankings.clear(); // Clear rankings for new round
        this.currentRoundSearchTerm = null;
        this.currentRoundOwnerId = null;
        this.currentRound++;
        if (this.currentRound > this.maxRounds) {
            this.currentState = RoomState.GAME_END;
            this.broadcast('gameEnded', { finalScores: Object.fromEntries(this.playerScores) });
            return;
        }
        // Initialize player order for the new round
        this.playerOrder = Array.from(this.players.keys());
        // Shuffle player order for fairness (optional, but good for game flow)
        for (let i = this.playerOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.playerOrder[i], this.playerOrder[j]] = [this.playerOrder[j], this.playerOrder[i]];
        }
        this.currentTurnIndex = 0;
        this.currentTurnPlayerId = this.playerOrder[this.currentTurnIndex];
        this.currentState = RoomState.IN_GAME;
        console.log(`Room ${this.id} starting new round. New state: ${this.currentState}`);
        this.broadcast('newRoundStarted', { currentTurnPlayerId: this.currentTurnPlayerId });
    }
    advanceTurn() {
        this.currentTurnIndex++;
        if (this.currentTurnIndex >= this.playerOrder.length) {
            // All players have had a turn in this round, move to ranking/voting phase
            this.currentTurnIndex = -1; // Reset for next round
            this.currentTurnPlayerId = null;
            this.currentState = RoomState.RANKING;
            console.log(`Room ${this.id} entering ranking phase. New state: ${this.currentState}`);
            this.broadcast('rankingPhaseStarted', {});
        }
        else {
            this.currentTurnPlayerId = this.playerOrder[this.currentTurnIndex];
            this.broadcast('turnAdvanced', { currentTurnPlayerId: this.currentTurnPlayerId });
        }
    }
    submitRankings(playerId, rankings) {
        // Basic validation: ensure all players are ranked and no duplicates
        if (rankings.length !== this.players.size || new Set(rankings).size !== this.players.size) {
            console.warn(`Player ${playerId} submitted invalid rankings.`);
            return; // Or send an error back to the player
        }
        this.submittedRankings.set(playerId, rankings);
        if (this.submittedRankings.size === this.players.size) {
            this.calculateRankingScores();
        }
    }
    calculateRankingScores() {
        const numPlayers = this.players.size;
        this.submittedRankings.forEach((rankings, voterId) => {
            // Ensure voter cannot rank themselves
            const playersToRank = Array.from(this.players.keys()).filter(id => id !== voterId);
            const numPlayersToRank = playersToRank.length;
            rankings.forEach((rankedPlayerId, index) => {
                // Points awarded based on position: 1st gets numPlayersToRank, 2nd gets numPlayersToRank-1, etc.
                // The player ranked highest (lower index) gets the most points.
                const points = numPlayersToRank - index;
                this.playerScores.set(rankedPlayerId, (this.playerScores.get(rankedPlayerId) || 0) + points);
            });
        });
        this.broadcast('rankingsResults', { finalScores: Object.fromEntries(this.playerScores) });
        // After ranking, move to next round or end game
        this.startNewRound();
    }
    setMaxRounds(rounds) {
        if (rounds > 0) {
            this.maxRounds = rounds;
            this.broadcast('maxRoundsUpdated', { maxRounds: this.maxRounds });
        }
    }
}
