import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Player } from '../types';

const RankingWrapper = styled(motion.div)`
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

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

const SortableItem = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.medium};
  margin-bottom: ${({ theme }) => theme.spacing.small};
  background-color: ${({ theme }) => theme.colors.lightBlue};
  color: ${({ theme }) => theme.colors.black};
  border-radius: ${({ theme }) => theme.borderRadius};
  width: 250px;
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  cursor: grab;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background-color: ${({ theme }) => theme.colors.darkBlue};
    color: ${({ theme }) => theme.colors.white};
  }
`;

const RankNumber = styled.span`
  font-weight: bold;
  margin-right: ${({ theme }) => theme.spacing.small};
`;

const SubmitButton = styled(motion.button)`
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

interface SortablePlayerItemProps {
  id: string;
  name: string;
  index: number;
}

function SortablePlayerItem({ id, name, index }: SortablePlayerItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <SortableItem ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <RankNumber>{index + 1}.</RankNumber>
      {name}
    </SortableItem>
  );
}

interface RankingViewProps {
  players: Player[];
  currentPlayerId: string | null;
  handleSubmitRankings: (rankings: string[]) => void;
  getPlayerNameById: (id: string) => string;
}

const RankingView: React.FC<RankingViewProps> = ({ players, currentPlayerId, handleSubmitRankings, getPlayerNameById }) => {
  // Filter out the current player from the list to be ranked
  const initialPlayersToRank = useMemo(() => {
    return players.filter(player => player.id !== currentPlayerId);
  }, [players, currentPlayerId]);

  const [rankedPlayerIds, setRankedPlayerIds] = useState<string[]>(initialPlayersToRank.map(p => p.id));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setRankedPlayerIds((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newItems = [...items];
        const [removed] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, removed);
        return newItems;
      });
    }
  }

  const onSubmit = () => {
    handleSubmitRankings(rankedPlayerIds);
  };

  return (
    <RankingWrapper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Title>Rank the Embarrassment!</Title>
      <Subtitle>Drag and drop players to rank them from most (top) to least (bottom) embarrassing search history.</Subtitle>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={rankedPlayerIds}
          strategy={verticalListSortingStrategy}
        >
          {
            rankedPlayerIds.map((playerId, index) => {
              const player = players.find(p => p.id === playerId);
              return player ? (
                <SortablePlayerItem key={player.id} id={player.id} name={getPlayerNameById(player.id)} index={index} />
              ) : null;
            })
          }
        </SortableContext>
      </DndContext>

      <SubmitButton 
        onClick={onSubmit}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        Submit Rankings
      </SubmitButton>
    </RankingWrapper>
  );
};

export default RankingView;
