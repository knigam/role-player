import React from "react";
import { GameState, GameStatus } from "../game/types";
import { UserData } from "../services/auth";
import { GameEngine } from "../game/gameEngine";

export interface BoardProps {
  height?: number;
  width?: number;
  gameState: GameState;
  userState: UserData;
  gameEngine: GameEngine;
}

export const Board: React.FC<BoardProps> = ({ gameState, userState, gameEngine }) => {
  const { isCreator, name, players, message } = gameEngine.getPlayerState(gameState, userState);
  const playAgain = () => {
    if (name.trim()) {
      const newUserState = {
        ...userState,
        name: name,
      };
      const newGameState = {
        ...gameState,
        status: GameStatus.GAME_OVER,
      };
      gameEngine.playAgain(newGameState, newUserState);
    }
  };
  return (
    <div className="Board">
      <p>Round: {gameState.round}</p>
      <p>Current Player: {name}</p>
      <p>All Players: {players.join(", ")}</p>
      <p className="multiline">Message: {message}</p>
      {isCreator && (
        <button className="role-player-btn" onClick={playAgain}>
          Play Again!
        </button>
      )}
    </div>
  );
};
