import React, { useState, useEffect } from "react";

export default function Player(props: any): any {
  console.log("inPlayer");
  console.log(props);

  const player = props.curPlayer;

  return (
    <div className="inventory">
      {player ? (
        <>
          <div className="absolute">
            <div className={`${player.characterClass.toLowerCase()}`}></div>
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
