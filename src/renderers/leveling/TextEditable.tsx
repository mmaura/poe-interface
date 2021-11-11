import React, { ChangeEventHandler } from "react"


export function TextEditable(props: {
  children: string
  isOnEdit: boolean
  onChange: ChangeEventHandler<HTMLInputElement>
  name: string
}): JSX.Element {
  const { isOnEdit, children, onChange, name } = props

  if (isOnEdit) return <TextInput name={name} onChange={onChange}>{children}</TextInput>
  else return <p>{children}</p>
}


export function TextInput(props: { onChange: ChangeEventHandler<HTMLInputElement>, children: string, name: string }): JSX.Element {
  const { onChange, children, name } = props
  return (<input className="h-6 w-full focus:border-poe-60 border-2 rounded-sm p-0 m-0" name={name} value={children} onChange={onChange} />)
}