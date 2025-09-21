import WebSocket from 'ws';
const WS_URL = 'ws://localhost:8080';
let ws1;
let ws2;
let createdRoomId;
let player1Id;
let player2Id;
const dummySearchHistory = [
    { title: 'how to hide a body', url: 'http://example.com/body' },
    { title: 'why do cats stare', url: 'http://example.com/cats' },
    { title: 'best way to make money fast', url: 'http://example.com/money' },
];
function setupPlayer1() {
    ws1 = new WebSocket(WS_URL);
    ws1.onopen = () => {
        console.log('Player 1 Connected');
        ws1.send(JSON.stringify({ type: 'createRoom', roomName: 'TestRoom' }));
    };
    ws1.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Player 1 Received:', message);
        switch (message.type) {
            case 'roomCreated':
                createdRoomId = message.roomId;
                player1Id = message.hostId; // Player 1 is the host
                console.log(`Room created with ID: ${createdRoomId} by Player 1 (ID: ${player1Id})`);
                // Now setup Player 2 to join, after createdRoomId is set
                setupPlayer2();
                break;
            case 'roomJoined':
                player1Id = message.playerId; // Confirm Player 1's ID
                console.log(`Player 1 (Host) confirmed in room ${createdRoomId}`);
                break;
            case 'playerJoined':
                console.log(`Player 1 sees: ${message.payload.playerName} joined the room.`);
                // If Player 2 has joined, Player 1 can start the game
                if (message.players.length === 2) {
                    setTimeout(() => {
                        ws1.send(JSON.stringify({ type: 'startGame', roomId: createdRoomId }));
                    }, 1000);
                }
                break;
            case 'gameStarted':
                console.log('Player 1: Game started. Submitting history...');
                ws1.send(JSON.stringify({ type: 'submitSearchHistory', roomId: createdRoomId, history: dummySearchHistory }));
                break;
            case 'searchRevealed':
                console.log(`Player 1: Search revealed: ${message.payload.searchTerm}`);
                // Player 1 (host) waits for votes
                break;
            case 'roundResults':
                console.log('Player 1: Round results received.', message.payload);
                setTimeout(() => {
                    ws1.send(JSON.stringify({ type: 'startNextRound', roomId: createdRoomId }));
                }, 1000);
                break;
            case 'newRoundStarted':
                console.log('Player 1: New round started. Submitting history...');
                ws1.send(JSON.stringify({ type: 'submitSearchHistory', roomId: createdRoomId, history: dummySearchHistory }));
                break;
            case 'error':
                console.error('Player 1 Error:', message.message);
                break;
        }
    };
    ws1.onclose = () => {
        console.log('Player 1 Disconnected');
    };
    ws1.onerror = (error) => {
        console.error('Player 1 WebSocket error:', error);
    };
}
function setupPlayer2() {
    ws2 = new WebSocket(WS_URL);
    ws2.onopen = () => {
        console.log('Player 2 Connected');
        ws2.send(JSON.stringify({ type: 'joinRoom', roomId: createdRoomId, playerName: 'TestPlayer2' }));
    };
    ws2.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Player 2 Received:', message);
        switch (message.type) {
            case 'roomJoined':
                player2Id = message.playerId;
                console.log(`Player 2 (ID: ${player2Id}) joined room ${createdRoomId}`);
                break;
            case 'gameStarted':
                console.log('Player 2: Game started. Submitting history...');
                ws2.send(JSON.stringify({ type: 'submitSearchHistory', roomId: createdRoomId, history: dummySearchHistory }));
                break;
            case 'searchRevealed':
                console.log(`Player 2: Search revealed: ${message.payload.searchTerm}. Voting for Player 1...`);
                // Player 2 votes for Player 1 (the host)
                setTimeout(() => {
                    ws2.send(JSON.stringify({ type: 'submitVote', roomId: createdRoomId, vote: player1Id }));
                }, 500);
                break;
            case 'roundResults':
                console.log('Player 2: Round results received.', message.payload);
                break;
            case 'newRoundStarted':
                console.log('Player 2: New round started. Submitting history...');
                ws2.send(JSON.stringify({ type: 'submitSearchHistory', roomId: createdRoomId, history: dummySearchHistory }));
                break;
            case 'error':
                console.error('Player 2 Error:', message.message);
                break;
        }
    };
    ws2.onclose = () => {
        console.log('Player 2 Disconnected');
    };
    ws2.onerror = (error) => {
        console.error('Player 2 WebSocket error:', error);
    };
}
setupPlayer1();
