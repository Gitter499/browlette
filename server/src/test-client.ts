import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  console.log('Connected to WebSocket server');

  // Test: Create a room
  ws.send(JSON.stringify({ type: 'createRoom', roomName: 'TestRoom' }));
};

let createdRoomId: string;

ws.onmessage = (event) => {
  const message = JSON.parse(event.data as string);
  console.log('Received:', message);

  if (message.type === 'roomCreated') {
    createdRoomId = message.roomId;
    console.log(`Room created with ID: ${createdRoomId}`);

    // Test: Join the created room
    ws.send(JSON.stringify({ type: 'joinRoom', roomId: createdRoomId, playerName: 'TestPlayer1' }));

    // Test: Start the game after joining
    setTimeout(() => {
      ws.send(JSON.stringify({ type: 'startGame', roomId: createdRoomId }));
    }, 500);

  } else if (message.type === 'gameStarted') {
    console.log('Game started. Submitting search history...');
    // Test: Submit search history
    const dummySearchHistory = [
      { query: 'how to hide a body', timestamp: Date.now() - 100000 },
      { query: 'why do cats stare', timestamp: Date.now() - 50000 },
      { query: 'best way to make money fast', timestamp: Date.now() - 10000 },
    ];
    ws.send(JSON.stringify({ type: 'submitSearchHistory', roomId: createdRoomId, history: dummySearchHistory }));

  } else if (message.type === 'searchRevealed') {
    console.log(`Search revealed: ${message.payload.searchTerm}. Submitting vote...`);
    // Test: Submit vote (dummy data)
    setTimeout(() => {
      ws.send(JSON.stringify({ type: 'submitVote', roomId: createdRoomId, vote: { rank: 1, searchTerm: message.searchTerm } }));
    }, 500);

  } else if (message.type === 'roundResults') {
    console.log('Round results received. Leaving room...');
    // Test: Leave the room after some time
    setTimeout(() => {
      ws.send(JSON.stringify({ type: 'leaveRoom', roomId: createdRoomId }));
    }, 500);
  }
};

ws.onclose = () => {
  console.log('Disconnected from WebSocket server');
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
