import React, { ChangeEventHandler, useContext, useState, useMemo, useCallback } from "react"

// import { GetAllActs } from "../modules/functions"
import { ActContext, PlayerContext } from "./LevelingRenderer"

import ReactTooltip from "react-tooltip"
import Icon from "@mdi/react"
import { mdiEye, mdiMinus, mdiPlus, mdiReload } from "@mdi/js"

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
  Acts: IActs[]
  onActChange: ChangeEventHandler<any>
  onZoneChange: ChangeEventHandler<any>
}): JSX.Element {
  const { curZone, onActChange, onZoneChange } = props

  const Acts = props.Acts
  const curAct = useContext(ActContext)
  const curPlayer = useContext(PlayerContext)

  return (
    <div className="w-96">
      <div className="flex flex-row flex-nowrap px-5 py-2 space-x-2">
        <select className="lvlg-map-feature min-w-min" value={curAct.actid} onChange={onActChange}>
          {Acts.map(function (act: IActs) {
            return (
              <option key={act.actid} value={act.actid}>
                {act.act}
              </option>
            )
          })}
        </select>

        <select className="lvlg-map-feature flex-grow" value={curZone.name} onChange={onZoneChange}>
          {curAct.zones.map(function (zone: IZone) {
            return (
              <option key={zone.level + "-" + zone.name} value={zone.name}>
                {zone.name}
              </option>
            )
          })}
        </select>

        <div
          className={`lvlg-map-feature enabled text-center align-middle text-4xl  font-bold 
                ${curZone.level - curPlayer.level > 2 ? "text-yellow-500 border-yellow-500" : ""}
                ${curZone.level - curPlayer.level > 4 ? "text-red-500 border-red-500" : ""}
                ${curPlayer.level - curZone.level > 5 ? "disabled" : ""}`}
        >
          {curZone.level}
        </div>
      </div>
    </div>
  )
}

export function ZoneNotes(props: { curRichText: IRichText[]; curZone: IZone }): JSX.Element {
  const curZone = props.curZone
  const curRichText = props.curRichText

  console.log("ZoneNote", curZone)

  return (
    <div className="container flex flex-col min-h-note-container relative">
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
      <div className="text-xl">
        {curZone.note ? <RichText curRichText={curRichText} text={curZone.note} /> : null}
      </div>
    </div>
  )
}

export function ZoneMap(props: { curAct: IActs; curZone: IZone }): JSX.Element {
  const curZone = props.curZone
  const curAct = props.curAct

  console.log("ZoneMap", curZone)

  return (
    <div className="container flex flex-col min-h-map-container h-full">
      <div className="flex flex-row flex-wrap h-full">
        {curZone.image && curZone.image[0] !== "none"
          ? curZone.image.map((val) => {
              const path = "../assets/images/zones/" + curAct.act + "/" + val + ".png"
              return <img key={path} className="w-32" src={path} />
            })
          : null}
      </div>
      {curZone.altimage !== "none" ? (
        <div className="text-xl h-full">
          <p>{curZone.altimage}</p>
        </div>
      ) : null}
    </div>
  )

  // if (curZone.image && curZone.image[0] !== "none" && curZone.image.length > 0) {
  //   return (
  //     <div className="container flex flex-col min-h-map-container">
  //       <div className="flex flex-row flex-wrap">
  //         {curZone.image.map((val) => {
  //           const path = "../assets/images/zones/" + curAct.act + "/" + val + ".png"
  //           return <img key={path} className="w-32" src={path} />
  //         })}
  //       </div>
  //       <div className="">
  //         <span>{curZone.altimage !== "none" ? curZone.altimage : ""}</span>
  //       </div>
  //     </div>
  //   )
  // } else
  //   return (
  //     <div className="container flex flex-col min-h-map-container">
  //       <div className="">
  //         <h2>Navigation</h2>
  //       </div>
  //       <div className="">
  //         <span>{curZone.altimage !== "none" ? curZone.altimage : ""}</span>
  //       </div>
  //     </div>
  //   )
}

export function SkillTree(props: { curGuide: IGuide }): JSX.Element {
  const curGuide = props.curGuide
  const curAct = useContext(ActContext)

  let tree = ""

  if (curGuide.acts[curAct.actid - 1]) {
    tree = curGuide.acts[curAct.actid - 1].treeimage
    return <img src={tree} />
  }
  return null
}

