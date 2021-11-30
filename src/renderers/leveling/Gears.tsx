import React, { ChangeEvent, ChangeEventHandler, useContext, useState, useMemo, useCallback, useEffect, useRef } from "react"
import { mdiBookEdit, mdiBookEditOutline, mdiContentDuplicate, mdiDelete, mdiDeleteSweep, mdiEye, mdiLinkVariant, mdiMinus, mdiPlus } from "@mdi/js"
import Icon from "@mdi/react"

import { CurActContext, PlayerContext } from "./LevelingRenderer"

import { RichNoteEditable, RichNoteText } from "./RichNoteEditable"
import { TextEditable, TextInput } from "./TextEditable"
import { EditSaveImageButton, EditSaveNoteButton } from "./Buttons"
import { Gem } from "./Components"


export function ZoneGears(props: { curGuide: IClassesGuide, isClassGuideEditable: boolean, gemsSkel: IGemList[] }): JSX.Element {
  const curAct = useContext(CurActContext)
  const { curGuide, isClassGuideEditable, gemsSkel } = props

  const [actNotes, setactNotes] = useState("")
  const [isOnEdit, setisOnEdit] = useState(false)
  const [selectedGemName, setselectedGemName] = useState("")
  const [curGemEdit, setcurGemEdit] = useState({ actId: 0, gearName: "", gemIndex: 0 })

  const onGemClick = useCallback((actId: number, gearName: string, gemName: string, index: number, e: React.SyntheticEvent<HTMLImageElement>) => {
    e.preventDefault()
    if (isClassGuideEditable) {
      setselectedGemName(gemName)
      setcurGemEdit({ actId: actId, gearName: gearName, gemIndex: index })
    }
    else window.poe_interfaceAPI.openExternal("https://www.poewiki.net/wiki/" + gemName)
  }, [isClassGuideEditable])

  const selectNewGem = useCallback((e: React.SyntheticEvent<HTMLDivElement>, newGearName: string) => {
    e.preventDefault()
    window.poe_interfaceAPI.sendSync("levelingRenderer", "saveClassGuide", "setGearGem", curGemEdit, newGearName)
  }, [curGemEdit,])

  const editNote = useCallback(() => {
    if (isOnEdit)
      window.poe_interfaceAPI.sendSync("levelingRenderer", "saveClassGuide", "ActNotes", curAct.actid, actNotes)
    setisOnEdit(!isOnEdit)
  }, [isOnEdit, actNotes, curAct])

  const onActNoteChange = useCallback((e) => {
    setactNotes(e.target.value)
  }, [])

  const curGearsAct = useMemo(() => {
    if (curGuide && curGuide.acts) {
      const _cga = curGuide.acts.find(act => act.act === curAct.actid)
      setactNotes(_cga.notes)
      // console.log("cga %o", _cga)
      return _cga
    }
    else return {} as IClassesGuideAct
  }, [curAct, curGuide])

  const addGear = useCallback(() => {
    window.poe_interfaceAPI.sendSync("levelingRenderer", "saveClassGuide", "addGear", curAct.actid)
  },
    [curAct.actid],
  )

  return (
    <div className="container relative flex flex-col mb-2">
      {(!isClassGuideEditable) ? null :
        <div className="absolute top-0 left-0 flex flex-row gap-1">
          <EditSaveNoteButton isOnEdit={isOnEdit} onSave={editNote} onEdit={editNote} />
        </div>}

      {(!isClassGuideEditable) ? null :
        <div className="absolute top-0 right-0 flex flex-row gap-1">
          <div className="cursor-pointer iconInput" onClick={addGear}>
            <Icon path={mdiPlus} size={1} title="Add new group" />
          </div>
          <div className="cursor-pointer iconInput" onClick={() => { return }}>
            <Icon path={mdiContentDuplicate} size={1} title="Duplicate to next Act" />
          </div>
        </div>}

      <h2>Gears</h2>
      <div className="flex flex-col">
        {(curGearsAct.notes || isOnEdit) && isClassGuideEditable ?
          <div className={`flex-shrink-0 ${isOnEdit ? "h-32" : ""} max-h-36 overflow-y-auto relative`}>
            <RichNoteEditable isOnEdit={isOnEdit} onChange={onActNoteChange}>{actNotes}</RichNoteEditable>
          </div>
          : null}

        <div className="pt-1 flex-grow flex flex-row flex-wrap gap-2 items-start">
          {curGearsAct.gears.map(gear => {
            return (
              <div key={`${gear.name}_${curAct.actid}`} className="max-w-xs">
                <Gear isOnEdit={isClassGuideEditable} gear={gear} curActId={curAct.actid} onGemClick={onGemClick} />
              </div>
            )
          })}
        </div>
      </div>
      {isClassGuideEditable ? <GemUTility selectNewGem={selectNewGem} curGemEdit={curGemEdit} gemsSkel={gemsSkel} selectedGemName={selectedGemName} key={"gem_utility"} /> : null}
    </div>
  )
}

