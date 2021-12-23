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
  Loading,
} from "./Components"
import { GemSelectorUTility, ZoneGears } from "./Gears"

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
  const [poeLogLoaded, setpoeLogLoaded] = useState(props.Init[9])

  const [ClassGuideIsOnEdit, setClassGuideIsOnEdit] = useState(false)
  const [ActGuideIsOnEdit, setActGuideIsOnEdit] = useState(false)

  const [curSocketEdited, setSocketEdited] = useState({ actId: 0, gearName: "", gemIndex: 0 } as GearSocketRef)
  const [selectedGemName, setselectedGemName] = useState("")

  const curAct = useMemo(() => {
    console.log("**useMemo curAct", curActID)
    const _act = actsGuide.acts.find(e => e.actId === curActID)
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
      console.log("useMemo return : ", _zone)
      return _zone
    } else {
      console.log(`return: null (defaulting) ${curAct} `)
      return curAct.zones[0]
    }
  }, [curZoneName, curAct, actsGuide])

  const changeToPlayerArea = useCallback(() => {
    console.log("**Callback [changeToPlayerArea]")
    if (curActID !== curPlayer.currentZoneAct) {
      setcurActID(curPlayer.currentZoneAct)
      console.log(`setcurActID: ${curAct} ${curPlayer.currentZoneAct}`)

      const _act = actsGuide.acts.find(act => act.actId === curPlayer.currentZoneAct)
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
  }, [curPlayer, actsGuide])

  // const prevZone = useCallback(() => {
  //   const index = curAct.zones.findIndex(z => z.name === curZoneName)
  //   console.log("zonename: %s, index: %s", curZoneName, index)
  //   if (index <= 0) {
  //     if (curActID > 1) {
  //       const prevAct = actsGuide.acts.find(a => a.actid === curActID - 1)
  //       setcurActID(prevAct.actid)
  //       setcurZoneName(prevAct.zones[prevAct.zones.length - 1].name)
  //     }
  //   }
  //   setcurZoneName(curAct.zones[index].name)
  // }, [curAct, curActID, curZoneName, actsGuide])

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
  const onActsGuideEditChange = useCallback((isOnEdit: boolean) => {
    setActGuideIsOnEdit(isOnEdit)
  }, [])

  const ActGuide_SaveIdentity = useCallback((identity: GuidesIdentity) => {
    window.poe_interface_API.sendSync("levelingRenderer", "saveActGuide", "identity", identity)
  }, [])

  const ActGuide_SaveZoneNote = useCallback(
    (text: string) => {
      window.poe_interface_API.sendSync("levelingRenderer", "saveActGuide", "zoneNote", curActID, curZoneName, text)
    },
    [curZoneName, curActID]
  )

  const ActGuide_SaveNavigationNote = useCallback(
    (text: string) => {
      window.poe_interface_API.sendSync("levelingRenderer", "saveActGuide", "navigationNote", curActID, curZoneName, text)
    },
    [curZoneName, curActID]
  )

  /**********************************
   * ClassGuide Save Functions
   */
  const onClassGuideEditChange = useCallback((isOnEdit: boolean) => {
    setClassGuideIsOnEdit(isOnEdit)
  }, [])

  const ClassGuide_SaveIdentity = useCallback((identity: GuidesIdentity) => {
    window.poe_interface_API.sendSync("levelingRenderer", "saveClassGuide", "identity", identity)
  }, [])

  const ClassGuide_ShowChooseSkilltree = useCallback(() => {
    window.poe_interface_API.sendSync("levelingRenderer", "saveClassGuide", "skilltree", curActID)
  }, [curActID])

  const ClassGuide_SaveGearNote = useCallback((actId: number, actNotes: string) => {
    window.poe_interface_API.sendSync("levelingRenderer", "saveClassGuide", "ActNotes", actId, actNotes)
  }, [])

  const ClassGuide_AddGearGroup = useCallback(() => {
    window.poe_interface_API.sendSync("levelingRenderer", "saveClassGuide", "addGear", curActID)
  }, [curActID])

  const ClassGuide_DeleteGearSocket = useCallback(
    (actId: number, gearName: string, index: number, e: React.SyntheticEvent<HTMLImageElement>) => {
      e.preventDefault()
      window.poe_interface_API.sendSync("levelingRenderer", "saveClassGuide", "delGearGem", {
        actId: actId,
        gearName: gearName,
        gemIndex: index,
      })
    },
    []
  )

  const ClassGuide_CopyToNextAct = useCallback((actId: number) => {
    window.poe_interface_API.sendSync("levelingRenderer", "saveClassGuide", "copyToNextAct", actId)
  }, [])

  const ClassGuide_SetGearSocket = useCallback(
    (e: React.SyntheticEvent<HTMLDivElement>, newGearName: string) => {
      e.preventDefault()
      window.poe_interface_API.sendSync("levelingRenderer", "saveClassGuide", "setGearGem", curSocketEdited, newGearName)
    },
    [curSocketEdited]
  )

  const onGearSocketSelected = useCallback(
    (actId: number, gearName: string, gemName: string, index: number, e: React.SyntheticEvent<HTMLImageElement>) => {
      e.preventDefault()
      if (ClassGuideIsOnEdit) {
        setselectedGemName(gemName)
        setSocketEdited({ actId: actId, gearName: gearName, gemIndex: index } as GearSocketRef)
      } else window.poe_interface_API.openExternal("https://www.poewiki.net/wiki/" + gemName)
    },
    [ClassGuideIsOnEdit]
  )

  /**********************************
   * IPC Receiver
   */
  useLayoutEffect(() => {
    window.poe_interface_API.receive("levelingRenderer", (e, arg) => {
      console.log("=> Receive levelingRenderer :", arg)
      switch (arg[0]) {
        case "poeParseComplete":
          setcurPlayer(arg[1])
          setpoeLogLoaded(true)
          changeToPlayerArea()
          break
        case "playerLevelUp":
          setcurPlayer(arg[1])
          break
        case "playerAreaChange":
          setcurPlayer(arg[1])
          changeToPlayerArea()
          break
        case "ClassGuide":
          switch (arg[1]) {
            case "GuideContentChanged":
              setclassGuide(arg[2])
              break
            case "GuideIdentityChanged":
              setclassGuide(arg[2])
              break
            case "ChangeSelectedGuide":
              setclassGuide(arg[2])
              setcurActID(1)
              break
          }
          break
        case "ActsGuide":
          switch (arg[1]) {
            case "GuideContentChanged":
              setactsGuide(arg[2])
              break
            case "GuideIdentityChanged":
              setactsGuide(arg[2])
              break
            case "ChangeSelectedGuide":
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
        // case "changeZone":
        //   switch (arg[1]) {
        //     case "prevZone":
        //       prevZone()
        //       break
        //     // case "nextZone":
        //     //   nextZone()
        //     //   break
        //     // case "prevAct":
        //     //   prevAct()
        //     //   break
        //     // case "nextAct":
        //     //   nextAct()
        //     //   break
        //   }
        //   break
      }
    })
    return () => {
      window.poe_interface_API.cleanup("levelingRenderer")
    }
  }, [])
  /**********************************
   * Effects
   */
  // const changeArea = useMemo(() => {
  //   console.log("**UseEffect [CurPlayer]")
  //   if (curActID !== curPlayer.currentZoneAct) {
  //     setcurActID(curPlayer.currentZoneAct)
  //     console.log(`setcurActID: ${curAct} ${curPlayer.currentZoneAct}`)

  //     const _act = actsGuide.acts.find(act => act.actid === curPlayer.currentZoneAct)
  //     if (_act) {
  //       const _zone = _act.zones.find(e => e.name === curPlayer.currentZoneName)
  //       if (!_zone) {
  //         console.log("setcurZoneName: ", curAct.zones[0].name)
  //         setcurZoneName(curAct.zones[0].name)
  //       } else {
  //         console.log("setcurZoneName: ", curPlayer.currentZoneName)
  //         setcurZoneName(curPlayer.currentZoneName)
  //       }
  //     }
  //   } else {
  //     const _zone = curAct.zones.find(e => e.name === curPlayer.currentZoneName)
  //     if (_zone) {
  //       console.log("setcurZoneName: ", curPlayer.currentZoneName)
  //       setcurZoneName(curPlayer.currentZoneName)
  //     }
  //   }
  // }, [curPlayer, actsGuide])

  return (
    <CurActContext.Provider value={curAct}>
      <PlayerContext.Provider value={curPlayer}>
        <RichTextContext.Provider value={curRichText}>
          <div className="p-2 max-h-screen h-screen w-screen overflow-hidden">
            <div className="flex flex-row flex-nowrap pb-2 items-center">
              <div className="flex-grow-0">
                <PlayerInfo />
                <h1>{`${curAct.actName} : ${curZone.name}`}</h1>
              </div>
              <div className="flex-grow h-full">
                {poeLogLoaded ? (
                  <NavigationMap curZone={curZone} onSave={ActGuide_SaveNavigationNote} ActsGuideIsOnEdit={ActGuideIsOnEdit} />
                ) : (
                  <Loading />
                )}
              </div>
              <div className="flex-grow-0 h-full guide-container px-1">
                {!ClassGuideIsOnEdit && (
                  <ActGuideIdentity actGuide={actsGuide} onSave={ActGuide_SaveIdentity} onActsGuideEditChange={onActsGuideEditChange}>
                    Acts
                  </ActGuideIdentity>
                )}
                {!ActGuideIsOnEdit && (
                  <ClassGuideIdentity
                    identity={classGuide.identity}
                    onSave={ClassGuide_SaveIdentity}
                    onClassGuideEditChange={onClassGuideEditChange}
                    playerClasses={playerClasses}>
                    Ascendancy
                  </ClassGuideIdentity>
                )}
                <ZoneSelector onActChange={onActChange} onZoneChange={onZoneChange} Acts={actsGuide} curZone={curZone} />
              </div>
            </div>

            {!ClassGuideIsOnEdit && (
              <div className="flex flex-row gap-2">
                <div className="flex flex-grow flex-shrink flex-col gap-2 w-notes-container">
                  <div className="flex-grow-0 flex-shrink-0 ">
                    <ZoneNotes curZone={curZone} onSave={ActGuide_SaveZoneNote} ActsGuideIsOnEdit={ActGuideIsOnEdit} />
                  </div>
                  <div className="flex-grow flex-shrink items-end">
                    <SkillTree
                      curGuide={classGuide}
                      onClassGuideSkilltreeChange={ClassGuide_ShowChooseSkilltree}
                      ClassGuideIsOnEdit={ClassGuideIsOnEdit}
                    />
                  </div>
                </div>
                <div className="p-0 m-0 flex flex-col flex-grow gap-2 w-[700px]">
                  <div className="container flex-shrink-0 flex-grow-0  max-h-full">
                    <ZoneGears
                      curGuide={classGuide}
                      ClassGuideIsOnEdit={ClassGuideIsOnEdit}
                      onGearSocketSelected={onGearSocketSelected}
                      curSocketEdited={curSocketEdited}
                    />
                  </div>
                  <div className="flex flex-col flex-grow gap-2">
                    <GemBuyList curGuide={classGuide} />
                  </div>
                </div>
              </div>
            )}

            {ClassGuideIsOnEdit && (
              <div className="p-0 m-0 flex flex-row flex-grow gap-2 w-full">
                <div className="container relative flex flex-row mb-2 w-gear-container-onedit">
                  <ZoneGears
                    curGuide={classGuide}
                    onGearSocketSelected={onGearSocketSelected}
                    ClassGuideIsOnEdit={ClassGuideIsOnEdit}
                    ClassGuide_SaveGearNote={ClassGuide_SaveGearNote}
                    ClassGuide_AddGearSocket={ClassGuide_AddGearGroup}
                    ClassGuide_DeleteGearSocket={ClassGuide_DeleteGearSocket}
                    ClassGuide_CopyToNextAct={ClassGuide_CopyToNextAct}
                    curSocketEdited={curSocketEdited}
                  />
                </div>
                <div className="flex flex-col flex-grow gap-2">
                  <div className="container relative max-h-gem-list h-gem-list">
                    <GemSelectorUTility
                      selectNewGem={ClassGuide_SetGearSocket}
                      // curGemEdit={curSocketEdited}
                      gemsSkel={GemsSkel}
                      selectedGemName={selectedGemName}
                      key={"gem_utility"}
                    />
                  </div>

                  <div className="container h-full max-h-full pb-6 flex-grow flex-shrink overflow-hidden">
                    <SkillTree
                      curGuide={classGuide}
                      onClassGuideSkilltreeChange={ClassGuide_ShowChooseSkilltree}
                      ClassGuideIsOnEdit={ClassGuideIsOnEdit}
                    />
                  </div>
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
  ReactDOM.render(<App Init={e} />, document.getElementById("root"))
})
