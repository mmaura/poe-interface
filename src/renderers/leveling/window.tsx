import React, { useState, useEffect } from "react";
import * as ReactDOM from "react-dom";

import "../index.css";
import "./index.css";

import Player from "./components/Player";
import {
  LevelingGuide,
  ZoneTips,
  ZoneNotes,
  ZoneMap,
} from "./components/LevelingGuide";
import { ZoneGears } from "./components/Gears";
import { ZoneGem } from "./components/Gem";

import { getCurAct, getCurZone, getZoneGear } from "../modules/functions";

function App(props: { AppData: IReactAppInit }) {
  // console.log(props.AppData);

  const initialActs = props.AppData.InitialData.acts as IAppAct[];
  // const initialClasses = props.AppData.InitialData.classes as IAppClasses[];
  const initialGems = props.AppData.InitialData.gems as IAppGems[];

  const defaultGuide = props.AppData.DefaultGuide.gears as IAppGear[];

  //console.log(props)

  const [curPlayer, setcurPlayer] = useState(
    props.AppData.MyPlayer as IAppPlayer
  );

  const [curAct, setcurAct] = useState(() => {
    return getCurAct(initialActs, 1);
  });
  const [curZone, setcurZone] = useState(() => {
    return getCurZone(curAct, "");
  });
  const [curGear, setcurGear] = useState(() => {
    return getZoneGear(defaultGuide, 1, curZone.name);
  });

  /*********************************
   * Events
   */
  function onActChange(e: React.ChangeEvent<HTMLSelectElement>) {
    // console.log("APP: onActChange");
    setcurAct(getCurAct(initialActs, Number(e.target.value)));
  }

  function onZoneChange(e: React.ChangeEvent<HTMLSelectElement>) {
    // console.log("APP: onActChange");
    setcurZone(getCurZone(curAct, e.target.value));
  }

  /**********************************
   * Effects
   */

  useEffect(() => {
    // console.log("APP: useEffect(curActID)");
    // console.log(curZone);
    // console.log(curAct);

    setcurZone(getCurZone(curAct, ""));

    return () => {
      ("");
    };
  }, [curAct]);

  useEffect(() => {
    // console.log("APP: useEffect(curZone)");

    setcurGear(getZoneGear(defaultGuide, curAct.actid, curZone.name));

    return () => {
      ("");
    };
  }, [curZone]);

  /**********************************
   * IPC
   */
  window.levelingAPI.receive("player", (e, arg) => {
    setcurPlayer(arg);
    // console.log("receive player:");
    // console.log(arg);
  });

  window.levelingAPI.receive("playerArea", (e, arg) => {
    // console.log("received playerArea");
    // console.log(arg);

    const _curAct = getCurAct(initialActs, arg.currentZoneAct);
    setcurAct(_curAct);
    setcurZone(getCurZone(_curAct, arg.currentZoneName));
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
            acts={initialActs}
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
          <ZoneGem
            initialGems={initialGems}
            curGears={curGear}
            curPlayer={curPlayer}
            curAct={curAct}
          />
        </div>
        <div className="container col-span-3">
          <h2>Progression du personnage</h2>
        </div>
      </div>
    </div>
  );
}

window.levelingAPI.getInitData().then((result: IReactAppInit) => {
  ReactDOM.render(<App AppData={result} />, document.getElementById("root"));
});
