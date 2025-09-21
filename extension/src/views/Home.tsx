import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const HomeWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.large};
`;

const Section = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium};
  padding: ${({ theme }) => theme.spacing.large};
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.primary};
`;

const Input = styled(motion.input)`
  padding: ${({ theme }) => theme.spacing.medium};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  text-align: center;
  width: 300px;
`;

const Button = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.medium} ${({ theme }) => theme.spacing.large};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  cursor: pointer;
`;

interface HomeProps {
  roomName: string;
  setRoomName: (name: string) => void;
  roomId: string;
  setRoomId: (id: string) => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  handleCreateRoom: () => void;
  handleJoinRoom: () => void;
}

const Home: React.FC<HomeProps> = ({ roomName, setRoomName, roomId, setRoomId, playerName, setPlayerName, handleCreateRoom, handleJoinRoom }) => {
  return (
    <HomeWrapper
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Section
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Title>Create Room</Title>
        <Input
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          whileHover={{ scale: 1.05 }}
          whileFocus={{ scale: 1.05 }}
        />
        <Button 
          onClick={handleCreateRoom}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Create Room
        </Button>
      </Section>
      <Section
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Title>Join Room</Title>
        <Input
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          whileHover={{ scale: 1.05 }}
          whileFocus={{ scale: 1.05 }}
        />
        <Input
          type="text"
          placeholder="Your Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          whileHover={{ scale: 1.05 }}
          whileFocus={{ scale: 1.05 }}
        />
        <Button 
          onClick={handleJoinRoom}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Join Room
        </Button>
      </Section>
    </HomeWrapper>
  );
};

export default Home;
