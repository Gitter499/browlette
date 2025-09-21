import WebSocket from 'ws';
const ws = new WebSocket('ws://localhost:8080');
ws.onopen = () => {
    console.log('Connected to WebSocket server');
    // Test: Create a room
    ws.send(JSON.stringify({ type: 'createRoom', roomName: 'TestRoom' }));
};
ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log('Received:', message);
    if (message.type === 'roomCreated') {
        const roomId = message.roomId;
        console.log(`Room created with ID: ${roomId}`);
        // Test: Join the created room
        ws.send(JSON.stringify({ type: 'joinRoom', roomId: roomId, playerName: 'TestPlayer1' }));
        // Test: Send a chat message after joining
        setTimeout(() => {
            ws.send(JSON.stringify({ type: 'chatMessage', roomId: roomId, text: 'Hello everyone!' }));
        }, 1000);
        // Test: Leave the room after some time
        setTimeout(() => {
            ws.send(JSON.stringify({ type: 'leaveRoom', roomId: roomId }));
        }, 2000);
    }
};
ws.onclose = () => {
    console.log('Disconnected from WebSocket server');
};
ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};
