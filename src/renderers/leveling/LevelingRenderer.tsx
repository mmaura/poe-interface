import React, { useState, useEffect, useCallback, useLayoutEffect, useMemo } from "react"
import * as ReactDOM from "react-dom"

import "../index.css"
import "./index.css"
import {
  PlayerInfo,
  ZoneSelector,
  ZoneNotes,
  NavigationMap,
  SkillTree,
  GemBuyList,
  ActGuideIdentity,
  ClassGuideIdentity,
} from "./Components"
import { GemUTility, ZoneGears } from "./Gears"

export const PlayerContext = React.createContext({} as IAppPlayer)
export const CurActContext = React.createContext({} as IActsGuideAct)
export const RichTextContext = React.createContext({} as IRichText[])

function App(props: { Init: any }) {
  const [actsGuide, setactsGuide] = useState(props.Init[1] as IActsGuide)
  const [curRichText, setcurRichText] = useState(props.Init[2] as IRichText[])
  const [classGuide, setclassGuide] = useState(props.Init[3] as IClassesGuide)
  const [curPlayer, setcurPlayer] = useState(props.Init[4] as IAppPlayer)
  const [curActID, setcurActID] = useState(props.Init[5] as number)
  const [curZoneName, setcurZoneName] = useState(props.Init[6] as string)
  const [playerClasses, setplayerClasses] = useState(props.Init[7] as IClassesAscendancies[])
  const GemsSkel = props.Init[8] as IGemList[]

  const [ClassGuideIsOnEdit, setClassGuideIsOnEdit] = useState(false)
  const [ActGuideIsOnEdit, setActGuideIsOnEdit] = useState(false)

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
      if (!_zone) {
        setcurZoneName(curAct.zones[0].name)
        return curAct.zones[0]
      }
      console.log("return : ", _zone)
      return _zone
    } else {
      console.log(`return: null (defaulting) ${curAct} `)
      return curAct.zones[0]
    }
  }, [curZoneName, curAct, actsGuide])

  /**********************************
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

  /**********************************
   * ActGuide Save Functions
   */
  const onZoneNoteSave = useCallback(
    (text: string) => {
      window.poe_interface_API.sendSync("levelingRenderer", "saveActGuide", "zoneNote", curActID, curZoneName, text)
    },
    [curZoneName, curActID]
  )

  const onNavigationNoteSave = useCallback(
    (text: string) => {
      window.poe_interface_API.sendSync("levelingRenderer", "saveActGuide", "navigationNote", curActID, curZoneName, text)
    },
    [curZoneName, curActID]
  )

  const onActGuideIdentitySave = useCallback((identity: GuidesIdentity) => {
    window.poe_interface_API.sendSync("levelingRenderer", "saveActGuide", "identity", identity)
  }, [])

  /**********************************
   * ClassGuide Save Functions
   */
  const onClassGuideSkilltreeChange = useCallback(() => {
    window.poe_interface_API.sendSync("levelingRenderer", "saveClassGuide", "skilltree", curActID)
  }, [curActID])

  const onClassGuideIdentitySave = useCallback((identity: GuidesIdentity) => {
    window.poe_interface_API.sendSync("levelingRenderer", "saveClassGuide", "identity", identity)
  }, [])

  const onClassGuideEditChange = useCallback((isOnEdit: boolean) => {
    setClassGuideIsOnEdit(isOnEdit)
  }, [])
  const onActsGuideEditChange = useCallback((isOnEdit: boolean) => {
    setActGuideIsOnEdit(isOnEdit)
  }, [])

  /**********************************
   * IPC Receiver
   */
  useLayoutEffect(() => {
    window.poe_interface_API.receive("levelingRenderer", (e, arg) => {
      console.log("=> Receive levelingRenderer :", arg)
      switch (arg[0]) {
        case "player":
          setcurPlayer(arg[1])
          break
        case "playerArea":
          setcurPlayer(arg[1])
          break
        case "ClassGuide":
          switch (arg[1]) {
            case "GuideContentChanged":
              setclassGuide(arg[2])
              break
            case "GuideIdentityChanged":
              setclassGuide(arg[2])
              break
            case "ChangeSelectedGuided":
              setclassGuide(arg[2])
              setcurActID(1)
              break
          }
          break
        case "actsGuide":
          switch (arg[1]) {
            case "GuideContentChanged":
              setactsGuide(arg[2])
              break
            case "GuideIdentityChanged":
              setactsGuide(arg[2])
              break
            case "ChangeSelectedGuided":
              setactsGuide(arg[2])
              setcurActID(1)
              break
          }
          break
        case "All":
          setactsGuide(arg[1])
          setcurRichText(arg[2])
          setclassGuide(arg[3])
          setplayerClasses(arg[4])
          break
      }
    })
    return () => {
      window.poe_interface_API.cleanup("levelingRenderer")
    }
  }, [])
  /**********************************
   * Effects
   */
  useEffect(() => {
    console.log("**UseEffect [CurPlayer]")
    if (curActID !== curPlayer.currentZoneAct) {
      setcurActID(curPlayer.currentZoneAct)
      console.log(`setcurActID: ${curAct} ${curPlayer.currentZoneAct}`)

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

  return (
    <CurActContext.Provider value={curAct}>
      <PlayerContext.Provider value={curPlayer}>
        <RichTextContext.Provider value={curRichText}>
          <div className="p-2 h-full w-full">
            <div className="flex flex-row flex-nowrap pb-2 items-center h-full ">
              <div className="flex-grow-0">
                <PlayerInfo />
                <h1>{`${curAct.act} : ${curZone.name}`}</h1>
              </div>
              <div className="flex-grow h-full">
                <NavigationMap curZone={curZone} onSave={onNavigationNoteSave} ActsGuideIsOnEdit={ActGuideIsOnEdit} />
              </div>
              <div className="flex-grow-0 h-full guide-container px-1">
                {!ClassGuideIsOnEdit && (
                  <ActGuideIdentity
                    identity={actsGuide.identity}
                    onSave={onActGuideIdentitySave}
                    onActsGuideEditChange={onActsGuideEditChange}>
                    Acts
                  </ActGuideIdentity>
                )}
                {!ActGuideIsOnEdit && (
                  <ClassGuideIdentity
                    identity={classGuide.identity}
                    onSave={onClassGuideIdentitySave}
                    onClassGuideEditChange={onClassGuideEditChange}
                    playerClasses={playerClasses}>
                    Ascendancy
                  </ClassGuideIdentity>
                )}
                <ZoneSelector onActChange={onActChange} onZoneChange={onZoneChange} Acts={actsGuide} curZone={curZone} />
              </div>
            </div>

            {!ClassGuideIsOnEdit && (
              <div className="flex flex-row gap-2 ici">
                <div className="flex flex-grow flex-shrink flex-col gap-2 w-notes-container">
                  <div className="flex-grow-0 flex-shrink-0 ">
                    <ZoneNotes curZone={curZone} onSave={onZoneNoteSave} ActsGuideIsOnEdit={ActGuideIsOnEdit} />
                  </div>
                  <div className="flex-grow flex-shrink items-end">
                    <SkillTree
                      curGuide={classGuide}
                      onClassGuideSkilltreeChange={onClassGuideSkilltreeChange}
                      ClassGuideIsOnEdit={ClassGuideIsOnEdit}
                    />
                  </div>
                </div>
                <div className="p-0 m-0 flex-shrink-0 flex-grow-0 w-gear-container">
                  <ZoneGears curGuide={classGuide} ClassGuideIsOnEdit={ClassGuideIsOnEdit} gemsSkel={GemsSkel} />
                  <GemBuyList curGuide={classGuide} />
                </div>
              </div>
            )}

            {ClassGuideIsOnEdit && (
              <div className="flex flex-row flex-grow gap-2">
                <div className="p-0 m-0 flex-shrink-0 flex-grow w-full">
                  <ZoneGears curGuide={classGuide} ClassGuideIsOnEdit={ClassGuideIsOnEdit} gemsSkel={GemsSkel} />
                </div>
              </div>
            )}
          </div>
        </RichTextContext.Provider>
      </PlayerContext.Provider>
    </CurActContext.Provider>
  )
}

window.poe_interface_API.sendSync("levelingRenderer", "Init").then(e => {
  console.log(e)
  ReactDOM.render(<App Init={e} />, document.getElementById("root"))
})
