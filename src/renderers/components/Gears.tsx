import React, { useState, useEffect } from "react";
import { Gem } from "../components/Gem";

import { findGem } from "../../modules/utils";

export function ZoneGears(props: { curGears: IAppGear }): any {
  const curGears = props.curGears;

  console.log("in Gears");
  console.log(curGears);

  if (props.curGears != undefined) {
    return (
      <div className="container flex flex-col min-h-200px">
        <h2>Gears</h2>
        <p>{curGears.note ? curGears.note : "&nbsp;"}</p>
        <div className="flex flex-row flex-wrap gap-2 items-start">
          {curGears.gears.map((e, index) => {
            return <Gear key={index} gears={e} />;
          })}
        </div>
      </div>
    );
  } else {
    return (
      <div className="container flex flex-col min-h-200px">
        <h2>Gears</h2>
        <p>Pas de compétences configurées</p>
      </div>
    );
  }
}

function Gear(props: { gears: IGear[] }): any {
  const gears = props.gears;

  return (
    <div
      className={`${gears.length == 3 ? "poe-item-3slots" : "poe-item-xslots"}`}
    >
      {gears.map((e, index) => {
        if (e.type === "socket")
          return <div className={`poe-${e.color}-socket`} key={index}></div>;
        // else
        // return <Gem curGem={findGem(e.gem)}/>
      })}
    </div>
  );
}
