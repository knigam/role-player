import React, { useState } from "react";
import { ErrorResponse, GameState, Response } from "../game/types";
import { UserData } from "../services/auth";
import { GameEngine } from "../game/gameEngine";

export interface LobbyProps {
  height?: number;
  width?: number;
  gameState: GameState;
  userState: UserData;
  gameEngine: GameEngine;
}

export const Lobby: React.FC<LobbyProps> = ({ gameState, userState, gameEngine }) => {
  const url = document.baseURI;
  const { players, settings } = gameState;
  const isCreator = gameState.creatorId === userState.id;
  const gameRules = gameEngine.getGameRules();

  const [nameState, setNameState] = useState<string>(userState.name);
  const [errorState, setErrorState] = useState<string | undefined>(undefined);

  const playOrJoinGame = () => {
    if (nameState.trim()) {
      const newUserState = {
        ...userState,
        name: nameState,
      };
      if (isCreator) {
        playGame(newUserState);
      } else {
        joinGame(newUserState);
      }
    } else {
      setErrorState("Name cannot be left blank");
    }
  };

  const playGame = (player: UserData) => {
    handleErrors(gameEngine.playGame(gameState, player));
  };

  const joinGame = (player: UserData) => {
    handleErrors(gameEngine.joinGame(gameState, player));
  };

  return (
    <div className="Lobby">
      <h3>Game Code: {getSessionCode()}</h3>
      <span>
        <input className="role-player-input-btn-input" type="url" value={url} id="urlText" readOnly />
        <button className="role-player-btn role-player-input-btn" onClick={copyUrl}>
          Copy
        </button>
      </span>
      <br />
      <h5>{errorState || ""}</h5>
      <div className="GameSettings">
        {[...gameRules.validRoles].map((role) => (
          <div key={`${role}-setting`}>
            <label>
              <input
                disabled={!isCreator}
                type="checkbox"
                id={`${role}Checkbox`}
                checked={settings.roles.includes(role)}
                onChange={(event) => checkboxChanged(event, role)}
              />
              {role}
            </label>
            <br />
          </div>
        ))}
      </div>
      <br />
      <div>Current Players: {gameState.players.map((p) => p.name).join(", ")}</div>
      <br />
      <span>
        <input
          className="role-player-input-btn-input"
          type="text"
          value={nameState}
          placeholder="Name"
          id="nameText"
          onChange={(event) => setNameState(event.target.value)}
        />
        <button
          className="role-player-btn role-player-input-btn"
          onClick={playOrJoinGame}
          disabled={players.length === 0}
        >
          {isCreator ? "Play!" : "Join!"}
        </button>
      </span>
    </div>
  );

  function checkboxChanged(event: React.ChangeEvent<HTMLInputElement>, role: string) {
    if (gameRules.validRoles.has(role)) {
      const settingChecked = event.target.checked;
      const { roles } = settings;

      if (settingChecked && !roles.includes(role)) {
        const newSettings = {
          ...settings,
          roles: roles.concat(role),
        };
        handleErrors(gameEngine.setupGame(gameState, userState, newSettings));
      } else if (!settingChecked && roles.includes(role)) {
        const newSettings = {
          ...settings,
          roles: roles.filter((r) => r !== role),
        };
        handleErrors(gameEngine.setupGame(gameState, userState, newSettings));
      }
    }
  }

  function handleErrors(reponse: Promise<Response>): void {
    reponse.then((response) => {
      if (response.type === "error") {
        setErrorState((response as ErrorResponse).error);
      }
    });
  }

  function getSessionCode(): string {
    return url.split("game/")[1].toUpperCase();
  }

  function copyUrl(): void {
    const copyText = document.getElementById("urlText") as HTMLInputElement;
    if (copyText) {
      copyText.select();
      copyText.setSelectionRange(0, 99999); /* For mobile devices */
      document.execCommand("copy");
    }
  }
};
