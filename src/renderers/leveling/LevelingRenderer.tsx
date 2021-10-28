import React, { useState, useEffect, useCallback, useLayoutEffect, useMemo } from "react"
import * as ReactDOM from "react-dom"

import "../index.css"
import "./index.css"
import { Player, LevelingGuide, ZoneNotes, ZoneMap, SkillTree, ZoneGem, ZoneGears } from "./Components"


export const PlayerContext = React.createContext({} as IAppPlayer)
export const ActContext = React.createContext({} as IActs)

function App(props: { Init: any }) {
  const [Acts, setActs] = useState(props.Init[1] as IActs[])
  const [curRichText, setcurRichText] = useState(props.Init[2] as IRichText[])
  const [curGuide, setcurGuide] = useState(props.Init[3] as IGuide)
  const [curPlayer, setcurPlayer] = useState(props.Init[4] as IAppPlayer)
  const [curActID, setcurActID] = useState(props.Init[5] as number)
  const [curZoneName, setcurZoneName] = useState(props.Init[6] as string)

  const curAct = useMemo(() => {
    console.log("Memo curAct", curActID)
     const _act = Acts.find((e) => (e.actid === curActID))
     console.log(_act)
     return _act
  }, [Acts, curActID])

  const curZone= useMemo(() => {
    console.log("Memo curZone", curZoneName)
    const _zone = curAct.zones.find((e) => (e.name === curZoneName))
    if (!_zone) return curAct.zones[0]
    console.log(_zone)
    return _zone
  }, [curAct, curZoneName])

  
  /*********************************
   * Events
   */
  const onActChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    // setcurAct(getCurAct(Number(e.target.value)))
    setcurActID(Number(e.target.value))
  }, [])

  const onZoneChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      // setcurZone(getCurZone(curActID, e.target.value))
      setcurZoneName(e.target.value)
    },
    [curAct]
  )
  /**********************************
   * Effects
   */
  // useEffect(() => {
  //   setcurAct(curAct)
  //   return () => {
  //     null
  //   }
  // }, [curActID])

  // useEffect(() => {
  //   setcurZone(getCurZone(curAct.actid, ""))
  // }, [curAct])

  useEffect(() => {
    // const buf = computeCurAct(curPlayer.currentZoneAct)
    setcurActID(curPlayer.currentZoneAct)
    // setcurAct(computeCurAct)
    // setcurZone(getCurZone(curActID, curPlayer.currentZoneName))
    setcurZoneName(curPlayer.currentZoneName)
    return () => {
      null
    }
  }, [curPlayer])
  /**********************************
   * IPC
   */
  useLayoutEffect(() => {
    window.poe_interfaceAPI.receive("levelingRenderer", (e, arg) => {
      console.log("=> Receive levelingRenderer :", arg)
      switch (arg[0]) {
        case "player":
          setcurPlayer(arg[1])
          break
        case "playerArea":
          setcurPlayer(arg[1])
          break
        case "All":
          setActs(arg[1])
          setcurRichText(arg[2])
          setcurGuide(arg[3])
          break
      }
    })
    return () => {
      window.poe_interfaceAPI.cleanup("levelingRenderer")
    }
  }, [])

  console.log("curZone", curZone)

  return (
    <ActContext.Provider value={curAct}>
      <PlayerContext.Provider value={curPlayer}>
        <div className="p-2 h-full">
          <div className="flex flex-row flex-nowrap pb-2 items-center h-full">
            <div className="flex-grow-0">
              <Player />
              <h1>{curAct.act + " : " + curZoneName}</h1>
            </div>

            <div className="flex-grow h-full">
              <ZoneMap curZone={curZone} curAct={curAct} />
            </div>
            <div className="flex-grow-0 h-full">
              <LevelingGuide
                onActChange={onActChange}
                onZoneChange={onZoneChange}
                Acts={Acts}
                curZone={curZone}
              />
            </div>
          </div>

          <div className="flex flex-row gap-2">
            <div className="flex flex-grow flex-shrink flex-col gap-2 w-notes-container">
              <div className="flex-grow ">
                <ZoneNotes curZone={curZone} curRichText={curRichText} />
              </div>
              <div className="flex-grow-0 flex-shrink items-end">
                <SkillTree curGuide={curGuide} />
              </div>
            </div>
            <div className="container flex-shrink-0 flex-grow-0 w-gear-container">
              <ZoneGears curGuide={curGuide} curRichText={curRichText} />
              <ZoneGem curGuide={curGuide} />
            </div>
          </div>
        </div>
      </PlayerContext.Provider>
    </ActContext.Provider>
  )
}

window.poe_interfaceAPI.sendSync("Init", "get").then(e => {
  // console.log("then ", e)
  ReactDOM.render(<App Init={e} />, document.getElementById("root"))
})
