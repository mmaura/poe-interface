import React, { ChangeEventHandler, useContext, useMemo, useRef, useEffect } from "react"
import { RichTextContext } from "./LevelingRenderer"

export function RichTextEditable(props: {
  children: string
  isOnEdit: boolean
  onChange: ChangeEventHandler<HTMLTextAreaElement>
}): JSX.Element {
  const { isOnEdit, children, onChange } = props

  if (isOnEdit) return <RichTextEditableInput onChange={onChange}>{children}</RichTextEditableInput>
  else return <RichTextEditableText>{children}</RichTextEditableText>
}

function RichTextEditableInput(props: { onChange: ChangeEventHandler<HTMLTextAreaElement>; children: string }): JSX.Element {
  const { onChange, children } = props
  const area = useRef(null as HTMLTextAreaElement)

  useEffect(() => {
    area.current.focus()
    area.current.setSelectionRange(area.current.value.length, area.current.value.length)
  }, [])

  return (
    <textarea
      ref={area}
      className="container content-end w-full h-full min-h-full min-w-full absolute input p-0 m-0"
      placeholder="Input"
      value={children}
      onChange={onChange}
    />
  )
}

function RichTextEditableText(props: { children: string }): JSX.Element {
  let text = props.children
  const curRichText = useContext(RichTextContext)

  const formated = useMemo(() => {
    if (text) {
      for (const filtre of curRichText) {
        const str = filtre.keywords.join("|")
        const regex = new RegExp(`(\\b${str})\\b`, "gi")
        const subst = `<span class='richtext-${filtre.style}'>$1</span>`
        text = text.replace(regex, subst)
      }
      text = text.replace(/\n/g, "<br>")
    }

    return text
  }, [text])

  if (formated) return <p dangerouslySetInnerHTML={{ __html: formated }} />
  else return null
}
