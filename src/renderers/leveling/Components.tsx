import React, { ChangeEvent, ChangeEventHandler, useContext, useState, useMemo, useCallback, useEffect } from "react"
import { mdiEye, mdiMinus, mdiPlus } from "@mdi/js"
import Icon from "@mdi/react"

import { CurActContext, PlayerContext } from "./LevelingRenderer"

import ReactTooltip from "react-tooltip"
import { RichNoteEditable, RichNoteText } from "./RichNoteEditable"
import { TextEditable } from "./TextEditable"
import { EditSaveImageButton, EditSaveNoteButton } from "./Buttons"

export function Player(): JSX.Element {
  const curPlayer = useContext(PlayerContext)

  const ascendancy = useMemo(() => {
    console.log("<Player> %o ", curPlayer)

    if (curPlayer.characterClass)
      return curPlayer.characterAscendancy
        ? curPlayer.characterAscendancy.toLowerCase() || ""
        : curPlayer.characterClass.toLowerCase() || ""
    else return null
  }, [curPlayer])

  return (
    <div className="inventory">
      {curPlayer ? (
        <>
          <div className="absolute">
            <div className={`avatar bg-${ascendancy}`}></div>
            <div className="inventory-text top-inventory-line1">{curPlayer.name}</div>
            <div className="inventory-text top-inventory-line2">
              Level {curPlayer.level} {curPlayer.characterClass}
            </div>
          </div>
        </>
      ) : (
        <>
          <p>En attente de connection</p>
        </>
      )}
    </div>
  )
}

export function LevelingGuide(props: {
  curZone: IZone
  Acts: IActsGuide
  onActChange: ChangeEventHandler<any>
  onZoneChange: ChangeEventHandler<any>
}): JSX.Element {
  const { curZone, Acts, onActChange, onZoneChange } = props

  const curAct = useContext(CurActContext)
  const curPlayer = useContext(PlayerContext)

  return (
    <div className="flex flex-row flex-nowrap space-x-2">
      <select className="lvlg-map-feature min-w-min input" value={curAct.actid} onChange={onActChange}>
        {Acts.acts.map((act: IAct) => {
          return (
            <option key={act.actid} value={act.actid}>
              {act.act}
            </option>
          )
        })}
      </select>

      <select className=" lvlg-map-feature flex-grow input" value={curZone.name} onChange={onZoneChange}>
        {curAct.zones.map((zone: IZone) => {
          return (
            <option key={zone.level + "-" + zone.name} value={zone.name}>
              {zone.name}
            </option>
          )
        })}
      </select>

      <div
        className={`lvlg-map-feature align-middle text-center text-1xl font-bold ${curZone.level - curPlayer.level > 2 ? "text-yellow-500 border-yellow-500" : ""}
                ${curZone.level - curPlayer.level > 4 ? "text-red-500 border-red-500" : ""}
                ${curPlayer.level - curZone.level > 5 ? "disabled" : ""}`}        >
        {curZone.level}
      </div>
    </div>
  )
}

export function ZoneNotes(props: { curZone: IZone; onSave: (text: string) => void; readOnly: boolean }): JSX.Element {
  const { onSave, curZone, readOnly } = props

  const [text, settext] = useState(curZone.note)
  const [isOnEdit, setisOnEdit] = useState(false)

  useEffect(() => {
    settext(curZone.note)
  }, [curZone])

  const onSaveText = useCallback(() => {
    setisOnEdit(!isOnEdit)
    console.log("onSaveText:", text)
    onSave(text)
  }, [isOnEdit, text])

  const editNote = useCallback(() => {
    setisOnEdit(!isOnEdit)
  }, [isOnEdit])

  const onChange = useCallback(e => {
    settext(e.target.value)
  }, [])

  console.log("ZoneNote", text)

  return (
    <div className="container flex flex-col min-h-note-container relative">
      {(readOnly) ? null :
        <div className="absolute top-0 left-0 flex flex-row gap-1">
          <EditSaveNoteButton isOnEdit={isOnEdit} onSave={onSaveText} onEdit={editNote} />
        </div>}
      <h2>Notes</h2>
      <div className="absolute top-0 right-0 flex flex-row gap-1">
        {curZone.hasRecipe ? (
          <img className="w-socket h-socket" src="../assets/images/craftingrecipe.png" />
        ) : null}
        {curZone.hastrial ? <img className="w-socket h-socket" src="../assets/images/trial.png" /> : null}
        {curZone.haspassive ? (
          <img className="w-socket h-socket" src="../assets/images/bookofskill.png" />
        ) : null}
        {curZone.hasWaypoint ? (
          <img className="w-socket h-socket" src="../assets/images/waypoint.png" />
        ) : null}
      </div>
      <div className="text-xl flex-grow relative">
        <RichNoteEditable isOnEdit={isOnEdit} onChange={onChange}>
          {text}
        </RichNoteEditable>
      </div>
    </div>
  )
}

