import { useEffect, useState } from "react";
import { NavigateFunction, useLocation, useNavigate } from "react-router-dom";
import { GameEngine } from "../game/gameEngine";
import { signInAnonymouslyWithFirebase, UserData } from "../services/auth";
import { GameState, GameStatus } from "../game/types";
import { FirebaseDatastore } from "../services/firebase";
import { Lobby, LobbyProps } from "./Lobby";
import { Board, BoardProps } from "./Board";

interface GameProps {
  height: number;
  width: number;
  gameEngine: GameEngine;
  LobbyComponent?: React.FC<LobbyProps>;
  BoardComponent?: React.FC<BoardProps>;
}

export const RolePlayerGame: React.FC<GameProps> = ({
  height,
  width,
  gameEngine,
  LobbyComponent,
  BoardComponent,
}) => {
  const [gameState, setGameState] = useState<GameState | undefined>(undefined);
  const [userState, setUserState] = useState<UserData | undefined>(undefined);
  const [is404, setIs404] = useState<boolean>(false);
  const path = useLocation().pathname;
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = signInAnonymouslyWithFirebase(
      gameEngine.getDataStore() as FirebaseDatastore,
      setUserStateIfNotSet
    );
    if (userState && !gameState) {
      initGame(gameEngine, userState, path, navigate, setGameState).catch(
        (e) => {
          setIs404(true);
        }
      );
    }

    return () => {
      unsub();
    };
  }, [path, userState]);

  if (gameState && userState && !is404 && path !== "/game") {
    return (
      <div>
        {gameState.status === GameStatus.NOT_STARTED &&
          ((LobbyComponent && (
            <LobbyComponent
              height={height}
              width={width}
              gameState={gameState}
              userState={userState}
              gameEngine={gameEngine}
            ></LobbyComponent>
          )) || (
            <Lobby
              gameState={gameState}
              userState={userState}
              gameEngine={gameEngine}
            ></Lobby>
          ))}
        {gameState.status !== GameStatus.NOT_STARTED &&
          ((BoardComponent && (
            <BoardComponent
              height={height}
              width={width}
              gameState={gameState}
              userState={userState}
              gameEngine={gameEngine}
            ></BoardComponent>
          )) || (
            <Board
              gameState={gameState}
              userState={userState}
              gameEngine={gameEngine}
            ></Board>
          ))}
      </div>
    );
  } else if (is404) {
    return (
      <div className="background">
        <span className="fourOhFour">
          Game with this Game Code does not exist
        </span>
      </div>
    );
  } else {
    return <div></div>;
  }

  function setUserStateIfNotSet(userData: UserData): void {
    if (!userState) {
      setUserState(userData);
    }
  }
};

async function initGame(
  gameEngine: GameEngine,
  userState: UserData,
  path: string,
  navigate: NavigateFunction,
  setGame: React.Dispatch<React.SetStateAction<GameState | undefined>>
): Promise<void> {
  const datastore = gameEngine.getDataStore();
  if (path === "/game") {
    const gameId = Date.now().toString(36).slice(0, 6);
    const gameExists = await datastore.doesGameExist(gameId);
    if (!gameExists) {
      gameEngine.createGame(gameId, userState).then((result) => {
        if (result.type === "success") {
          navigate(`/game/${gameId}`, { replace: true });
        } else {
          throw Error(result.error);
        }
      });
    }
  } else {
    const gameId = path.split("/").pop()!;
    datastore.listenForGameUpdates(gameId, setGame);
  }
}
