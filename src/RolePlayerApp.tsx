import React from "react";
import { useWindowDimensions } from "./helpers/window";
import { Title } from "./components/Title";
import "./App.scss";
import { RolePlayerGame } from "./components/RolePlayerGame";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GameEngine } from "./game/gameEngine";

export interface RolePlayerAppProps {
  gameEngine: GameEngine;
}

export const RolePlayerApp: React.FC<RolePlayerAppProps> = ({ gameEngine }) => {
  const { height, width } = useWindowDimensions();
  return (
    <div className="RolePlayerApp">
      <BrowserRouter>
        <div>
          <Routes>
            <Route path="/" element={<Title />} />
            <Route
              path="/game/*"
              element={
                <RolePlayerGame
                  height={height}
                  width={width}
                  gameEngine={gameEngine}
                />
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
};
