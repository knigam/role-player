import { Game } from "../game/types";

export interface Datastore {
  doesGameExist: (gameId: string) => Promise<boolean>;
  getGame: (gameId: string) => Promise<Game>;
  listenForGameUpdates: (
    gameId: string,
    setGameCallback: (value: React.SetStateAction<Game | undefined>) => void
  ) => void;
  saveGame: (state: Game, onSuccess?: () => void) => void;
}
