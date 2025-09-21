import { useState, useCallback } from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { useWebSocket } from './websocketService';
import type { Player, HistoryItem } from './types';

// Views
import Home from './views/Home';
import Lobby from './views/Lobby';
import GameView from './views/GameView';
import RankingView from './views/RankingView';
import GameOverView from './views/GameOverView';

function App() {
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [currentRoomName, setCurrentRoomName] = useState<string | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [hostId, setHostId] = useState<string | null>(null);
  const [playersInRoom, setPlayersInRoom] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [submittedPlayerIds, setSubmittedPlayerIds] = useState<string[]>([]); // Re-declared here

  const [revealedSearchTerm, setRevealedSearchTerm] = useState<string | null>(null);
  const [revealedSearchTimestamp, setRevealedSearchTimestamp] = useState<number | null>(null); // New: for timestamp

  // New game state properties
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [maxRounds, setMaxRounds] = useState<number>(3); // Default from backend
  const [rankingPhaseStarted, setRankingPhaseStarted] = useState<boolean>(false);
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [finalScores, setFinalScores] = useState<{ [playerId: string]: number } | null>(null);

  const handleWebSocketMessage = useCallback((lastMessage: any) => {
    switch (lastMessage.type) {
      case 'roomCreated':
        setCurrentRoomId(lastMessage.roomId);
        setCurrentRoomName(lastMessage.roomName);
        setHostId(lastMessage.hostId);
        setCurrentPlayerId(lastMessage.hostId); // Set currentPlayerId for the host
        setPlayersInRoom(lastMessage.players || []);
        setCurrentRound(lastMessage.currentRound);
        setMaxRounds(lastMessage.maxRounds);
        break;
      case 'roomJoined':
        setCurrentRoomId(lastMessage.roomId);
        setCurrentPlayerId(lastMessage.playerId);
        setPlayersInRoom(lastMessage.players || []);
        setHostId(lastMessage.hostId);
        setCurrentRound(lastMessage.currentRound);
        setMaxRounds(lastMessage.maxRounds);
        break;
      case 'playerJoined':
      case 'playerLeft':
        setPlayersInRoom(lastMessage.players || []);
        setSubmittedPlayerIds(lastMessage.submittedPlayerIds || []);
        setHostId(lastMessage.hostId);
        setCurrentTurnPlayerId(lastMessage.currentTurnPlayerId); // Update turn player on player changes
        break;
      case 'gameStarted':
        setGameStarted(true);
        setCurrentTurnPlayerId(lastMessage.currentTurnPlayerId);
        setCurrentRound(lastMessage.currentRound);
        setMaxRounds(lastMessage.maxRounds);
        break;
      case 'turnAdvanced':
        setCurrentTurnPlayerId(lastMessage.currentTurnPlayerId);
        break;
      case 'searchRevealed':
        setRevealedSearchTerm(lastMessage.payload.searchTerm);
        setRevealedSearchTimestamp(lastMessage.payload.timestamp); // New: set timestamp
        break;
      case 'rankingPhaseStarted':
        setRankingPhaseStarted(true);
        setRevealedSearchTerm(null);
        setRevealedSearchTimestamp(null);
        break;
      case 'rankingsResults': // New message type for ranking results
        setFinalScores(lastMessage.payload.finalScores); // Update scores after ranking
        setRankingPhaseStarted(false); // Hide ranking UI
        break;
      case 'newRoundStarted':
        setRevealedSearchTerm(null);
        setRevealedSearchTimestamp(null);
        setSubmittedPlayerIds([]);
        setCurrentTurnPlayerId(lastMessage.currentTurnPlayerId);
        setCurrentRound(lastMessage.currentRound);
        setMaxRounds(lastMessage.maxRounds);
        setRankingPhaseStarted(false);
        setGameEnded(false);
        setFinalScores(null);
        break;
      case 'gameEnded':
        setGameEnded(true);
        setFinalScores(lastMessage.payload.finalScores);
        setGameStarted(false);
        setCurrentRoomId(null); // End the room on frontend
        break;
      case 'maxRoundsUpdated':
        setMaxRounds(lastMessage.maxRounds);
        break;
      case 'error':
        alert(`Error from server: ${lastMessage.message}`);
        break;
      default:
        break;
    }
  }, []);

  const { isConnected, sendMessage } = useWebSocket({ onMessageCallback: handleWebSocketMessage });

  const handleCreateRoom = () => {
    if (roomName) {
      sendMessage({ type: 'createRoom', roomName });
    }
  };

  const handleJoinRoom = () => {
    if (roomId && playerName) {
      sendMessage({ type: 'joinRoom', roomId, playerName });
    }
  };

  const handleLeaveRoom = () => {
    if (currentRoomId) {
      sendMessage({ type: 'leaveRoom', roomId: currentRoomId });
      setCurrentRoomId(null);
      setCurrentRoomName(null);
      setCurrentPlayerId(null);
      setHostId(null);
      setPlayersInRoom([]);
      setGameStarted(false);
      setSubmittedPlayerIds([]);
      setRevealedSearchTerm(null);
      setRevealedSearchTimestamp(null);
      setCurrentTurnPlayerId(null);
      setCurrentRound(0);
      setMaxRounds(3);
      setRankingPhaseStarted(false);
      setGameEnded(false);
      setFinalScores(null);
    }
  };


  const handleStartGame = () => {
    if (currentRoomId) {
      sendMessage({ type: 'startGame', roomId: currentRoomId });
    }
  };

  const handleSubmitHistory = (history: HistoryItem[]) => {
    if (currentRoomId) {
      const submittedHistory = history.map(item => ({ url: item.url, title: item.title, lastVisitTime: item.lastVisitTime })); // Include timestamp
      sendMessage({ type: 'submitSearchHistory', roomId: currentRoomId, history: submittedHistory });
    }
  };

  const handleSubmitRankings = (rankings: string[]) => {
    if (currentRoomId) {
      sendMessage({ type: 'submitRankings', roomId: currentRoomId, rankings: rankings });
    }
  };

  const handleNextRound = () => {
    if (currentRoomId) {
      sendMessage({ type: 'startNextRound', roomId: currentRoomId });
    }
  };

  const handleSetMaxRounds = (rounds: number) => {
    if (currentRoomId) {
      sendMessage({ type: 'setMaxRounds', roomId: currentRoomId, maxRounds: rounds });
    }
  };

  const getPlayerNameById = useCallback((id: string) => {
    return playersInRoom.find(p => p.id === id)?.name || id;
  }, [playersInRoom]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <div className="App">
        <h1>Browlette Game</h1>
        <p>WebSocket Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</p>

        {!currentRoomId ? (
          <Home
            roomName={roomName}
            setRoomName={setRoomName}
            roomId={roomId}
            setRoomId={setRoomId}
            playerName={playerName}
            setPlayerName={setPlayerName}
            handleCreateRoom={handleCreateRoom}
            handleJoinRoom={handleJoinRoom}
          />
        ) : gameEnded ? (
          <GameOverView
            finalScores={finalScores}
            players={playersInRoom}
            getPlayerNameById={getPlayerNameById}
          />
        ) : rankingPhaseStarted ? (
          <RankingView
            players={playersInRoom}
            currentPlayerId={currentPlayerId}
            handleSubmitRankings={handleSubmitRankings}
            getPlayerNameById={getPlayerNameById}
          />
        ) : !gameStarted ? (
          <Lobby
            roomId={currentRoomId}
            roomName={currentRoomName || currentRoomId}
            players={playersInRoom}
            isHost={currentPlayerId === hostId}
            handleStartGame={handleStartGame}
            handleLeaveRoom={handleLeaveRoom}
            maxRounds={maxRounds}
            currentRound={currentRound}
            handleSetMaxRounds={handleSetMaxRounds}
          />
        ) : (
          <GameView
            players={playersInRoom}
            currentPlayerId={currentPlayerId}
            submittedPlayerIds={submittedPlayerIds}
            handleSubmitHistory={handleSubmitHistory}
            revealedSearchTerm={revealedSearchTerm}
            revealedSearchTimestamp={revealedSearchTimestamp}
            handleNextRound={handleNextRound}
            getPlayerNameById={getPlayerNameById}
            currentTurnPlayerId={currentTurnPlayerId}
            currentRound={currentRound}
            maxRounds={maxRounds}
            isHost={currentPlayerId === hostId}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
