export type PlayerName = string;
export interface PlayerState {
  isCreator: boolean;
  players: PlayerName[];
  message: string;
  status: GameStatus;
}

export interface Player {
  name: PlayerName;
  role: RoleName;
}
export type RoleName = string;
export interface GameRules {
  min_players: number;
  max_players: number;
  assignRoles: (players: PlayerName[], roles: RoleName[]) => Player[];
  generateMessageForRole: (role: RoleName, players: Player[]) => string;
}
export enum GameStatus {
  NOT_STARTED,
  IN_PROGRESS,
  GAME_OVER,
}
export interface Game {
  gameId: string;
  creatorId: string;
  creatorName: PlayerName;
  status: GameStatus;
  players: Player[];
}
export interface AnonymousUserData {
  type: "anonymous";
  id: string;
  name: string;
}
export interface GoogleUserData {
  type: "google";
  id: string;
  name: string;
  email: string;
  locale: string;
  picture: string;
}
export type UserData = AnonymousUserData | GoogleUserData;
