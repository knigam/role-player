import React, { useState } from "react";
import {
  ErrorResponse,
  GameSettings,
  GameState,
  Response,
} from "../game/types";
import { UserData } from "../services/auth";
import { GameEngine } from "../game/gameEngine";

export interface LobbyProps {
  height?: number;
  width?: number;
  gameState: GameState;
  userState: UserData;
  gameEngine: GameEngine;
}

interface ILobbyState {
  edited: boolean;
}

export const Lobby: React.FC<LobbyProps> = ({
  gameState,
  userState,
  gameEngine,
}) => {
  const url = document.baseURI;
  const { players, settings } = gameState;
  const { isCreator } = gameEngine.getPlayerState(gameState, userState);
  const gameRules = gameEngine.getGameRules();

  const [errorState, setErrorState] = useState<string | undefined>(undefined);

  //   const [playersListState, setPlayersListState] = useState<PlayerName[]>(
  //     getListOfPlayers(gameState)
  //   );

  // Not sure if this is necessary
  //   useEffect(() => {
  //     setPlayersListState(getListOfPlayers(gameState));
  //   }, [players]);

  const playGame = () => {
    handleErrors(gameEngine.playGame(gameState, userState));
  };

  return (
    <div className="Lobby">
      <h3>Game Code: {getSessionCode()}</h3>
      <span>
        <input
          className="role-player-input-btn-input"
          type="url"
          value={url}
          id="urlText"
          readOnly
        />
        <button
          className="role-player-btn role-player-input-btn"
          onClick={copyUrl}
        >
          Copy
        </button>
      </span>
      <br />
      <h5>{errorState || ""}</h5>
      <div className="GameSettings">
        {[...gameRules.validRoles].map((role) => (
          <>
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
          </>
        ))}
      </div>
      <br />
      {!isCreator && (
        <button
          className="role-player-btn"
          onClick={playGame}
          disabled={players.length === 0}
        >
          Play!
        </button>
      )}
    </div>
  );

  //   function getListOfPlayers(gameState: GameState): PlayerName[] {
  //     return gameState.players.map((p) => p.name);
  //   }

  function checkboxChanged(
    event: React.ChangeEvent<HTMLInputElement>,
    role: string
  ) {
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
