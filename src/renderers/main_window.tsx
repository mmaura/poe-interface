import React, { useState, useEffect } from 'react';
import * as ReactDOM from 'react-dom';
import './main_window.css';
import Player from './components/Player'
import LevelingGuide, {ZoneTips} from './components/LevelingGuide';

function App( props:any ){

  let playerData = {} as player;
  let actsData = {} as InitData;
  
  console.log(props)

  playerData = props.AppData.POE_PLAYER
  actsData = props.AppData.InitData.acts

  return (
    <div>
      <div className="flex flex-row flex-nowrap p-4">
        <div className="flex-grow-0"><Player player={playerData} /></div>
        <div className="flex-grow"><LevelingGuide acts={actsData} /></div>
      </div>  
      <div className="flex flex-row flex-nowrap">
        <div className="">
          <ZoneTips />
        </div>
        <div className="">
          choses a faire en fonction du level
        </div>
        <div className="">
          choses a faire en fonction de la zone
        </div>
        <div className="">
          choses a faire pour acceder à la zone suivante
        </div>
      </div>
    </div>
  );
}

window.myAPI.getInitData().then((result) => {
  //     // console.log(result)
  const data = result;
  ReactDOM.render(<App AppData={data} />, document.getElementById('root'));
})

