export class Player {
    constructor(id, name, ws) {
        this.id = id;
        this.name = name;
        this.ws = ws;
    }
    send(message) {
        this.ws.send(message);
    }
}
