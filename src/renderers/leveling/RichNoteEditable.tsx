import React, { ChangeEventHandler, useContext, useMemo } from "react"
import { RichTextContext } from "./LevelingRenderer"


export function RichNoteEditable(props: {
  children: string
  isOnEdit: boolean
  onChange: ChangeEventHandler<HTMLTextAreaElement>
}): JSX.Element {
  const { isOnEdit, children, onChange } = props

  if (isOnEdit) return <RichNoteTextarea onChange={onChange}>{children}</RichNoteTextarea>
  else return <RichNoteText>{children}</RichNoteText>
}

export function RichNoteTextarea(props: { onChange: ChangeEventHandler<HTMLTextAreaElement>; children: string }): JSX.Element {
  const { onChange, children } = props
  return (<textarea className="container content-end w-full h-full min-h-full min-w-full absolute input p-0 m-0" placeholder="Input" value={children} onChange={onChange} />)
}

export function RichNoteText(props: { children: string }): JSX.Element {
  let text = props.children
  let str = ""
  const curRichText = useContext(RichTextContext)
  //   const replaces = [
  //     {search:/\b(top|haut)\b/, replace:"<Icon path={mdiArrowUpBold} size={1} />"}
  // ]

  text = useMemo(() => {
    console.log(text)
    if (curRichText) {
      for (const filtre of curRichText) {
        str = filtre.data.join("|")
        const regex = new RegExp(`(\\b${str})\\b`, "gi")
        const subst = `<span class='richtext-${filtre.classe}'>$1</span>`
        text = text.replace(regex, subst)
      }
      // for (const replace of replaces){
      //   text = text.replace(RegExp(replace.search, "gi"), replace.replace)
      // }
    }

    return text
  }, [text])

  if (text) return <p dangerouslySetInnerHTML={{ __html: text }} />
  else return null
}