export function ZoneGem(props: { curGuide: IGuide}): JSX.Element {
  const curGuide = props.curGuide

  const curPlayer = useContext(PlayerContext) as IAppPlayer
  const curAct = useContext(ActContext) as IActs

  const [lvlRange, setlvlRange] = useState(6)
  const [showAll, setshowAll] = useState(false)

  const gems = useMemo(() => {
    const _gems = [] as IAppGems[]

    if (curGuide && curGuide.acts) {
      curGuide.acts
        .filter((act) => act.act == curAct.actid || showAll)
        .map((act) =>
          act.gears.map((gear) =>
            gear.gems.map((_gem) => {
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
          <span className="cursor-pointer" onClick={LvlRangePlus}>
            <Icon path={mdiPlus} size={1} title="Afficher tout / filtré par lvl et act" />
          </span>
          <span className="cursor-pointer">{lvlRange}</span>
          <span className="cursor-pointer" onClick={LvlRangeMoins}>
            <Icon path={mdiMinus} size={1} title="Afficher tout / filtré par lvl et act" />
          </span>
          <span className="cursor-pointer" onClick={inverseShowAll}>
            <Icon path={mdiEye} size={1} title="Afficher tout / filtré par lvl et act" />
          </span>
        </div>
        <div className="overflow-y-auto h-80 max-h-80">
          {gems.map((_gem) => {
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
  const curAct = useContext(ActContext) as IActs

  const curBuy = useMemo(() => {
    let _buy = [] as IBuy[]

    _buy = curGem.buy.filter((buy) => {
      return buy.available_to.includes(curPlayer.characterClass) && buy.act === curAct.actid
    })
    if (_buy.length === 0)
      _buy = curGem.buy.filter((buy) => {
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
      <div className="grid grid-cols-12 gap-1 items-center justify-center flex flex-grow">
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
    > <ReactTooltip key={curGem.name} />
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

export function ZoneGears(props: {
  curRichText: IRichText[]
  curGuide: IGuide
}): JSX.Element {
  const curAct = useContext(ActContext)
  
  const curRichText = props.curRichText
  
  const [curGuide, setcurGuide] = useState(props.curGuide)

    const SendReload = useCallback(() => {
    window.poe_interfaceAPI.sendSync("guide", "reload").then((e) => {
      setcurGuide(e)
    })
  }, [])

  const curGearsAct = useMemo(() => {
    if (curGuide && curGuide.acts) return curGuide.acts.find((act) => act.act == curAct.actid)
  }, [curAct, curGuide])

  return (
    <div className="relative flex flex-col mb-2">
      <h2>Gears</h2>
      <span className="absolute top-1 right-1 cursor-pointer" onClick={SendReload}>
        <Icon path={mdiReload} size={1} title="Recharger tous les jsons" />
      </span>
      {curGearsAct && curGearsAct.gears ? (
        <div>
          {curGearsAct.notes ? <RichText curRichText={curRichText} text={curGearsAct.notes} /> : null}

          <div className="flex flex-row flex-wrap gap-2 items-start">
            {curGearsAct.gears.map((gear, index) => {
              return (
                <div key={gear.name + index} className="max-w-xs">
                  <Gear gear={gear} curRichText={curRichText} />
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Gear(props: { gear: Gear; curRichText: IRichText[] }): JSX.Element {
  const gear = props.gear
  const curRichText = props.curRichText

  //console.log(gear)

  return (
    <div className="border-2 border-poe-99 rounded-lg p-2">
      <p>{gear.name}</p>
      <div className="flex flex-row gap-2 ">
        <div
          className={`${
            (gear.gems ? gear.gems.length : 0) + (gear.chasses ? gear.chasses.length : 0) <= 3
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
            <RichText curRichText={curRichText} text={gear.notes} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function RichText(props: { curRichText: IRichText[]; text: string }): JSX.Element {
  let text = props.text
  let str = ""
  const curRichText = props.curRichText

  text = useMemo(() => {
    console.log(text)
    if (curRichText) {
      for (const filtre of curRichText) {
        str = filtre.data.join("|")
        const regex = new RegExp(`(\\b${str})\\b`, "gi")
        const subst = `<span class='richtext-${filtre.classe}'>$1</span>`
        text = text.replace(regex, subst)
      }
    }

    return text
  }, [text])

  if (text) return <p dangerouslySetInnerHTML={{ __html: text }} />
  else return null
}
