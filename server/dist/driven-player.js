import WebSocket from 'ws';
import { EventEmitter } from 'events';
export class DrivenPlayer extends EventEmitter {
    constructor(name) {
        super();
        this.roomId = null;
        this.name = name;
        this.id = '';
    }
    connect(url) {
        this.ws = new WebSocket(url);
        this.ws.on('open', () => {
            this.emit('connected');
        });
        this.ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            this.emit('message', message);
            this.handleMessage(message);
        });
        this.ws.on('close', () => {
            this.emit('disconnected');
        });
        this.ws.on('error', (error) => {
            this.emit('error', error);
        });
    }
    handleMessage(message) {
        switch (message.type) {
            case 'roomCreated':
                this.roomId = message.roomId;
                this.id = message.hostId;
                break;
            case 'roomJoined':
                this.roomId = message.roomId;
                this.id = message.playerId;
                break;
        }
    }
    send(message) {
        this.ws.send(JSON.stringify(message));
    }
    createRoom(roomName) {
        this.send({ type: 'createRoom', roomName });
    }
    joinRoom(roomId) {
        this.send({ type: 'joinRoom', roomId, playerName: this.name });
    }
    startGame() {
        if (this.roomId) {
            this.send({ type: 'startGame', roomId: this.roomId });
        }
    }
    submitHistory(history) {
        if (this.roomId) {
            this.send({ type: 'submitSearchHistory', roomId: this.roomId, history });
        }
    }
    submitVote(vote) {
        if (this.roomId) {
            this.send({ type: 'submitVote', roomId: this.roomId, vote });
        }
    }
    leaveRoom() {
        if (this.roomId) {
            this.send({ type: 'leaveRoom', roomId: this.roomId });
        }
    }
    startNextRound() {
        if (this.roomId) {
            this.send({ type: 'startNextRound', roomId: this.roomId });
        }
    }
}
