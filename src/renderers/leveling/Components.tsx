import React, { ChangeEvent, ChangeEventHandler, useContext, useState, useMemo, useCallback, useEffect, useRef } from "react"
import { mdiEye, mdiImageSearch, mdiLinkVariant, mdiLoading, mdiMinus, mdiPlus } from "@mdi/js"
import Icon from "@mdi/react"

import { CurActContext, PlayerContext } from "./LevelingRenderer"

import ReactTooltip from "react-tooltip"
import { RichTextEditable } from "./RichTextEditable"
import { TextEditable } from "./TextEditable"
import { EditSaveNoteButton, MenuButton, MenuBar } from "./MenuBar"
import { GemListElement } from "./Gears"
import { ActsGuides } from "../../modules/ActsGuides"

export function PlayerInfo(): JSX.Element {
  const curPlayer = useContext(PlayerContext)

  return (
    <div className="inventory">
      {curPlayer && (
        <div className="absolute">
          <div className={`avatar bg-avatar-${curPlayer.characterAscendancy.toLowerCase()}`}></div>
          <div className="inventory-text top-inventory-line1">{curPlayer.name}</div>
          <div className="inventory-text top-inventory-line2">
            Level {curPlayer.level} {curPlayer.characterClass}
          </div>
        </div>
      )}
    </div>
  )
}

export function Loading(): JSX.Element {
  return (
    <div className="flex flex-row">
      <Icon path={mdiLoading} size={3} title="Loading" className="animate-spin" />
      <h1>Loading PoeLogFile</h1>
    </div>
  )
}

export function ZoneSelector(props: {
  curZone: IActsGuideZone
  Acts: IActsGuide
  onActChange: ChangeEventHandler<HTMLSelectElement>
  onZoneChange: ChangeEventHandler<HTMLSelectElement>
}): JSX.Element {
  const { curZone, Acts, onActChange, onZoneChange } = props

  const curAct = useContext(CurActContext)
  const curPlayer = useContext(PlayerContext)

  const lvlClass = useMemo(() => {
    if (curPlayer.level - curZone.level > 5) return "filter:grayscale"
    if (curZone.level - curPlayer.level > 4) return "text-red-500"
    if (curZone.level - curPlayer.level > 2) return "text-yellow-500"
    return "text-poe-60"
  }, [curZone, curPlayer])

  return (
    <div className="flex flex-row flex-nowrap space-x-2">
      <select className="lvlg-map-feature min-w-min input" value={curAct.actId} onChange={onActChange}>
        {Acts.acts.map((act: IActsGuideAct) => {
          return (
            <option key={act.actId} value={act.actId}>
              {act.actName}
            </option>
          )
        })}
      </select>
      <select className=" lvlg-map-feature flex-grow input" value={curZone.name} onChange={onZoneChange}>
        {curAct.zones.map((zone: IActsGuideZone) => {
          return (
            <option key={zone.level + "-" + zone.name} value={zone.name}>
              {zone.name}
            </option>
          )
        })}
      </select>
      <div className={`lvlg-map-feature align-middle text-center text-1xl font-bold  ${lvlClass}`}>{curZone.level}</div>
    </div>
  )
}