function Gear(
  props: {
    gear: IClassesGuideGear,
    isOnEdit: boolean,
    curActId: number,
    onGemClick: (
      actId: number,
      gearName: string,
      gemName: string,
      index: number,
      e: React.SyntheticEvent<HTMLImageElement>
    ) => void
  }): JSX.Element {

  const { gear, isOnEdit, curActId, onGemClick } = props

  const [groupName, setgroupName] = useState(gear.name)
  const [groupNotes, setgroupNotes] = useState(gear.notes)
  const [isGroupNameOnEdit, setisGroupNameOnEdit] = useState(false)
  const [isGroupNoteEdit, setisGroupNoteEdit] = useState(false)

  const editGroupName = useCallback(() => {
    if (isGroupNameOnEdit && (prevGroupName.current !== groupName)) {
      window.poe_interfaceAPI.sendSync("levelingRenderer", "saveClassGuide", "GearName", prevGroupName.current, groupName)
      prevGroupName.current = groupName
    }
    setisGroupNameOnEdit(!isGroupNameOnEdit)
  }, [isGroupNameOnEdit, groupName])

  const prevGroupName = useRef(groupName)

  const editGroupNote = useCallback(() => {
    if (isGroupNoteEdit)
      window.poe_interfaceAPI.sendSync("levelingRenderer", "saveClassGuide", "GearNotes", gear.name, groupNotes, curActId)
    setisGroupNoteEdit(!isGroupNoteEdit)
  }, [isGroupNoteEdit, groupNotes, curActId])

  const onGroupNameChange = useCallback(e => {
    setgroupName(e.target.value)
  }, [])

  const onGroupNotesChange = useCallback(e => {
    setgroupNotes(e.target.value)
  }, [])

  const addGearSlot = useCallback(() => {
    window.poe_interfaceAPI.sendSync("levelingRenderer", "saveClassGuide", "addGearSlot", gear.name, curActId)
  },
    [curActId, gear.name])

  const delGear = useCallback(() => {
    window.poe_interfaceAPI.sendSync("levelingRenderer", "saveClassGuide", "delGear", gear.name, curActId)
  },
    [curActId, gear.name])

  const delGearInAllActs = useCallback(() => {
    window.poe_interfaceAPI.sendSync("levelingRenderer", "saveClassGuide", "delGearInAllActs", gear.name)
  },
    [gear.name])

  return (
    <div className="border-2 border-poe-1 bg-poe-96 rounded-lg p-2 ">
      {(!isOnEdit) ? null :
        <div className=" top-0 right-0 flex flex-row gap-1 bg-poe-97 p-2 rounded-md w-auto">
          <div className="cursor-pointer iconInput" onClick={editGroupName}>
            <Icon path={mdiBookEdit} size={1} title="Edit group name" />
          </div>
          <div className="cursor-pointer iconInput" onClick={editGroupNote}>
            <Icon path={mdiBookEditOutline} size={1} title="Edit group note" />
          </div>
          <div className="cursor-pointer iconInput" onClick={addGearSlot}>
            <Icon path={mdiPlus} size={1} title="Add socket or gem" />
          </div>
          <div className="cursor-pointer iconInput" onClick={delGear}>
            <Icon path={mdiDelete} size={1} title="Delete group" />
          </div>
          <div className="cursor-pointer iconInput" onClick={delGearInAllActs}>
            <Icon path={mdiDeleteSweep} size={1} title="Delete group in all acts" />
          </div>
        </div>}

      <TextEditable isOnEdit={isGroupNameOnEdit} onChange={onGroupNameChange} name="groupName" value={groupName} />
      <div className={`flex flex-row gap-2 ${(isGroupNoteEdit) ? "w-inventory" : ""}`} >
        <div
          className={`${(gear.gems ? gear.gems.length : 0) <= 3
            ? "poe-item-3slots"
            : "poe-item-xslots"
            } flex-none`}
        >
          {gear.gems ? gear.gems.map((gem, index) => <Gem key={gem.key + index} curGem={gem} onClick={(e) => { onGemClick(curActId, gear.name, gem.name, index, e) }} />) : null}

        </div>
        <div className="flex-grow relative">
          <RichNoteEditable isOnEdit={isGroupNoteEdit} onChange={onGroupNotesChange}>{groupNotes}</RichNoteEditable>
        </div>
      </div>
    </div>
  )
}

