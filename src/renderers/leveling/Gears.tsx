import React, { ChangeEvent, ChangeEventHandler, useContext, useState, useMemo, useCallback, useEffect, useRef } from "react"
import { mdiBookEdit, mdiBookEditOutline, mdiContentDuplicate, mdiDelete, mdiDeleteSweep, mdiEye, mdiLinkVariant, mdiMinus, mdiPlus } from "@mdi/js"
import Icon from "@mdi/react"

import { CurActContext, PlayerContext } from "./LevelingRenderer"

import { RichNoteEditable, RichNoteText } from "./RichNoteEditable"
import { TextEditable, TextInput } from "./TextEditable"
import { EditSaveImageButton, EditSaveNoteButton } from "./Buttons"
import { Gem } from "./Components"


export function ZoneGears(props: { curGuide: IClassesGuide, isClassGuideEditable: boolean, gemsSkel: IGems[] }): JSX.Element {
  const curAct = useContext(CurActContext)
  const { curGuide, isClassGuideEditable, gemsSkel } = props

  const [actNotes, setactNotes] = useState("")
  const [isOnEdit, setisOnEdit] = useState(false)

  const setGemUtilityGem = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.preventDefault()
    console.log(e)
    console.log((e.target as HTMLImageElement).dataset.gemindex)
  }, [])

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
      {/* {curGearsAct && curGearsAct.gears ? ( */}
      <div className="flex flex-col">
        {(curGearsAct.notes || isOnEdit) ?
          <div className={`flex-shrink-0 ${isOnEdit ? "h-32" : ""} max-h-36 overflow-y-auto relative`}>
            <RichNoteEditable isOnEdit={isOnEdit} onChange={onActNoteChange}>{actNotes}</RichNoteEditable>
          </div>
          : null}

        <div className="pt-1 flex-grow flex flex-row flex-wrap gap-2 items-start">
          {curGearsAct.gears.map(gear => {
            return (
              <div key={`${gear.name}_${curAct.actid}`} className="max-w-xs">
                <Gear isOnEdit={isClassGuideEditable} gear={gear} curActId={curAct.actid} onGemClick={setGemUtilityGem} />
              </div>
            )
          })}
        </div>
      </div>
      {isClassGuideEditable ? <GemUTility gemsSkel={gemsSkel} /> : null}
      {/* ) : null} */}
    </div>
  )
}

function Gear(props: { gear: IClassesGuideGear, isOnEdit: boolean, curActId: number, onGemClick: (e: React.SyntheticEvent<HTMLImageElement>) => void }): JSX.Element {
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

  // const gemClick = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
  //   e.preventDefault()
  //   console.log(e)
  //   console.log((e.target as HTMLImageElement).dataset.gemindex)
  // }, [])


  return (
    <div className="border-2 border-poe-99 rounded-lg p-2 ">
      {(!isOnEdit) ? null :
        <div className=" top-0 right-0 flex flex-row gap-1">
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
          className={`${(gear.gems ? gear.gems.length : 0) + (gear.chasses ? gear.chasses.length : 0) <= 3
            ? "poe-item-3slots"
            : "poe-item-xslots"
            } flex-none`}
        >
          {gear.gems ? gear.gems.map((gem, index) => <Gem key={gem.name + index} index={index} curGem={gem} onClick={onGemClick} />) : null}
          {gear.chasses
            ? gear.chasses.map((color, index) => (
              <div className={`poe-${color}-socket`} key={color + index}></div>
            ))
            : null}
        </div>
        <div className="flex-grow relative">
          <RichNoteEditable isOnEdit={isGroupNoteEdit} onChange={onGroupNotesChange}>{groupNotes}</RichNoteEditable>
        </div>
      </div>
    </div>
  )
}

export function GemUTility(props: { gemsSkel: IGems[] }): JSX.Element {
  const { gemsSkel } = props

  const searchGem = useCallback(() => {
    return
  }, [])

  const GemsList = useMemo(() => {
    const gemsList = [] as IGems[]

    for (const gem of gemsSkel.sort()){
      gemsList.push(gem)
      for (gem)
    }
  }, [gemsSkel])

  return (
    <div className="container relative">
      <h2>Gem Utility</h2>
      <div className="flex flex-row gap-2">
        <div className="poe-white-socket"></div>
        <div className="poe-red-socket"></div>
        <div className="poe-green-socket"></div>
        <div className="poe-blue-socket"></div>
        <TextInput name="gemsearch" value="gemName" onChange={searchGem} />
      </div>
    </div>
  )
}