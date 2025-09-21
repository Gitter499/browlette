import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { Player } from '../types';

import { motion, AnimatePresence } from 'framer-motion';

const LobbyWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.large};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.primary};
`;

const PlayerList = styled(motion.ul)`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const PlayerListItem = styled(motion.li)`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const Button = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.medium} ${({ theme }) => theme.spacing.large};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  cursor: pointer;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const HostControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium};
  margin-top: ${({ theme }) => theme.spacing.large};
  padding: ${({ theme }) => theme.spacing.large};
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.medium};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  text-align: center;
  width: 100px;
`;

interface LobbyProps {
  roomId: string;
  roomName: string;
  players: Player[];
  isHost: boolean;
  handleStartGame: () => void;
  handleLeaveRoom: () => void;
  maxRounds: number;
  currentRound: number;
  handleSetMaxRounds: (rounds: number) => void;
}

const Lobby: React.FC<LobbyProps> = ({ roomId, roomName, players, isHost, handleStartGame, handleLeaveRoom, maxRounds, currentRound, handleSetMaxRounds }) => {
  const [roundsInput, setRoundsInput] = useState(maxRounds);
  const [isStartingGame, setIsStartingGame] = useState(false);

  useEffect(() => {
    setRoundsInput(maxRounds);
  }, [maxRounds]);

  const handleRoundsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setRoundsInput(value);
      handleSetMaxRounds(value);
    }
  };

  const onStartGame = () => {
    setIsStartingGame(true);
    handleStartGame();
  };

  return (
    <LobbyWrapper
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Title>Room: {roomName}</Title>
      <h3>Room Code: {roomId}</h3>
      <p>Round {currentRound} of {maxRounds}</p>
      <h3>Players in Room:</h3>
      <PlayerList>
        <AnimatePresence>
          {players.map((player) => (
            <PlayerListItem
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {player.name}
            </PlayerListItem>
          ))}
        </AnimatePresence>
      </PlayerList>
      {isHost && (
        <HostControls>
          <label htmlFor="maxRounds">Max Rounds:</label>
          <Input
            type="number"
            id="maxRounds"
            value={roundsInput}
            onChange={handleRoundsInputChange}
            min="1"
          />
          <Button 
            onClick={onStartGame}
            disabled={isStartingGame}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isStartingGame ? 'Starting Game...' : 'Start Game'}
          </Button>
        </HostControls>
      )}
      <Button 
        onClick={handleLeaveRoom}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        Leave Room
      </Button>
    </LobbyWrapper>
  );
};

export default Lobby;
