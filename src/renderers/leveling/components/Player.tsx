import React from "react";

export default function Player(props: { curPlayer: IAppPlayer }): JSX.Element {
  const player = props.curPlayer;
  console.log( player.characterAscendancy)
  return (
    <div className="inventory">
      {player ? (
        <>
          <div className="absolute">
            <div
              className={`avatar bg-${
                player.characterAscendancy
                  ? player.characterAscendancy.toLowerCase() 
                  : player.characterClass.toLowerCase()
              }`}
            ></div>
            <div className="inventory-text top-inventory-line1">
              {player.name}
            </div>
            <div className="inventory-text top-inventory-line2">
              Level {player.level} {player.characterClass}
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