export function Navigation(props: {
  curZone: IZone
  readOnly: boolean
  onSave: (text: string) => void
}): JSX.Element {
  const { curZone, readOnly, onSave } = props
  console.log("ZoneMap", curZone)

  const [text, settext] = useState(curZone.note)
  const [isOnEdit, setisOnEdit] = useState(false)


  useEffect(() => {
    settext(curZone.altimage)
  }, [curZone])

  const onSaveText = useCallback(() => {
    setisOnEdit(!isOnEdit)
    console.log("onSaveText:", text)
    onSave(text)
  }, [isOnEdit, text])

  const editNote = useCallback(() => {
    setisOnEdit(!isOnEdit)
  }, [isOnEdit])

  const onChange = useCallback(e => {
    settext(e.target.value)
  }, [])

  return (
    <div className=" min-h-map-container h-full relative">
      <div className="ml-7 flex flex-col items-stretch">
        <div className="p-0 flex flex-row flex-wrap h-full ">
          {curZone.image && curZone.image[0] !== "none"
            ? curZone.image.map(val => {
              const path = `${val}`
              return <img key={path} className="w-32" src={path} />
            })
            : null}
        </div>
        {curZone.altimage !== "none" ? (
          <div className=" justify-end text-lg align-baseline ">
            <RichNoteEditable isOnEdit={isOnEdit} onChange={onChange}>{text}</RichNoteEditable>
          </div>

        ) : null}
      </div>
      {(readOnly) ? null :
        <div className="absolute top-0 left-0 flex flex-row gap-1">
          <EditSaveNoteButton isOnEdit={isOnEdit} onSave={onSaveText} onEdit={editNote} />
        </div>}
    </div>
  )
}

export function SkillTree(props: { curGuide: IClassesGuide, onClassGuideSkilltreeChange: () => void }): JSX.Element {
  const { curGuide, onClassGuideSkilltreeChange } = props
  const curAct = useContext(CurActContext)


  return (
    <div className="relative">
      {(curGuide.acts && curGuide.acts.find(a => a.act === curAct.actid)) ? <img src={curGuide.acts.find(a => a.act === curAct.actid).treeimage} /> : null}
      {(curGuide.identity.readonly) ? null :
        <div className="absolute p-0 top-0 left-0">
          <EditSaveImageButton onClick={onClassGuideSkilltreeChange} />
        </div>}
    </div>
  )

}

