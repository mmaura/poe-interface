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
import {ZoneGears} from './components/Gears'

import { findCurAct, findCurZone, findZoneGear } from "../modules/utils";

function App(props: { AppData: IReactAppInit }) {

  console.log(props.AppData)

  const actsData = props.AppData.DefaultZonesData.acts as IAppAct[];
  const gearsData = props.AppData.DefaultGearsData.gears as IAppGear[];
  //console.log(props)

  const [curPlayer, setcurPlayer] = useState(props.AppData.MyPlayer as IAppPlayer)
  const [curActID, setcurActID] = useState(1);
  const [curZoneID, setcurZoneID] = useState("");

  const [curAct, setcurAct] = useState(() => {
    console.log("init state curAct");
    return findCurAct(actsData, 1);
  });
  const [curZone, setcurZone] = useState(() => {
    console.log("init state curZone");
    return findCurZone(curAct, "");
  });
  const [curGear, setcurGear] = useState(() => {
    const _curZoneID = curZone.name
    console.log("init state curGears");
    console.log(gearsData)
    console.log(curActID)
    console.log(_curZoneID)

    return findZoneGear( gearsData, 1, _curZoneID);    
  })

  /*********************************
   * Events
   */
  function onActChange(e: React.ChangeEvent<HTMLSelectElement>) {
    console.log("APP: onActChange");

    const _curAct = findCurAct(actsData, Number(e.target.value))

    setcurActID(Number(e.target.value));
    setcurAct(_curAct);
    setcurZoneID('')
    setcurZone(findCurZone(_curAct,''))
  }

  function onZoneChange(e: React.ChangeEvent<HTMLSelectElement>) {
    console.log("APP: onActChange");
    setcurZoneID(e.target.value);
    setcurZone(findCurZone(curAct, e.target.value));
  }

  /**********************************
   * IPC
   */
  window.myAPI.receive("player", (e, arg) => {
    setcurPlayer(arg);
    console.log("receive player:")
    console.log(arg)
  })

  window.myAPI.receive("playerArea", (e, arg) => {
    console.log("received playerArea")
    console.log(arg)

    const _curAct = findCurAct(actsData,arg.currentZoneAct)

    setcurActID(arg.currentZoneAct)
    setcurAct(_curAct);

    setcurZoneID(arg.currentZoneName)
    setcurZone(findCurZone(_curAct, arg.currentZoneName));
  })

  useEffect(() => {
    //Changing the act must force Zone informations update
    console.log("APP: useEffect(curActID)");
    //setcurAct(findCurAct(actsData, curActID))
    
    //setcurZoneID("");
    //setcurZone(findCurZone(curAct, ""));

    return () => {
      ("");
    };
  }, [curActID]);

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
            curActID={curActID}
            curZoneID={curZoneID}
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
        <div className=""></div>
        <div className="">choses a faire en fonction de la zone</div>
        <div className="">choses a faire pour acceder à la zone suivante</div>
      </div>
    </div>
  );
}

window.myAPI.getInitData().then((result: IReactAppInit) => {
  //     // console.log(result)
  const data = result;
  ReactDOM.render(<App AppData={data} />, document.getElementById("root"));
});
