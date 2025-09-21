import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.large};
  border-radius: ${({ theme }) => theme.borderRadius};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium};
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.primary};
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.medium} ${({ theme }) => theme.spacing.large};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

interface PrivacyPromptProps {
  onAccept: () => void;
  onDecline: () => void;
  isFetchingHistory: boolean;
}

const PrivacyPrompt: React.FC<PrivacyPromptProps> = ({ onAccept, onDecline, isFetchingHistory }) => {
  return (
    <ModalOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ModalContent
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
      >
        <Title>Privacy Notice</Title>
        <p>This game requires access to your browser history to function. We will fetch your recent search history to create an entertaining game experience. All fetched items will be submitted.</p>
        <Button onClick={onAccept} disabled={isFetchingHistory}>
          {isFetchingHistory ? 'Fetching History...' : 'Accept and Fetch History'}
        </Button>
        <Button onClick={onDecline}>Decline</Button>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PrivacyPrompt;