export function ZoneGem(props: { curGuide: IClassesGuide }): JSX.Element {
  const curGuide = props.curGuide

  const curPlayer = useContext(PlayerContext) as IAppPlayer
  const curAct = useContext(CurActContext) as IAct

  const [lvlRange, setlvlRange] = useState(6)
  const [showAll, setshowAll] = useState(false)

  const gems = useMemo(() => {
    const _gems = [] as IAppGems[]

    if (curGuide && curGuide.acts) {
      curGuide.acts
        .filter(act => act.act == curAct.actid || showAll)
        .map(act =>
          act.gears.map(gear =>
            gear.gems.map(_gem => {
              if (
                !_gems.includes(_gem) &&
                (Math.abs(_gem.required_lvl - curPlayer.level) < lvlRange || showAll)
              ) {
                _gems.push(_gem)
              }
            })
          )
        )
      _gems.sort((a, b) => a.required_lvl - b.required_lvl)
    }

    return _gems
  }, [curAct, curGuide, showAll, curPlayer, lvlRange])

  const inverseShowAll = useCallback(() => {
    setshowAll(!showAll)
  }, [showAll])

  const LvlRangePlus = useCallback(() => {
    setlvlRange(lvlRange + 1)
  }, [lvlRange])

  const LvlRangeMoins = useCallback(() => {
    setlvlRange(lvlRange - 1)
  }, [lvlRange])

  if (curGuide && curGuide.acts) {
    return (
      <div className="relative">
        <h2>Liste des courses</h2>
        <div className="flex flex-row gap-1 absolute top-1 right-1 ">
          <span className="iconInput" onClick={LvlRangePlus}>
            <Icon path={mdiPlus} size={1} title="Afficher tout / filtré par lvl et act" />
          </span>
          <span className="iconInput">{lvlRange}</span>
          <span className="iconInput" onClick={LvlRangeMoins}>
            <Icon path={mdiMinus} size={1} title="Afficher tout / filtré par lvl et act" />
          </span>
          <span className="iconInput" onClick={inverseShowAll}>
            <Icon path={mdiEye} size={1} title="Afficher tout / filtré par lvl et act" />
          </span>
        </div>
        <div className="overflow-y-auto h-80 max-h-80">
          {gems.map(_gem => {
            return <LongGem key={_gem.name} gem={_gem} />
          })}
        </div>
      </div>
    )
  }

  return <h2>Liste des courses vide</h2>
}

export function LongGem(props: { gem: IGems }): JSX.Element {
  const curGem = props.gem

  const curPlayer = useContext(PlayerContext) as IAppPlayer
  const curAct = useContext(CurActContext) as IAct

  const curBuy = useMemo(() => {
    let _buy = [] as IBuy[]

    _buy = curGem.buy.filter(buy => {
      return buy.available_to.includes(curPlayer.characterClass) && buy.act === curAct.actid
    })
    if (_buy.length === 0)
      _buy = curGem.buy.filter(buy => {
        return buy.available_to.includes(curPlayer.characterClass)
      })

    //make sure "A Fixture of Fate" never be first if a quest alternative
    _buy = _buy.sort((a, b) => {
      if (a.quest_name === "A Fixture of Fate") return -1
      if (a.act === b.act) return -1
      return 0
    })

    return _buy
  }, [curAct, curPlayer])

  if (curGem) {
    return (
      <div className="grid grid-cols-12 gap-1 items-center justify-center flex-grow">
        <span>lvl: {curGem.required_lvl}&nbsp;</span>
        <Gem curGem={curGem} />
        <span className="col-span-3">{curGem.name}</span>
        <div className="col-span-7 flex flex-col">
          {curBuy.length > 0 ? (
            curBuy.map((_buy, index) => {
              return (
                <p key={curGem.name + index}>
                  <GemSpan key={curGem.name + _buy.npc + index} text={_buy.npc} classColor={"text-poe-3"} />
                  &nbsp;
                  <GemSpan
                    key={curGem.name + _buy.quest_name + index}
                    text={_buy.quest_name}
                    classColor={"text-poe-60"}
                  />
                  &nbsp;
                  <span className="text-poe-3">{_buy.town}</span>
                </p>
              )
            })
          ) : (
            <p>
              <span className="text-poe-60">Ask a friend.</span>
            </p>
          )}
        </div>
      </div>
      // <div className="flex flex-grow-0 order-b-2 border-poe-96 w-6/12" />
    )
  }

  return <div>Pas de gemme.</div>
}

export function Gem(props: { curGem: IGems }): JSX.Element {
  const curGem = props.curGem

  const gemClick = useCallback((e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.preventDefault()
    window.poe_interfaceAPI.openExternal("https://www.poewiki.net/wiki/" + curGem.name)
  }, [])

  return (
    <div
      data-for={`gem` + curGem.name}
      data-tip={`gem` + curGem.name}
      data-effect="solid"
      data-place="left"
      data-delay-hide="1000"
    >
      {" "}
      <ReactTooltip key={curGem.name} />
      <img
        data-tip={curGem.name}
        onClick={gemClick}
        className="w-socket h-socket cursor-pointer"
        src={"../assets/images/gems/" + curGem.name.replace(" ", "_") + ".png"}
      />
    </div>
  )
}

