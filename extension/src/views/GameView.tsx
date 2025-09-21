import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player, HistoryItem } from '../types';
import PrivacyPrompt from '../components/PrivacyPrompt';

const MAX_HISTORY_ITEMS = 500;
const HISTORY_DAYS_BACK = 7;

const GameViewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.large};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.primary};
`;

const WaitingForHistory = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium};
  padding: ${({ theme }) => theme.spacing.large};
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const SearchRevealContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium};
  padding: ${({ theme }) => theme.spacing.large};
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const RevealedSearchTerm = styled(motion.p)`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const SearchTimestamp = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.text};
  margin-top: ${({ theme }) => theme.spacing.small};
`;

const IframeContainer = styled.div`
  width: 100%;
  max-width: 800px;
  height: 400px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const RoundInfo = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const NextRoundButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.medium} ${({ theme }) => theme.spacing.large};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.large};

  &:hover {
    transform: scale(1.05);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

interface GameViewProps {
  players: Player[];
  currentPlayerId: string | null;
  submittedPlayerIds: string[];
  handleSubmitHistory: (history: HistoryItem[]) => void;
  revealedSearchTerm: string | null;
  revealedSearchTimestamp: number | null; // New prop
  handleNextRound: () => void;
  getPlayerNameById: (id: string) => string;
  currentTurnPlayerId: string | null; // New prop
  currentRound: number; // New prop
  maxRounds: number; // New prop
  isHost: boolean; // New prop
}

const GameView: React.FC<GameViewProps> = ({
  players,
  currentPlayerId,
  submittedPlayerIds,
  handleSubmitHistory,
  revealedSearchTerm,
  revealedSearchTimestamp,
  handleNextRound,
  getPlayerNameById,
  currentTurnPlayerId,
  currentRound,
  maxRounds,
  isHost,
}) => {
  const [hasHistoryPermission, setHasHistoryPermission] = useState(false);
  const [showPrivacyPrompt, setShowPrivacyPrompt] = useState(true);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);

  useEffect(() => {
    chrome.permissions.contains({ permissions: ['history'] }).then(result => {
      setHasHistoryPermission(result);
      console.log('useEffect: hasHistoryPermission', result);
    });
  }, []);

  const fetchBrowserHistory = useCallback(async () => {
    console.log('fetchBrowserHistory: hasHistoryPermission', hasHistoryPermission);
    if (!hasHistoryPermission) {
      alert('Please grant the history permission to the extension. Go to chrome://extensions, find Browlette, click on Details, and enable \"Read your browsing history\".');
      return;
    }
    setIsFetchingHistory(true);
    try {
      const startTime = Date.now() - 1000 * 60 * 60 * 24 * HISTORY_DAYS_BACK;
      const historyItems = await chrome.history.search({
        text: '',
        startTime: startTime,
        maxResults: MAX_HISTORY_ITEMS,
      });
      // Filter out items without lastVisitTime
      const filteredHistoryItems = historyItems.filter(item => item.lastVisitTime !== undefined) as HistoryItem[];
      handleSubmitHistory(filteredHistoryItems);
      setShowPrivacyPrompt(false);
    } catch (error) {
      console.error('Error fetching browser history:', error);
      alert('Failed to fetch browser history. Please ensure permissions are granted.');
    } finally {
      setIsFetchingHistory(false);
    }
  }, [handleSubmitHistory, hasHistoryPermission]);

  const formatTimestamp = (timestamp: number | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString(); // Adjust format as needed
  };

  const renderContent = () => {
    if (!hasHistoryPermission) {
      return (
        <div>
          <Title>Permission Required</Title>
          <p>This extension needs permission to access your browsing history to function.</p>
          <p>Please go to chrome://extensions, find Browlette, click on Details, and enable "Read your browsing history".</p>
        </div>
      );
    }

    if (showPrivacyPrompt) {
      return (
        <PrivacyPrompt
          onAccept={fetchBrowserHistory}
          onDecline={() => setShowPrivacyPrompt(false)}
          isFetchingHistory={isFetchingHistory}
        />
      );
    }

    // Display search reveal and iframe for host
    if (revealedSearchTerm) {
      return (
        <SearchRevealContainer
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <RoundInfo>Round {currentRound} of {maxRounds}</RoundInfo>
          <Title>Revealed Search Term:</Title>
          <RevealedSearchTerm
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            "{revealedSearchTerm}"
          </RevealedSearchTerm>
          {revealedSearchTimestamp && (
            <SearchTimestamp>({formatTimestamp(revealedSearchTimestamp)})</SearchTimestamp>
          )}

          {isHost && (
            <IframeContainer>
              <StyledIframe src={`https://www.google.com/search?q=${encodeURIComponent(revealedSearchTerm)}`} />
            </IframeContainer>
          )}
          {isHost && (
            <NextRoundButton
              onClick={handleNextRound}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Next Round
            </NextRoundButton>
          )}
        </SearchRevealContainer>
      );
    }

    // Waiting for players to submit history
    return (
      <GameViewWrapper>
        <RoundInfo>Round {currentRound} of {maxRounds}</RoundInfo>
        {submittedPlayerIds.length < players.length ? (
          <AnimatePresence>
            <WaitingForHistory
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <h3>Waiting for players to submit history:</h3>
              <ul>
                {players.map(player => (
                  <motion.li
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {player.name} {submittedPlayerIds.includes(player.id) ? '✅' : ''}
                  </motion.li>
                ))}
              </ul>
              {currentTurnPlayerId && (
                <p>It's {getPlayerNameById(currentTurnPlayerId)}'s turn to submit history.</p>
              )}
              {currentPlayerId === currentTurnPlayerId && (
                <p>It's your turn! Please submit your history.</p>
              )}
              {currentPlayerId !== currentTurnPlayerId && currentTurnPlayerId && (
                <p>Waiting for {getPlayerNameById(currentTurnPlayerId)} to submit their history.</p>
              )}
            </WaitingForHistory>
          </AnimatePresence>
        ) : (
          <h3>All players have submitted their history. Revealing a search term...</h3>
        )}
        {currentTurnPlayerId && (
          <p>It's {getPlayerNameById(currentTurnPlayerId)}'s turn to submit history.</p>
        )}
        {currentPlayerId === currentTurnPlayerId && (
          <p>It's your turn! Please submit your history.</p>
        )}
        {currentPlayerId !== currentTurnPlayerId && currentTurnPlayerId && (
          <p>Waiting for {getPlayerNameById(currentTurnPlayerId)} to submit their history.</p>
        )}
      </GameViewWrapper>
    );
  };

  return <>{renderContent()}</>;
};

export default GameView;