export type PlayerName = string;
export interface PlayerState {
  isCreator: boolean;
  name: PlayerName;
  players: PlayerName[];
  message?: string;
  status: GameStatus;
}

export interface Player {
  id: string;
  name: PlayerName;
  role?: RoleName;
}
export type RoleName = string;
export interface GameRules {
  minPlayers: number;
  maxPlayers: number;
  validRoles: Set<RoleName>;
  assignRoles: (state: GameState, roles: RoleName[]) => Player[];
  generateMessageForRole: (role: RoleName, players: Player[]) => string;
}
export interface GameSettings {
  roles: RoleName[];
}
export enum GameStatus {
  NOT_STARTED,
  IN_PROGRESS,
  GAME_OVER,
}
export interface GameState {
  gameId: string;
  round: number;
  creatorId: string;
  creatorName: PlayerName;
  settings: GameSettings;
  status: GameStatus;
  players: Player[];
}

export interface SuccessResponse {
  type: "success";
}
export interface ErrorResponse {
  type: "error";
  error?: string;
}
export type Response = SuccessResponse | ErrorResponse;
export const Response: {
  ok: () => SuccessResponse;
  error: (error?: string) => ErrorResponse;
} = {
  ok: () => ({
    type: "success",
  }),
  error: (error?: string) => ({
    type: "error",
    error,
  }),
};