export function GemUTility(props: {
  gemsSkel: IGemList[],
  selectedGemName: string,
  curGemEdit: { actId: number, gearName: string, gemIndex: number },
  selectNewGem: (e: React.SyntheticEvent<HTMLDivElement>, gemName: string) => void
}): JSX.Element {
  const { gemsSkel, selectedGemName, selectNewGem } = props
  const [filter, setfilter] = useState("")
  const [pageNum, setPageNum] = useState(1)
  const { gems, hasMore, hasLess, gemCount } = useSearchGem(filter, pageNum, gemsSkel)
  const observer = useRef({} as IntersectionObserver)

  const prev = useCallback((node) => {
    if (observer && observer.current && node) {
      if (hasLess) {
        console.log("prev:%o", node)
        observer.current.observe(node)
      }
      else {
        console.log("unprev:%o", node)
        observer.current.unobserve(node)
      }
    }
  }, [hasLess])

  const next = useCallback((node) => {
    if (observer && observer.current && node) {
      if (hasMore) {
        console.log("next:%o", node)
        observer.current.observe(node)
      }
      else {
        console.log("unnext:%o", node)
        observer.current.unobserve(node)
      }
    }
  }, [hasMore])

  // Never be recompiled
  useEffect(() => {
    observer.current = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if ((entry.target.id === "next") && entry.isIntersecting) setPageNum((prev) => prev + 1)
        if ((entry.target.id === "prev") && entry.isIntersecting) setPageNum((prev) => prev - 1)
      }
    })
    console.log("IntersectionObserver registered.")
    return () => {
      if ((observer.current) && (observer.current.disconnect)) {
        observer.current.disconnect()
        console.log("IntersectionObserver disconnected.")
      }
    }
  }, [])

  const handleChange = useCallback((e) => {
    setfilter(e.target.value);
    setPageNum(1);
  }, [])

  return (
    <div className="container relative">
      <h2>Gem Utility ({gemCount})</h2>
      <div className="p-2 flex flex-row gap-2 h-11 w-2/3">
        <span>Filter:</span>
        <TextInput key='GemFilter' name="gemsearch" value={filter} onChange={handleChange} />
      </div>
      <div className="flex flex-wrap gap-2 h-72 overflow-y-scroll">
        {
          gems.map((gem, i) => {
            if (i === 4)
              return (<>
                <div className="border-0" ref={prev} id="prev" key={`prev_${gem.key}`} />
                <GemListElement selectGem={selectNewGem} key={`gem_${gem.key}`} gem={gem} selected={gem.name === selectedGemName} />
              </>)
            else if (i === gems.length - 3)
              return (<>
                <GemListElement selectGem={selectNewGem} key={`gem_${gem.key}`} gem={gem} selected={gem.name === selectedGemName} />
                <div className="border-0" ref={next} id="next" key={`next_${gem.key}`} />
              </>)
            else
              return <GemListElement selectGem={selectNewGem} key={`gem_${gem.key}`} gem={gem} selected={gem.name === selectedGemName} />
          })
        }
      </div>
    </div>
  )
}

export function GemListElement(props: { gem: IGemList, selected: boolean, selectGem: (e: React.SyntheticEvent<HTMLDivElement>, gemName: string) => void }): JSX.Element {
  const { gem, selected, selectGem } = props

  return (
    <div onClick={(e) => { selectGem(e, gem.name) }} className={`h-20 p-1 w-5/12 flex-grow-0 flex-shrink-0 flex flex-row bg-poe-96 border-poe-1 border-2 hover:border-poe-60 hover:border-2 rounded-md${selected ? 'border-2 border-poe-50 rounded-md' : ''}`}>
      <div className="flex-grow-0 flex-shrink-0 w-16 h-16"><img className={` ${gem.isAlternateQuality === true ? 'filter sepia' : ''}`} src={gem.image} /></div>
      <div className="flex-grow flex flex-col items-end">
        <div className="text-poe-4 text-right font-semibold">{gem.label}</div>
        <div className="flex-row flex h-full w-full items-end">
          {(!gem.is_socket) ? <div className="w-1/3 flex-grow-0" >Lvl: <span className="text-poe-4">{gem.required_level}</span></div> : null}
          <div className="flex-grow text-right">
            {
              (gem.currency_amount)
                ? <div className="flex fex-col gap-1 justify-end">Cost: <span className="text-poe-4">{gem.currency_amount}x</span><img alt={gem.currency} className="h-6 w-6" src={gem.currency} /></div>
                : (!gem.is_socket) ? <div>Cost: <span className="text-poe-4">Drop Only</span></div> : null
            }
          </div>
        </div>
      </div>
    </div>
  )
}


function useSearchGem(filter: string, pageNum: number, gemsSkel: IGemList[]) {
  const [hasLess, setHasLess] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [gems, setGems] = useState([] as IGemList[])
  const [gemCount, setgemCount] = useState(gemsSkel.length)

  const pageLen = 30
  const delta = 6
  const regex = new RegExp(`.*${filter}.*`, 'i');

  const filteredGems = useMemo(() => {
    if (filter === '') {
      setgemCount(gemsSkel.length)
      return gemsSkel
    }
    else {
      const gem = gemsSkel.filter(g => (regex.test(g.name)))
      setgemCount(gem.length)
      return gem
    }
  }, [filter, gemsSkel])

  useEffect(() => {
    let indexFin = (pageNum - 1) * delta + pageLen
    const indexDebut = pageNum * delta - delta
    if (indexFin > filteredGems.length) indexFin = filteredGems.length

    setGems(filteredGems.slice(indexDebut, indexFin))
    setHasMore(filteredGems.length > indexFin)
    setHasLess(indexDebut > 0)

    console.log("debut: %s, fin: %s, count: %s", indexDebut, indexFin, gemCount)
  }, [filteredGems, pageNum]);

  return { gems, hasMore, hasLess, gemCount };
}