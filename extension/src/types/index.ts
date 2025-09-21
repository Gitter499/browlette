export interface Player {
  id: string;
  name: string;
}

export interface HistoryItem {
  id: string;
  lastVisitTime: number;
  title?: string;
  url?: string;
  visitCount?: number;
}

export interface RoundResults {
  scores: { [playerId: string]: number };
  votes: { [voterId: string]: string };
  currentRoundOwnerId: string;
}
