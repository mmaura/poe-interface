import React, { ChangeEvent, ChangeEventHandler, useContext, useState, useMemo, useCallback, useEffect } from "react"
import { mdiBookEdit, mdiBookEditOutline, mdiContentDuplicate, mdiEye, mdiLinkVariant, mdiMinus, mdiPlus } from "@mdi/js"
import Icon from "@mdi/react"

import { CurActContext, PlayerContext } from "./LevelingRenderer"

import { RichNoteEditable, RichNoteText } from "./RichNoteEditable"
import { TextEditable } from "./TextEditable"
import { EditSaveImageButton, EditSaveNoteButton } from "./Buttons"
import { Gem } from "./Components"


export function ZoneGears(props: { curGuide: IClassesGuide, isClassGuideEditable: boolean }): JSX.Element {
  const curAct = useContext(CurActContext)
  const { curGuide, isClassGuideEditable } = props

  console.log("zonegear: ", curGuide)

  const [isOnEdit, setisOnEdit] = useState(false)

  const editNote = useCallback(() => {
    setisOnEdit(!isOnEdit)
  }, [isOnEdit])

  const onActNoteChange = useCallback((e) => {
    return
  }, [])

  const curGearsAct = useMemo(() => {
    if (curGuide && curGuide.acts) return curGuide.acts.find(act => act.act === curAct.actid)
    else return {} as IClassesGuideAct
  }, [curAct, curGuide])

  console.log("curGearsAct: ", curGearsAct)

  return (
    <div className="container relative flex flex-col mb-2">
      {(!isClassGuideEditable) ? null :
        <div className="absolute top-0 left-0 flex flex-row gap-1">
          <EditSaveNoteButton isOnEdit={isOnEdit} onSave={editNote} onEdit={editNote} />
        </div>}

      {(!isClassGuideEditable) ? null :
        <div className="absolute top-0 right-0 flex flex-row gap-1">
          <div className="cursor-pointer iconInput" onClick={() => { return }}>
            <Icon path={mdiPlus} size={1} title="Add new group" />
          </div>
          <div className="cursor-pointer iconInput" onClick={() => { return }}>
            <Icon path={mdiContentDuplicate} size={1} title="Duplicate to next Act" />
          </div>
        </div>}

      <h2>Gears</h2>
      {curGearsAct && curGearsAct.gears ? (
        <div className="flex flex-col">
          {curGearsAct.notes ? <div className="flex-shrink-0 h-32 max-h-36 overflow-y-auto relative">
            <RichNoteEditable isOnEdit={isOnEdit} onChange={onActNoteChange}>{curGearsAct.notes}</RichNoteEditable>
          </div> : null}

          <div className="pt-1 flex-grow flex flex-row flex-wrap gap-2 items-start">
            {curGearsAct.gears.map((gear, index) => {
              return (
                <div key={gear.id} className="max-w-xs">
                  <Gear isOnEdit={isClassGuideEditable} gear={gear} />
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Gear(props: { gear: IClassesGuideGear, isOnEdit: boolean }): JSX.Element {
  const { gear, isOnEdit } = props


  const [isGroupNameOnEdit, setisGroupNameOnEdit] = useState(false)

  const editGroupName = useCallback(() => {
    setisGroupNameOnEdit(!isGroupNameOnEdit)
  }, [isGroupNameOnEdit])


  const [isGroupNoteEdit, setisGroupNoteEdit] = useState(false)

  const editGroupNote = useCallback(() => {
    setisGroupNoteEdit(!isGroupNoteEdit)
  }, [isGroupNoteEdit])


  const onGroupNameChange = useCallback((e) => {
    return
  }, [])

  const onGroupNoteChange = useCallback((e) => {
    return
  }, [])


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
          <div className="cursor-pointer iconInput" onClick={() => { return }}>
            <Icon path={mdiPlus} size={1} title="Add socket or gem" />
          </div>
        </div>}

      <TextEditable isOnEdit={isGroupNameOnEdit} onChange={onGroupNameChange} name="groupName" value={gear.name} />
      <div className={`flex flex-row gap-2 ${(gear.notes || isGroupNoteEdit)?"w-inventory":""}`} >
        <div
          className={`${(gear.gems ? gear.gems.length : 0) + (gear.chasses ? gear.chasses.length : 0) <= 3
            ? "poe-item-3slots"
            : "poe-item-xslots"
            } flex-none`}
        >
          {gear.gems ? gear.gems.map((gem, index) => <Gem key={gem.name + index} curGem={gem} isOnEdit={isOnEdit} />) : null}
          {gear.chasses
            ? gear.chasses.map((color, index) => (
              <div className={`poe-${color}-socket`} key={color + index}></div>
            ))
            : null}
        </div>
        <div className="flex-grow relative">
          <RichNoteEditable isOnEdit={isGroupNoteEdit} onChange={onGroupNoteChange}>{gear.notes}</RichNoteEditable>
        </div>
      </div>
    </div>
  )
}