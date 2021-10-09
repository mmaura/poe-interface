import React, { useState, useEffect } from 'react';


export default function Player(props: any){ 

  console.log('inPlayer')
  console.log(props)

  const [player, setplayer] = useState(props.player)


  window.myAPI.receive('player', (event, arg) => {
    setplayer(arg)
    //console.log(arg) 
  })

  // function refreshPlayer() {
  //   window.myAPI.player_get().then((result) => {
  //     // console.log(result)
  //     setplayer(result)
  //   })
  // }

  // useEffect(() => {
  //   const myTimer = setInterval(refreshPlayer, 5000);

  //   refreshPlayer();
  //   return () => {
  //     clearTimeout(myTimer)
  //   }
  // }, [])

  return (
  <div className="inventory"> 
  {player ?
    <>
    <div className="absolute"><div className={`${  player.characterClass.toLowerCase( ) }`}></div>
    <div className="inventory-text top-inventory-line1">{player.name}</div>
    <div className="inventory-text top-inventory-line2">Level {player.level} {player.characterClass}</div>
    </div>
    </>
  : <><p>En attente de connection</p></> }
  </div>
  );
}
  
