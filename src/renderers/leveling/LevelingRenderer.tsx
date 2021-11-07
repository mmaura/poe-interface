import React, { useState, useEffect, useCallback, useLayoutEffect, useMemo } from "react"
import * as ReactDOM from "react-dom"

import "../index.css"
import "./index.css"
import { Player, LevelingGuide, ZoneNotes, ZoneMap, SkillTree, ZoneGem, ZoneGears } from "./Components"

export const PlayerContext = React.createContext({} as IAppPlayer)
export const CurActContext = React.createContext({} as IAct)
export const RichTextContext = React.createContext({} as IRichText[])

function App(props: { Init: any }) {
  const [actsGuide, setactsGuide] = useState(props.Init[1] as IActsGuide)
  const [curRichText, setcurRichText] = useState(props.Init[2] as IRichText[])
  const [classGuide, setclassGuide] = useState(props.Init[3] as IClassesGuide)
  const [curPlayer, setcurPlayer] = useState(props.Init[4] as IAppPlayer)
  const [curActID, setcurActID] = useState(props.Init[5] as number)
  const [curZoneName, setcurZoneName] = useState(props.Init[6] as string)

  const curAct = useMemo(() => {
    console.log("**useMemo curAct", curActID)
    const _act = actsGuide.acts.find(e => e.actid === curActID)
    console.log("return: ", _act)

    return _act
  }, [actsGuide, curActID])

  const curZone = useMemo(() => {
    console.log("**useMemo curZone", curZoneName)
    if (curAct && curAct.zones) {
      const _zone = curAct.zones.find(e => e.name === curZoneName)
      if (!_zone) return curAct.zones[0]
      console.log("return : ", _zone)
      return _zone
    } else {
      console.log("return: null")
      return null
    }
  }, [curZoneName, curAct, actsGuide])

  /*********************************
   * Events
   */
  const onActChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setcurActID(Number(e.target.value))
  }, [])

  const onZoneChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setcurZoneName(e.target.value)
    },
    [curAct]
  )

  const onZoneNoteSave = useCallback((text: string) => {
    console.log("text", text)
    window.poe_interfaceAPI
      .sendSync("levelingRenderer", "save", "zoneNotes", { zoneName: curZoneName, actId: curActID }, text)
      .then(e => {
        console.log(e)
      })
    console.log("save")
  }, [curZoneName, curActID])

  /**********************************
   * Effects
   */
  useEffect(() => {
    console.log("**UseEffect [CurPlayer]")
    if (curActID !== curPlayer.currentZoneAct) {
      setcurActID(curPlayer.currentZoneAct)
      console.log("setcurActID: ", curAct)

      const _act = actsGuide.acts.find(act => act.actid === curPlayer.currentZoneAct)
      if (_act) {
        const _zone = _act.zones.find(e => e.name === curPlayer.currentZoneName)
        if (!_zone) {
          console.log("setcurZoneName: ", curAct.zones[0].name)
          setcurZoneName(curAct.zones[0].name)
        } else {
          console.log("setcurZoneName: ", curPlayer.currentZoneName)
          setcurZoneName(curPlayer.currentZoneName)
        }
      }
    } else {
      const _zone = curAct.zones.find(e => e.name === curPlayer.currentZoneName)
      if (_zone) {
        console.log("setcurZoneName: ", curPlayer.currentZoneName)
        setcurZoneName(curPlayer.currentZoneName)
      }
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
        case "classGuide":
          setclassGuide(arg[1])
          break
        case "actsGuide":
          console.log("setactsGuide :", arg[1])
          setactsGuide(arg[1])
          break
        case "All":
          setactsGuide(arg[1])
          setcurRichText(arg[2])
          setclassGuide(arg[3])
          break
      }
    })
    return () => {
      window.poe_interfaceAPI.cleanup("levelingRenderer")
    }
  }, [])

  return (
    <CurActContext.Provider value={curAct}>
      <PlayerContext.Provider value={curPlayer}>
        <RichTextContext.Provider value={curRichText}>
          <div className="p-2 h-full">
            <div className="flex flex-row flex-nowrap pb-2 items-center h-full">
              <div className="flex-grow-0">
                <Player />
                <h1>{curAct && curZone ? `${curAct.act} : ${curZone.name}` : null}</h1>
              </div>
              <div className="flex-grow h-full">
                <ZoneMap curZone={curZone} curAct={curAct} actsGuideIdent={actsGuide.identity} />
              </div>
              <div className="flex-grow-0 h-full">
                <div className="text-center">
                  <u>ActGuide:</u> {actsGuide.identity.name} - <u>ClassGuide:</u> {classGuide.identity.name}
                </div>

                <LevelingGuide
                  onActChange={onActChange}
                  onZoneChange={onZoneChange}
                  Acts={actsGuide}
                  curZone={curZone}
                />
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="flex flex-grow flex-shrink flex-col gap-2 w-notes-container">
                <div className="flex-grow ">
                  {/* <ZoneNotes curZone={curZone} curRichText={curRichText} /> */}
                  <ZoneNotes curZone={curZone} onSave={onZoneNoteSave} />
                </div>
                <div className="flex-grow-0 flex-shrink items-end">
                  <SkillTree curGuide={classGuide} />
                </div>
              </div>
              <div className="container flex-shrink-0 flex-grow-0 w-gear-container">
                <ZoneGears curGuide={classGuide} />
                <ZoneGem curGuide={classGuide} />
              </div>
            </div>
          </div>
        </RichTextContext.Provider>
      </PlayerContext.Provider>
    </CurActContext.Provider>
  )
}

window.poe_interfaceAPI.sendSync("levelingRenderer", "Init").then(e => {
  console.log(e)
  ReactDOM.render(<App Init={e} />, document.getElementById("root"))
})
