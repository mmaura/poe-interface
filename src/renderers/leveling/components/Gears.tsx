import React, { useState, useEffect } from "react";
import { Gem } from "./Gem";
import Icon from '@mdi/react';
import { mdiBookEdit } from '@mdi/js';

import { findGem } from "../../modules/functions";


export function ZoneGears(props: { curGears: IGuideGear }): JSX.Element {
  const curGears = props.curGears;

  if (props.curGears) {
    return (
      
      <div className="container relative flex flex-col min-h-200px">
        <Icon  
        className="absolute top-1 right-1"
            path={mdiBookEdit}
            size={1}
            />
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
        <h2>Gears
        <Icon  
            path={mdiBookEdit}
            size={1}
            />

        </h2>
        <p>Pas de compétences configurées</p>
      </div>
    );
  }
}

function Gear(props: { gears: GearGear[] }): JSX.Element {
  const gears = props.gears;

  return (
    <div
      className={`${gears.length == 3 ? "poe-item-3slots" : "poe-item-xslots"}`}
    >
      {gears.map((e, index) => {
        if (e.type === "socket")
          return <div className={`poe-${e.color}-socket`} key={index}></div>;
        else
          return <Gem curGem={findGem(e.gemname)}/>
      })}
    </div>
  );
}
