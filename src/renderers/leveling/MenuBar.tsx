import { mdiContentSave, mdiNoteEdit } from "@mdi/js"
import Icon from "@mdi/react"
import React from "react"

export function MenuBar(props: { children: any; pos_x: string; pos_y: string; relative?: boolean }): JSX.Element {
  const { children, pos_x, pos_y, relative } = props

  return (
    <div
      className={`${pos_y === "top" ? "top-0" : "bottom-0"} ${
        pos_x === "right" ? "right-0" : "left-0"
      }  flex flex-row gap-1 p-2 rounded-md w-auto ${relative ? "relative" : "absolute"}  bg-poe-97 bg-opacity-50`}>
      {children}
    </div>
  )
}

export function MenuButton(props: {
  mdiPath: string
  tooltip?: string
  disabled?: boolean
  checked?: boolean
  onClick?: () => void
  onDoubleClick?: () => void
  onMouseOver?: () => void
}): JSX.Element {
  const { mdiPath, tooltip, disabled, checked, onClick, onDoubleClick, onMouseOver } = props
  return (
    <div
      className={`${ disabled && "iconInput_disabled "} ${ checked && "iconInput_checked "} cursor-pointer iconInput`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseOver={onMouseOver}>
      <Icon path={mdiPath} size={1} title={tooltip} />
    </div>
  )
}

export function EditSaveNoteButton(props: { onSave: () => void; onEdit: () => void; isOnEdit: boolean }): JSX.Element {
  const { onEdit, onSave, isOnEdit } = props

  return (
    <>
      {isOnEdit ? (
        <div className="cursor-pointer iconInput" onClick={onSave}>
          <Icon path={mdiContentSave} size={1} title="Sauvegarder" />
        </div>
      ) : (
        <div className="cursor-pointer iconInput" onClick={onEdit}>
          <Icon path={mdiNoteEdit} size={1} title="Éditer" />
        </div>
      )}
    </>
  )
}
