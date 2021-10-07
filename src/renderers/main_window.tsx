import React, { useState, useEffect } from 'react';
//import * as  from 'react';
import * as ReactDOM from 'react-dom';
import './main_window.css';

function Titre (){

  return <h1>POE Interface</h1>
}

function Gem (){
  const [gem, setgem] = useState(null)  

  return <img></img>
}

function Player () {
  const [player, setplayer] = useState({level:0, name: "na", zone: "na"})

  function refreshPlayer() {
    window.myAPI.player_get().then((result) => {
      // console.log(result)
      setplayer(result)
    })
  }

  useEffect(() => {
    const myTimer = setInterval(refreshPlayer, 5000);
    return () => {
      clearTimeout(myTimer)
    }
  }, [])

  return (
  <div  className="bg-red-50">
    <h2>Information Joueur {player.name}</h2>
    <ul>
      <li>Level:{player.level}</li>
      <li>Zone: {player.zone}</li> 
    </ul>
  </div>
  );
}

ReactDOM.render(<Player />, document.getElementById('root'));
