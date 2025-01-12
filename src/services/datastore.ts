import { GameState, Response } from "../game/types";

export interface Datastore {
  doesGameExist: (gameId: string) => Promise<boolean>;
  getGame: (gameId: string) => Promise<GameState>;
  listenForGameUpdates: (
    gameId: string,
    setGameCallback: (
      value: React.SetStateAction<GameState | undefined>
    ) => void
  ) => void;
  saveGame: (state: GameState) => Promise<Response>;
}