function GemSpan(props: { text: string; classColor: string }): JSX.Element {
  const text = props.text
  const classColor = props.classColor

  const onClick = useCallback(() => window.poe_interfaceAPI.openWiki(text), [])

  return (
    <span className={`${classColor} cursor-pointer`} onClick={onClick}>
      {text}
    </span>
  )
}

export function ZoneGears(props: { curGuide: IClassesGuide }): JSX.Element {
  const curAct = useContext(CurActContext)

  const curGuide = props.curGuide

  console.log("zonegear: ", curGuide)

  // const SendReload = useCallback(() => {
  //   window.poe_interfaceAPI.sendSync("guide", "reload").then(e => {
  //     setcurGuide(e)
  //   })
  // }, [])

  const curGearsAct = useMemo(() => {
    if (curGuide && curGuide.acts) return curGuide.acts.find(act => act.act === curAct.actid)
    else return {} as IGuideAct
  }, [curAct, curGuide])

  console.log("curGearsAct: ", curGearsAct)

  return (
    <div className="relative flex flex-col mb-2">
      <h2>Gears</h2>
      {/* <span className="absolute top-1 right-1 cursor-pointer" onClick={SendReload}>
        <Icon path={mdiReload} size={1} title="Recharger tous les jsons" />
      </span> */}
      {curGearsAct && curGearsAct.gears ? (
        <div>
          {curGearsAct.notes ? <RichNoteText>{curGearsAct.notes}</RichNoteText> : null}

          <div className="flex flex-row flex-wrap gap-2 items-start">
            {curGearsAct.gears.map((gear, index) => {
              return (
                <div key={gear.name + index} className="max-w-xs">
                  <Gear gear={gear} />
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Gear(props: { gear: Gear }): JSX.Element {
  const gear = props.gear

  //console.log(gear)

  return (
    <div className="border-2 border-poe-99 rounded-lg p-2">
      <p>{gear.name}</p>
      <div className="flex flex-row gap-2 ">
        <div
          className={`${(gear.gems ? gear.gems.length : 0) + (gear.chasses ? gear.chasses.length : 0) <= 3
            ? "poe-item-3slots"
            : "poe-item-xslots"
            } flex-none`}
        >
          {gear.gems ? gear.gems.map((gem, index) => <Gem key={gem.name + index} curGem={gem} />) : null}
          {gear.chasses
            ? gear.chasses.map((color, index) => (
              <div className={`poe-${color}-socket`} key={color + index}></div>
            ))
            : null}
        </div>
        {gear.notes ? (
          <div className="flex-grow">
            <RichNoteText>{gear.notes}</RichNoteText>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function ActGuideIdentity(props: {
  identity: ActGuideIdentity, onSave: (identity: ActGuideIdentity) => void, children: string
}): JSX.Element {
  const { onSave, identity, children } = props

  const [idName, setidName] = useState(identity.name)
  const [idLang, setidlang] = useState(identity.lang)

  const [idGameVersion, setidGameVersion] = useState(identity.game_version)
  const [isOnEdit, setisOnEdit] = useState(false)

  useEffect(() => {
    setidName(identity.name)
    setidGameVersion(identity.game_version)
    setidlang(identity.lang)
  }, [identity])

  const onSaveIdentity = useCallback(() => {
    setisOnEdit(!isOnEdit)
    identity.name = idName
    identity.lang = idLang
    identity.game_version = idGameVersion
    onSave(identity)
  }, [isOnEdit, idName, idLang, idGameVersion])

  const editNote = useCallback(() => {
    setisOnEdit(!isOnEdit)
  }, [isOnEdit])

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    switch (e.target.name) {
      case "name":
        if (e.target.value.search(/^[a-z|A-Z|0-9|_]*$/gm) !== -1)
          setidName(e.target.value)
        break
      case "game_version":
        // eslint-disable-next-line no-case-declarations
        const ver = Number(e.target.value)
        if (ver) setidGameVersion(ver)
        break
      case "lang":
        setidlang(e.target.value)
        break
    }
  }, [idGameVersion, idLang, idName])

  return (
    <div className="flex flex-row gap-1 w-full">
      <div className="flex-grow-0 w-24">
        <h3>{children}</h3>
      </div>
      <div className="flex-auto">
        <TextEditable isOnEdit={isOnEdit} onChange={onChange} name="name" value={idName} />
      </div>
      <div className="w-10">
        <TextEditable isOnEdit={isOnEdit} onChange={onChange} name="game_version" value={idGameVersion.toString()} />
      </div>
      <div className="w-6">
        <TextEditable isOnEdit={isOnEdit} onChange={onChange} name="lang" value={idLang} />
      </div>
      {(identity.readonly) ? null :
        <div className="w-6">
          <EditSaveNoteButton isOnEdit={isOnEdit} onSave={onSaveIdentity} onEdit={editNote} />
        </div>}
    </div>
  )
}

export function ClassGuideIdentity(props: {
  identity: ClassGuideIdentity, onSave: (identity: ClassGuideIdentity) => void, children: string, playerClasses: IPlayerClasses[]
}): JSX.Element {
  const { onSave, identity, children, playerClasses } = props

  const [idName, setidName] = useState(identity.name)
  const [idLang, setidlang] = useState(identity.lang)
  const [idClass, setidclass] = useState(identity.class)
  const [idUrl, setidurl] = useState(identity.url)

  const [idGameVersion, setidGameVersion] = useState(identity.game_version)
  const [isOnEdit, setisOnEdit] = useState(false)

  useEffect(() => {
    setidName(identity.name)
    setidGameVersion(identity.game_version)
    setidlang(identity.lang)
    setidclass(identity.class)
    setidurl(identity.url)
  }, [identity])

  const onSaveIdentity = useCallback(() => {
    setisOnEdit(!isOnEdit)
    identity.name = idName
    identity.lang = idLang
    identity.game_version = idGameVersion
    identity.class = idClass
    identity.url = idUrl
    onSave(identity)
  }, [isOnEdit, idName, idLang, idGameVersion, idClass])

  const editNote = useCallback(() => {
    setisOnEdit(!isOnEdit)
  }, [isOnEdit])

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    switch (e.target.name) {
      case "name":
        if (e.target.value.search(/^[a-z|A-Z|0-9|_]*$/gm) !== -1)
          setidName(e.target.value)
        break
      case "game_version":
        // eslint-disable-next-line no-case-declarations
        const ver = Number(e.target.value)
        if (ver) setidGameVersion(ver)
        break
      case "lang":
        setidlang(e.target.value)
        break
      case "class":
        console.log(e)
        setidclass(e.target.value)
        break
    }
  }, [idGameVersion, idLang, idName])

  return (
    <div className="flex flex-col gap-1 w-full overflow-hidden">
      <div className="flex flex-row gap-1 w-full">
        <div className="flex-grow-0 flex-shrink w-24">
          <h3>{children}</h3>
        </div>
        <div className="flex-auto">
          <TextEditable isOnEdit={isOnEdit} onChange={onChange} name="name" value={idName} />
        </div>
        <div className="flex-auto">
          <TextEditable isOnEdit={isOnEdit} onChange={onChange} name="class" value={idClass}>{playerClasses}</TextEditable>
        </div>
        <div className="w-10">
          <TextEditable isOnEdit={isOnEdit} onChange={onChange} name="game_version" value={idGameVersion.toString()} />
        </div>
        <div className="w-6">
          <TextEditable isOnEdit={isOnEdit} onChange={onChange} name="lang" value={idLang} />
        </div>
        {(identity.readonly) ? null :
          <div className="w-6">
            <EditSaveNoteButton isOnEdit={isOnEdit} onSave={onSaveIdentity} onEdit={editNote} />
          </div>}
      </div>
      <div className="flex-auto w-full overflow-hidden">
        <TextEditable isOnEdit={isOnEdit} onChange={onChange} name="url" value={idUrl} />
      </div>
    </div>
  )
}