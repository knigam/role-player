import { UserData, GameStatus, GameRules } from "./types";

export abstract class GameEngine {
  constructor (public gameRules: GameRules, public dbService: )
  async createGame(gameId: string, userData: UserData): Promise<Response> {
    const gameState = {
      gameId: gameId,
      creatorId: userData.id,
      creatorName: userData.name,
      players: [],
      color: {},
      unplayedPieces: [],
      board: {},
      tournament: false,
    };
    return saveToFirebase(gameState);
  }

  async setupGame(
    state: InternalState,
    userData: UserData,
    request: ISetupGameRequest
  ): Promise<Response> {
    if (gameStatus(state) !== GameStatus.NOT_STARTED) {
      return Response.error("Game has already been started");
    } else if (state.creatorId !== userData.id) {
      return Response.error("Only creator can set up the game");
    }
    state.players = [userData.name];
    state.creatorColor = request.creatorColor;
    state.tournament = request.tournament || false;

    const whitePieces = request.whitePieces.map(
      (type, idx) =>
        ({
          id: idx,
          color: Color.WHITE,
          type,
        } as Piece)
    );
    const blackPieces = request.blackPieces.map(
      (type, idx) =>
        ({
          id: whitePieces.length + idx,
          color: Color.BLACK,
          type,
        } as Piece)
    );
    state.unplayedPieces = whitePieces.concat(blackPieces);
    return saveToFirebase(state);
  }

  async playGame(state: InternalState, userData: UserData): Promise<Response> {
    const { creatorId, creatorName, creatorColor, players } = state;
    const { id, name } = userData;
    if (gameStatus(state) !== GameStatus.NOT_STARTED) {
      return Response.error("Game has already been started");
    } else if (creatorId === id) {
      return Response.error(
        "Waiting for another player to start playing the game"
      );
    } else if (players.length === 0) {
      return Response.error(
        `${creatorName} must set up the game before it can be started`
      );
    }

    const numConflicts = players.filter((p) => p === name).length;
    state.players.push(`${name}${numConflicts > 0 ? numConflicts + 1 : ""}`);

    state.color[creatorId] =
      creatorColor != undefined
        ? creatorColor
        : Math.random() < 0.5
        ? Color.WHITE
        : Color.BLACK; // Assign whichever color was picked to creator or random if nothing was picked
    state.color[id] =
      state.color[creatorId] === Color.WHITE ? Color.BLACK : Color.WHITE; // Assign the unused color to the new player
    state.currentPlayerTurn = Color.WHITE; // White always goes first
    return saveToFirebase(state);
  }
}
