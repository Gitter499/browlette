import React, { useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { Player } from '../types';

const GameOverWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.large};
  padding: ${({ theme }) => theme.spacing.large};
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const ScoreList = styled.ul`
  list-style: none;
  padding: 0;
  width: 100%;
  max-width: 300px;
`;

const ScoreListItem = styled(motion.li)`
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.small} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightBlue};
  font-size: ${({ theme }) => theme.fontSizes.medium};

  &:last-child {
    border-bottom: none;
  }
`;

const WinnerMessage = styled(motion.p)`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.darkBlue};
  margin-top: ${({ theme }) => theme.spacing.large};
`;

interface GameOverViewProps {
  finalScores: { [playerId: string]: number } | null;
  players: Player[];
  getPlayerNameById: (id: string) => string;
}

const GameOverView: React.FC<GameOverViewProps> = ({ finalScores, players, getPlayerNameById }) => {
  const sortedScores = useMemo(() => {
    if (!finalScores) return [];
    // Sort by score in descending order
    return Object.entries(finalScores).sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
  }, [finalScores]);

  const winnerId = sortedScores.length > 0 ? sortedScores[0][0] : null;
  const winnerName = winnerId ? getPlayerNameById(winnerId) : 'N/A';

  return (
    <GameOverWrapper
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <Title>Game Over!</Title>
      {winnerId && <WinnerMessage>Winner: {winnerName}!</WinnerMessage>}
      <h3>Final Scores:</h3>
      <ScoreList>
        {sortedScores.map(([playerId, score]: [string, number], index: number) => (
          <ScoreListItem
            key={playerId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <span>{players.find(p => p.id === playerId)?.name || playerId}</span>
            <span>{score}</span>
          </ScoreListItem>
        ))}
      </ScoreList>
    </GameOverWrapper>
  );
};

export default GameOverView;
