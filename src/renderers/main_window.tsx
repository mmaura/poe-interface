import React, { useState, useEffect } from "react";
import * as ReactDOM from "react-dom";

import "./main_window.css";

import Player from "./components/Player";
import {
  LevelingGuide,
  ZoneTips,
  ZoneNotes,
  ZoneMap,
} from "./components/LevelingGuide";
import { ZoneGears } from "./components/Gears";
import { Gem } from "./components/Gem";

import {
  findCurAct,
  findCurZone,
  findZoneGear,
  findGem,
} from "../modules/utils";

function App(props: { AppData: IReactAppInit }) {
  console.log(props.AppData);

  const actsData = props.AppData.DefaultZonesData.acts as IAppAct[];
  const gearsData = props.AppData.DefaultGearsData.gears as IAppGear[];
  const gemsData = props.AppData.DefaultGemsData as IAppGems[];

  //console.log(props)

  const [curPlayer, setcurPlayer] = useState(
    props.AppData.MyPlayer as IAppPlayer
  );

  const [curAct, setcurAct] = useState(() => {
    return findCurAct(actsData, 1);
  });
  const [curZone, setcurZone] = useState(() => {
    return findCurZone(curAct, "");
  });
  const [curGear, setcurGear] = useState(() => {
    return findZoneGear(gearsData, 1, curZone.name);
  });

  /*********************************
   * Events
   */
  function onActChange(e: React.ChangeEvent<HTMLSelectElement>) {
    console.log("APP: onActChange");
    setcurAct(findCurAct(actsData, Number(e.target.value)));
  }

  function onZoneChange(e: React.ChangeEvent<HTMLSelectElement>) {
    console.log("APP: onActChange");
    setcurZone(findCurZone(curAct, e.target.value));
  }

  /**********************************
   * Effects
   */

  useEffect(() => {
    console.log("APP: useEffect(curActID)");
    console.log(curZone);
    console.log(curAct);

    setcurZone(findCurZone(curAct, ""));

    return () => {
      ("");
    };
  }, [curAct]);

  useEffect(() => {
    console.log("APP: useEffect(curZone)");

    setcurGear(findZoneGear(gearsData, curAct.actid, curZone.name));

    return () => {
      ("");
    };
  }, [curZone]);

  /**********************************
   * IPC
   */
  window.myAPI.receive("player", (e, arg) => {
    setcurPlayer(arg);
    console.log("receive player:");
    console.log(arg);
  });

  window.myAPI.receive("playerArea", (e, arg) => {
    console.log("received playerArea");
    console.log(arg);

    const _curAct = findCurAct(actsData, arg.currentZoneAct);
    setcurAct(_curAct);
    setcurZone(findCurZone(_curAct, arg.currentZoneName));
  });

  return (
    <div className="p-4">
      <div className="flex flex-row flex-nowrap pb-0">
        <div className="flex-grow-0">
          <Player curPlayer={curPlayer} />
          <h1>{curAct.act + " : " + curZone.name}</h1>
        </div>
        <div className="flex-grow">
          <LevelingGuide
            acts={actsData}
            onActChange={onActChange}
            onZoneChange={onZoneChange}
            curAct={curAct}
            curZone={curZone}
            curPlayer={curPlayer}
          />
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2">
        <div className="col-span-5">
          <ZoneMap curZone={curZone} curAct={curAct} />
        </div>
        <div className="row-span-2">
          <ZoneTips />
        </div>
        <div className="col-span-3">
          <ZoneNotes curZone={curZone} curAct={curAct} />
        </div>
        <div className="col-span-2">
          <ZoneGears curGears={curGear} />
        </div>
        <div className="container col-span-3">
          <h2>Liste des courses</h2>
          <Gem curGem={findGem(gemsData, "Fireball")} curPlayer={curPlayer} curAct={curAct} />
        </div>
        <div className="container col-span-3">
          <h2>Progression du personnage</h2>
        </div>
      </div>
    </div>
  );
}

window.myAPI.getInitData().then((result: IReactAppInit) => {
  const data = result;
  ReactDOM.render(<App AppData={data} />, document.getElementById("root"));
});
