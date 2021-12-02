import React, { ChangeEventHandler, useEffect, useRef } from "react"


export function TextEditable<T>(props: {
  children?: T[]
  isOnEdit: boolean
  onChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>
  name: string,
  value: string,

}): JSX.Element {
  const { isOnEdit, children, onChange, name, value } = props

  if (isOnEdit) {
    if (Array.isArray(children))
      return <ListInput value={value} name={name} onChange={onChange}>{children}</ListInput>
    else
      return <TextInput value={value} name={name} onChange={onChange} />
  }
  else return <>{value}</>
}


export function TextInput(props: { onChange: ChangeEventHandler<HTMLInputElement>, value: string, name: string }): JSX.Element {
  const text = useRef(null as HTMLInputElement)

  useEffect(() => {
    text.current.focus()
    text.current.setSelectionRange(text.current.value.length, text.current.value.length)
  }, [])

  const { onChange, value, name } = props
  return (<input ref={text} className="h-6 w-full input p-0 m-0" name={name} value={value} onChange={onChange} />)
}

export function ListInput(props: { onChange: ChangeEventHandler<HTMLSelectElement>, children: IClassesAscendancies[], value: string, name: string }): JSX.Element {
  const { onChange, children, name, value } = props
  return (
    <select className="h-6 w-full input p-0 m-0" key={name} value={value} name={name} onChange={onChange} >
      {children.map(c => {
        return (<>
          <option disabled={true} value={c.classe} key={c.classe} >{c.classe}</option>
          <SubListInput key={`sub_${c.classe}`} parent={c} />
        </>
        )
      })}
    </select>
  )
}

function SubListInput(props: { parent: IClassesAscendancies }): JSX.Element {
  const { parent } = props
  return (<>
    {parent.ascendancy.map(a => {
      return <option value={`${a}`} key={`${parent.classe}-${a}`} >{`|--------${a}`}</option>
    })}
  </>
  )

}