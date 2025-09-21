import { WebSocket } from 'ws';

export class Player {
  public id: string;
  public name: string;
  private ws: WebSocket;

  constructor(id: string, name: string, ws: WebSocket) {
    this.id = id;
    this.name = name;
    this.ws = ws;
  }

  send(message: string): void {
    this.ws.send(message);
  }

  // Add more player-specific methods as needed
}
