import React, { useState, useEffect, useCallback, useLayoutEffect } from "react"
import * as ReactDOM from "react-dom"

import "../index.css"
import "./index.css"

import { Player, LevelingGuide, ZoneNotes, ZoneMap, SkillTree, ZoneGem, ZoneGears } from "./Components"

import { getCurAct, getCurZone } from "../modules/functions"
import { IpcRendererEvent } from "electron"

export const PlayerContext = React.createContext({} as IAppPlayer)
export const ActContext = React.createContext({} as IAppAct)

function App(props: { Init: any }) {
  const [curAct, setcurAct] = useState(getCurAct(1))
  const [curZone, setcurZone] = useState({} as IAppZone)

  const [curPlayer, setcurPlayer] = useState(props.Init[3] as IAppPlayer)
  // const [curGuide, setcurGuide] = useState(props.Init[1] as IGuide)
  const curGuide = props.Init[1] as IGuide

  const [curRichText, setcurRichText] = useState(props.Init[0] as IRichText[])

  /*********************************
   * Events
   */
  const onActChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setcurAct(getCurAct(Number(e.target.value)))
  }, [])

  const onZoneChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setcurZone(getCurZone(curAct.actid, e.target.value))
    },
    [curAct]
  )
  /**********************************
   * Effects
   */
  useEffect(() => {
    setcurZone(getCurZone(curAct.actid, ""))
  }, [curAct])

  useEffect(() => {
    const buf = getCurAct(curPlayer.currentZoneAct)
    setcurAct(buf)
    setcurZone(getCurZone(buf.actid, curPlayer.currentZoneName))
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

          //   buf = getCurAct(arg.currentZoneAct)
          //   setcurAct(buf)
          //   setcurZone(getCurZone(buf.actid, arg.currentZoneName))
          break
      }
    })
    return () => {
      window.poe_interfaceAPI.cleanup("levelingRenderer")
    }
  }, [])

  return (
    <ActContext.Provider value={curAct}>
      <PlayerContext.Provider value={curPlayer}>
        <div className="p-2 h-full">
          <div className="flex flex-row flex-nowrap pb-2 items-center h-full">
            <div className="flex-grow-0">
              <Player />
              <h1>{curAct.act + " : " + curZone.name}</h1>
            </div>

            <div className="flex-grow h-full">
              <ZoneMap curZone={curZone} curAct={curAct} />
            </div>
            <div className="flex-grow-0 h-full">
              <LevelingGuide
                onActChange={onActChange}
                onZoneChange={onZoneChange}
                curAct={curAct}
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
                <SkillTree curGuide={curGuide} curAct={curAct} />
              </div>
            </div>
            <div className="container flex-shrink-0 flex-grow-0 w-gear-container">
              <ZoneGears curGuide={curGuide} curAct={curAct} curRichText={curRichText} />
              <ZoneGem curGuide={curGuide} curAct={curAct} />
            </div>
          </div>
        </div>
      </PlayerContext.Provider>
    </ActContext.Provider>
  )
}

window.poe_interfaceAPI.sendSync("Init", "get").then((e) => {
  // console.log("then ", e)
  ReactDOM.render(<App Init={e} />, document.getElementById("root"))
})
