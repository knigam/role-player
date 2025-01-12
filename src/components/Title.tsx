import React, { useState } from "react";
import { Link } from "react-router-dom";

export const Title: React.FC = () => {
  const [gameId, setGameId] = useState<string>("");
  return (
    <div className="Title background">
      <div className="inputs">
        <Link to="/game">
          <button id="newGameBtn" className="role-player-btn">
            New Game
          </button>
        </Link>
        <br />
        <input
          type="text"
          id="gameIdInput"
          className="role-player-input-btn-input"
          value={gameId}
          onChange={(e) => setGameId(e.target.value.toLowerCase())}
        />
        <Link to={`/game/${gameId}`}>
          <button
            id="joinGameBtn"
            className="role-player-btn role-player-input-btn"
          >
            Join Game
          </button>
        </Link>
      </div>
    </div>
  );
};
