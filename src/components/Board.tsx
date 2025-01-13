import React from "react";
import { GameState, PlayerName } from "../game/types";
import { UserData } from "../services/auth";
import { GameEngine } from "../game/gameEngine";

export interface BoardProps {
  height?: number;
  width?: number;
  gameState: GameState;
  userState: UserData;
  gameEngine: GameEngine;
}

export const Board: React.FC<BoardProps> = ({
  gameState,
  userState,
  gameEngine,
}) => {
  const { players, message } = gameEngine.getPlayerState(gameState, userState);
  return (
    <div className="Board">
      <p>Current Player: {userState.name}</p>
      <p>All Players: {players.join(", ")}</p>
      <p className="multiline">Message: {message}</p>
    </div>
  );
};