export function ZoneNotes(props: { curZone: IActsGuideZone; onSave: (text: string) => void; ActsGuideIsOnEdit: boolean }): JSX.Element {
  const { onSave, curZone, ActsGuideIsOnEdit } = props

  const [text, settext] = useState(curZone.note)
  const [isOnEdit, setisOnEdit] = useState(false)

  useEffect(() => {
    settext(curZone.note)
  }, [curZone])

  const onSaveText = useCallback(() => {
    setisOnEdit(!isOnEdit)
    onSave(text)
  }, [isOnEdit, text])

  const editNote = useCallback(() => {
    setisOnEdit(!isOnEdit)
  }, [isOnEdit])

  const onChange = useCallback(e => {
    settext(e.target.value)
  }, [])

  return (
    <div className="container flex flex-col min-h-note-container relative">
      {ActsGuideIsOnEdit && (
        <MenuBar pos_x="left" pos_y="top">
          <EditSaveNoteButton isOnEdit={isOnEdit} onSave={onSaveText} onEdit={editNote} />
        </MenuBar>
      )}
      <h2>Notes</h2>
      <div className="absolute top-0 right-0 flex flex-row gap-1">
        {curZone.hasRecipe && <img className="w-socket h-socket" src="../assets/images/guides/craftingrecipe.png" />}
        {curZone.hastrial && <img className="w-socket h-socket" src="../assets/images/guides/trial.png" />}
        {curZone.haspassive && <img className="w-socket h-socket" src="../assets/images/guides/bookofskill.png" />}
        {curZone.hasWaypoint && <img className="w-socket h-socket" src="../assets/images/guides/waypoint.png" />}
      </div>
      <div className="text-xl flex-grow relative">
        <RichTextEditable isOnEdit={isOnEdit && ActsGuideIsOnEdit} onChange={onChange}>
          {text}
        </RichTextEditable>
      </div>
    </div>
  )
}

