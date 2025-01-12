import { UserData } from "../services/auth";
import { Datastore } from "../services/datastore";
import {
  GameStatus,
  GameRules,
  GameState,
  Response,
  GameSettings,
  PlayerState,
} from "./types";

export class GameEngine {
  private _gameRules: GameRules;
  private _datastore: Datastore;

  constructor(gameRules: GameRules, datastore: Datastore) {
    this._gameRules = gameRules;
    this._datastore = datastore;
  }

  getGameRules(): GameRules {
    return this._gameRules;
  }

  getDataStore(): Datastore {
    return this._datastore;
  }

  createGame(gameId: string, userData: UserData): Promise<Response> {
    const gameState: GameState = {
      gameId: gameId,
      creatorId: userData.id,
      creatorName: userData.name,
      settings: { roles: [] },
      status: GameStatus.NOT_STARTED,
      players: [{ id: userData.id, name: userData.name }],
    };
    return this._datastore.saveGame(gameState);
  }

  async setupGame(
    state: GameState,
    userData: UserData,
    settings: GameSettings
  ): Promise<Response> {
    if (state.status !== GameStatus.NOT_STARTED) {
      return Response.error("Game has already been started");
    } else if (state.creatorId !== userData.id) {
      return Response.error("Only creator can set up the game");
    }

    const invalidRoles = settings.roles.filter(
      (r) => !this._gameRules.validRoles.has(r)
    );
    if (invalidRoles.length) {
      return Response.error(`The following roles are invalid: ${invalidRoles}`);
    }

    return this._datastore.saveGame({ ...state, settings });
  }

  async joinGame(state: GameState, userData: UserData): Promise<Response> {
    state.players.forEach((p) => {
      if (p.id === userData.id) {
        return Response.error("User has already joined the game");
      }
      if (p.name === userData.name) {
        return Response.error(`The name '${userData.name}' is already taken`);
      }
    });

    const newGameState = {
      ...state,
      players: [...state.players, { id: userData.id, name: userData.name }],
    };

    return this._datastore.saveGame(newGameState);
  }

  async leaveGame(state: GameState, userData: UserData): Promise<Response> {
    const oldNumPlayers = state.players.length;
    const newPlayers = state.players.filter((p) => p.id !== userData.id);

    if (oldNumPlayers === newPlayers.length) {
      return Response.error("This player is not in the game");
    }
    return this._datastore.saveGame({ ...state, players: newPlayers });
  }

  async playGame(state: GameState, userData: UserData): Promise<Response> {
    const { creatorId, players, settings, status } = state;
    const { id } = userData;
    const { minPlayers, maxPlayers } = this._gameRules;

    if (status !== GameStatus.NOT_STARTED) {
      return Response.error("Game has already been started");
    } else if (creatorId !== id) {
      return Response.error("Only the creator can start the game");
    } else if (players.length < minPlayers) {
      return Response.error(
        `A minimum of ${minPlayers} is required for the game to start`
      );
    } else if (players.length > maxPlayers) {
      return Response.error(
        `A maximum of ${maxPlayers} is required for the game to start`
      );
    }

    try {
      const playersWithRoles = this._gameRules.assignRoles(
        players,
        settings.roles
      );
      const newGameState = {
        ...state,
        status: GameStatus.IN_PROGRESS,
        players: playersWithRoles,
      };
      return this._datastore.saveGame(newGameState);
    } catch (error) {
      return Response.error(`Unable to assign roles and start game: ${error}`);
    }
  }

  async playAgain(state: GameState, userData: UserData): Promise<Response> {
    if (state.status !== GameStatus.GAME_OVER) {
      return Response.error("The game has not finished yet");
    }
    const playersWithoutRoles = state.players.map((p) => ({
      ...p,
      role: undefined,
    }));

    const newGameState = {
      ...state,
      status: GameStatus.NOT_STARTED,
      players: playersWithoutRoles,
    };

    return this.playGame(newGameState, userData);
  }

  getPlayerState(state: GameState, userData: UserData): PlayerState {
    const currPlayer = state.players.find((p) => p.id === userData.id);
    if (!currPlayer) {
      throw Error("Current user is not a player of this game");
    }

    return {
      isCreator: state.creatorId === userData.id,
      players: state.players.map((p) => p.name),
      message:
        currPlayer.role &&
        this._gameRules.generateMessageForRole(currPlayer.role, state.players),
      status: state.status,
    };
  }
}
