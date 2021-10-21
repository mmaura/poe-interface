import React, { useContext } from "react";
import { PlayerContext } from "../window";

export default function Player(): JSX.Element {
  const curPlayer = useContext(PlayerContext) as IAppPlayer

  console.log( curPlayer.characterAscendancy)
  return (
    <div className="inventory">
      {curPlayer ? (
        <>
          <div className="absolute">
            <div
              className={`avatar bg-${
                curPlayer.characterAscendancy
                  ? curPlayer.characterAscendancy.toLowerCase() || ''
                  : curPlayer.characterClass.toLowerCase() || ''
              }`}
            ></div>
            <div className="inventory-text top-inventory-line1">
              {curPlayer.name}
            </div>
            <div className="inventory-text top-inventory-line2">
              Level {curPlayer.level} {curPlayer.characterClass}
            </div>
          </div>
        </>
      ) : (
        <>
          <p>En attente de connection</p>
        </>
      )}
    </div>
  );
}