export function NavigationMap(props: { curZone: IActsGuideZone; ActsGuideIsOnEdit: boolean; onSave: (text: string) => void }): JSX.Element {
  const { curZone, ActsGuideIsOnEdit, onSave } = props
  console.log("ZoneMap", curZone)

  const [text, settext] = useState(curZone.note)
  const [isOnEdit, setisOnEdit] = useState(false)

  useEffect(() => {
    settext(curZone.altimage)
  }, [curZone])

  const onSaveText = useCallback(() => {
    setisOnEdit(!isOnEdit)
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
          {curZone.image.map(val => {
            const path = `${val}`
            return <img key={path} className="w-32" src={path} />
          })}
        </div>
        <div className=" justify-end text-lg align-baseline ">
          <RichTextEditable isOnEdit={isOnEdit && ActsGuideIsOnEdit} onChange={onChange}>
            {text}
          </RichTextEditable>
        </div>
      </div>
      {ActsGuideIsOnEdit && (
        <div className="absolute top-0 left-0 flex flex-row gap-1">
          <EditSaveNoteButton isOnEdit={isOnEdit} onSave={onSaveText} onEdit={editNote} />
        </div>
      )}
    </div>
  )
}

export function SkillTree(props: {
  curGuide: IClassesGuide
  onClassGuideSkilltreeChange: () => void
  ClassGuideIsOnEdit: boolean
}): JSX.Element {
  const { curGuide, onClassGuideSkilltreeChange: onClassGuideSkilltreeClick, ClassGuideIsOnEdit } = props
  const curAct = useContext(CurActContext)

  const TreeImgTooltip = useRef()

  return (
    <div
      className="container relative max-h-gem-list h-gem-list"
      data-for={`skilltree`}
      data-tip={`skilltree`}
      data-effect="solid"
      data-place="left"
      data-delay-hide="1000">
      {curGuide.acts.find(a => a.actId === curAct.actId) && (
        // <img className="w-full h-full max-w-full max-h-max" src={curGuide.acts.find(a => a.act === curAct.actid).treeimage} />
        <img
          className="object-cover max-w-full max-h-full"
          data-tip={""}
          src={curGuide.acts.find(a => a.actId === curAct.actId).treeimage}
        />
      )}
      <MenuBar pos_x="left" pos_y="top">
        <MenuButton
          mdiPath={mdiEye}
          onMouseOver={() => {
            ReactTooltip.show(TreeImgTooltip.current)
          }}
        />
        {ClassGuideIsOnEdit && <MenuButton mdiPath={mdiImageSearch} onClick={onClassGuideSkilltreeClick} tooltip="Choose Image" />}
      </MenuBar>
    </div>
  )
}

export function GemBuyList(props: { curGuide: IClassesGuide }): JSX.Element {
  const curGuide = props.curGuide

  const curPlayer = useContext(PlayerContext) as IAppPlayer
  const curAct = useContext(CurActContext) as IActsGuideAct

  const [lvlRange, setlvlRange] = useState(6)
  const [showAll, setshowAll] = useState(false)

  const gemsListToShow = useMemo(() => {
    const _gems = [] as IGemList[]

    if (curGuide && curGuide.acts) {
      curGuide.acts
        .filter(act => act.actId === curAct.actId || showAll)
        .map(act =>
          act.gears.map((gear,grindex) =>
            gear.gems.map((_gem, gindex) => {
              if (
                ((_gem.is_new && Math.abs(_gem.required_level - curPlayer.level) < lvlRange) || showAll) &&
                !_gems.find(g => g.label === _gem.label) &&
                _gem.is_socket === false
              ) {
                _gem.key = `${grindex}-${gindex}-${_gem.key}`
                _gems.push(_gem)
              }
            })
          )
        )
      _gems.sort((a, b) => a.required_level - b.required_level)
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
      <div className="container relative">
        <h2>Gems buy list ({gemsListToShow.length})</h2>
        <MenuBar pos_x="right" pos_y="top">
          <MenuButton mdiPath={mdiPlus} onClick={LvlRangePlus} tooltip="More" />
          <span className="iconInput">{lvlRange}</span>
          <MenuButton mdiPath={mdiMinus} onClick={LvlRangeMoins} tooltip="Less" />
          <MenuButton mdiPath={mdiEye} onClick={inverseShowAll} tooltip="Show All" />
        </MenuBar>
        <div className="overflow-y-auto h-80 max-h-80">
          {gemsListToShow.map(_gem => {
            return (
              <div key={`gemElem-${_gem.key}`} className="flex flex-row gap-2">
                <GemListElement
                  selected={false}
                  gem={_gem}
                  selectGem={() => {
                    return
                  }}
                />
                <RewardsList key={`rewardList-${_gem.key}`} gem={_gem} />
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  return <h2>Liste des courses vide</h2>
}

function RewardsList(props: { gem: IGemList }): JSX.Element {
  const { gem } = props

  return (
    <div className="flex flex-col bg-gradient-to-l to-poe-96 via-transparent from-poe-97  border-poe-1 border-0 border-b-2 w-full">
      {gem.quest_rewards.map((reward, index) => {
        return (
          <div key={`1-rewardItem-${gem.key}-${index}`} className="flex flex-row">
            <RewardsItem  reward={reward} is_vendor={false} />
          </div>
        )
      })}
      {gem.vendor_rewards.map((reward, index) => {
        return (
          <div key={`1-rewardItem-${gem.key}-${index}`} className={`flex flex-row `}>
            <RewardsItem  reward={reward} is_vendor={true} />
          </div>
        )
      })}
    </div>
  )
}

function RewardsItem(props: { reward: Reward; is_vendor: boolean }): JSX.Element {
  const { reward, is_vendor } = props

  let disabled = false
  let classes = ""

  if (reward.classes.length === 0) classes = "all classes"
  else classes = reward.classes.join(",")

  if (
    (reward.npc === "Siosa" && reward.quest === "A Fixture of Fate") ||
    (reward.npc === "Lilly Roth" && reward.quest === "Fallen from Grace")
  )
    disabled = true

  if (is_vendor)
    return (
      <p className={`${disabled && "disabled text-xs"}`}>
        Sell by {reward.npc} after quest <span className="text-poe-60">{reward.quest}</span> {reward.actId && `(act ${reward.actId})`} for (
        {classes}).
      </p>
    )
  else
    return (
      <p>
        <span className="text-poe-60">Reward</span> for quest <span className="text-poe-60">{reward.quest}</span>{" "}
        {reward.actId && `(act ${reward.actId})`} for ({classes}).
      </p>
    )
}

// export function GemBuyItem2(props: { gem: IGemList }): JSX.Element {
//   const curGem = props.gem

//   const curPlayer = useContext(PlayerContext) as IAppPlayer
//   const curAct = useContext(CurActContext) as IActsGuideAct

//   const gemClick = useCallback((e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
//     e.preventDefault()
//     window.poe_interface_API.openExternal("https://www.poewiki.net/wiki/" + curGem.name)
//   }, [])

//   const curBuy = useMemo(() => {
//     // let _buy = [] as IBuy[]

//     // _buy = curGem.buy.filter(buy => {
//     //   return buy.available_to.includes(curPlayer.characterClass) && buy.act === curAct.actid
//     // })
//     // if (_buy.length === 0)
//     //   _buy = curGem.buy.filter(buy => {
//     //     return buy.available_to.includes(curPlayer.characterClass)
//     //   })

//     // //make sure "A Fixture of Fate" never be first if a quest alternative
//     // _buy = _buy.sort((a, b) => {
//     //   if (a.quest_name === "A Fixture of Fate") return -1
//     //   if (a.act === b.act) return -1
//     //   return 0
//     // })

//     // return _buy
//     return null
//   }, [curAct, curPlayer])

//   if (curGem) {
//     return (
//       <div className="grid grid-cols-12 gap-1 items-center justify-center flex-grow">
//         <span>lvl: {curGem.required_level}&nbsp;</span>
//         <Gem curGem={curGem} onClick={gemClick} onDoubleClick={gemClick} />
//         <span className="col-span-3">{curGem.name}</span>
//         <div className="col-span-7 flex flex-col">
//           {/* {curBuy.length > 0 ? (
//             curBuy.map((_buy, index) => {
//               return (
//                 <p key={curGem.name + index}>
//                   <GemSpan key={curGem.name + _buy.npc + index} text={_buy.npc} classColor={"text-poe-3"} />
//                   &nbsp;
//                   <GemSpan
//                     key={curGem.name + _buy.quest_name + index}
//                     text={_buy.quest_name}
//                     classColor={"text-poe-60"}
//                   />
//                   &nbsp;
//                   <span className="text-poe-3">{_buy.town}</span>
//                 </p>
//               )
//             })
//           ) : (
//             <p>
//               <span className="text-poe-60">Ask a friend.</span>
//             </p>
//           )} */}
//         </div>
//       </div>
//     )
//   }

//   return <div>Pas de gemme.</div>
// }

export function Gem(props: {
  curGem: IGemList
  onClick: (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => void
  onDoubleClick: (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => void
  selected?: boolean
}): JSX.Element {
  const { curGem, onClick, onDoubleClick, selected } = props

  const tipText = useMemo(() => {
    return !curGem.notes ? `${curGem.label}` : `${curGem.label} - ${curGem.notes}`
  }, [curGem])

  return (
    <div
      data-for={`gem` + curGem.key}
      data-tip={`gem` + curGem.key}
      data-effect="solid"
      data-place="left"
      data-delay-hide="1000"
      className={`relative h-socket`}>
      <ReactTooltip key={curGem.key} />
      <img
        data-tip={tipText}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className={`w-socket h-socket cursor-pointer 
        ${selected ? "border-2 border-poe-50 " : ""}
        ${curGem.is_new ? " opacity-100 " : "opacity-60"} 
        ${curGem.is_alternateQuality ? "gem-divergente" : ""}
        `}
        src={curGem.image}
      />
      {curGem.is_new && (
        <div className="absolute rounded bg-poe-60 h-1 w-1/2 bottom-0 right-1/2 opacity-75 border-black border-[1px]"></div>
      )}
      {curGem.notes && <div className="absolute rounded bg-poe-3 h-1 w-1/2 bottom-0 left-1/2 opacity-75 border-black border-[1px]"></div>}
    </div>
  )
}

// function GemSpan(props: { text: string; classColor: string }): JSX.Element {
//   const text = props.text
//   const classColor = props.classColor

//   const onClick = useCallback(() => window.poe_interfaceAPI.openWiki(text), [])

//   return (
//     <span className={`${classColor} cursor-pointer`} onClick={onClick}>
//       {text}
//     </span>
//   )
// }

export function ActGuideIdentity(props: {
  actGuide: IActsGuide
  onSave: (identity: ActGuideIdentity) => void
  children: string
  onActsGuideEditChange: (isEditable: boolean) => void
}): JSX.Element {
  const { onSave, actGuide, children, onActsGuideEditChange } = props

  const [idName, setidName] = useState(actGuide.identity.name)
  const [idLang, setidlang] = useState(actGuide.identity.lang)

  const [idGameVersion, setidGameVersion] = useState(actGuide.identity.game_version)
  const [isOnEdit, setisOnEdit] = useState(false)

  useEffect(() => {
    setidName(actGuide.identity.name)
    setidGameVersion(actGuide.identity.game_version)
    setidlang(actGuide.identity.lang)
  }, [actGuide])

  const onSaveIdentity = useCallback(() => {
    onActsGuideEditChange(!isOnEdit)
    setisOnEdit(!isOnEdit)
    actGuide.identity.name = idName
    actGuide.identity.lang = idLang
    actGuide.identity.game_version = idGameVersion
    onSave(actGuide.identity)
  }, [isOnEdit, idName, idLang, idGameVersion])

  const editNote = useCallback(() => {
    onActsGuideEditChange(!isOnEdit)
    setisOnEdit(!isOnEdit)
  }, [isOnEdit])

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      switch (e.target.name) {
        case "name":
          if (e.target.value.search(/^[a-zA-Z0-9\s\-–'+_]*$/gm) !== -1) setidName(e.target.value)
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
    },
    [idGameVersion, idLang, idName]
  )

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
      {actGuide.identity.readonly ? null : (
        <div className="w-6">
          <EditSaveNoteButton isOnEdit={isOnEdit} onSave={onSaveIdentity} onEdit={editNote} />
        </div>
      )}
    </div>
  )
}

export function ClassGuideIdentity(props: {
  identity: ClassGuideIdentity
  children: string
  playerClasses: IClassesAscendancies[]
  onSave: (identity: ClassGuideIdentity) => void
  onClassGuideEditChange: (isEditable: boolean) => void
}): JSX.Element {
  const { onSave, onClassGuideEditChange, identity, children, playerClasses } = props

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
    onClassGuideEditChange(!isOnEdit)
    setisOnEdit(!isOnEdit)
    identity.name = idName
    identity.lang = idLang
    identity.game_version = idGameVersion
    identity.class = idClass
    identity.url = idUrl
    onSave(identity)
  }, [isOnEdit, idName, idLang, idGameVersion, idClass, idUrl])

  const editNote = useCallback(() => {
    onClassGuideEditChange(!isOnEdit)
    setisOnEdit(!isOnEdit)
  }, [isOnEdit])

  const OpenUrl = useCallback(() => {
    window.poe_interface_API.openExternal(idUrl)
  }, [idUrl])

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      switch (e.target.name) {
        case "name":
          if (e.target.value.search(/^[a-zA-Z0-9\s\-–'+_]*$/gm) !== -1) setidName(e.target.value)
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
        case "url":
          console.log(e)
          setidurl(e.target.value)
          break
      }
    },
    [idGameVersion, idLang, idName, idClass, idUrl]
  )

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
          <TextEditable isOnEdit={isOnEdit} onChange={onChange} name="class" value={idClass}>
            {playerClasses}
          </TextEditable>
        </div>
        <div className="w-10">
          <TextEditable isOnEdit={isOnEdit} onChange={onChange} name="game_version" value={idGameVersion.toString()} />
        </div>
        <div className="w-6">
          <TextEditable isOnEdit={isOnEdit} onChange={onChange} name="lang" value={idLang} />
        </div>
        {identity.readonly ? null : (
          <div className="w-6">
            <EditSaveNoteButton isOnEdit={isOnEdit} onSave={onSaveIdentity} onEdit={editNote} />
          </div>
        )}
      </div>
      <div className="flex-auto w-full overflow-hidden flex flex-row">
        <div className="flex-auto">
          <TextEditable isOnEdit={isOnEdit} onChange={onChange} name="url" value={idUrl} />
        </div>
        <div className="w-6 cursor-pointer iconInput" onClick={OpenUrl}>
          <Icon path={mdiLinkVariant} size={1} title="voir" />
        </div>
      </div>
    </div>
  )
}
