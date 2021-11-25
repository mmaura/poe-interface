import React, { ChangeEvent, ChangeEventHandler, useContext, useState, useMemo, useCallback, useEffect } from "react"

import { mdiContentSave, mdiEye, mdiImageSearch, mdiMinus, mdiNoteEdit, mdiPlus } from "@mdi/js"
import Icon from "@mdi/react"


export function EditSaveNoteButton(props: {
    onSave: () => void
    onEdit: () => void
    isOnEdit: boolean
  }): JSX.Element {
    const { onEdit, onSave, isOnEdit } = props
  
    return (
      <div>
        {isOnEdit ? (
          <div className="cursor-pointer iconInput" onClick={onSave}>
            <Icon path={mdiContentSave} size={1} title="Sauvegarder" />
          </div>
        ) : (
          <div className="cursor-pointer iconInput" onClick={onEdit}>
            <Icon path={mdiNoteEdit} size={1} title="Éditer" />
          </div>
        )}
      </div>
    )
  }
  
  export function EditSaveImageButton(props: {
    onClick: () => void
  
  }): JSX.Element {
    const { onClick } = props
  
    return (
      <div>
        <div className="iconInput" onClick={onClick}>
          <Icon path={mdiImageSearch} size={1} title="Éditer" />
        </div>
  
      </div>
    )
  }
  