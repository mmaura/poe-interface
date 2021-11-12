import React, { ChangeEventHandler } from "react"


export function TextEditable(props: {
  children?: IPlayerClasses[]
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
  else return <p>{value}</p>
}


export function TextInput(props: { onChange: ChangeEventHandler<HTMLInputElement>, value: string, name: string }): JSX.Element {
  const { onChange, value, name } = props
  return (<input className="h-6 w-full focus:border-poe-60 border-2 rounded-sm p-0 m-0" name={name} value={value} onChange={onChange} />)
}

export function ListInput(props: { onChange: ChangeEventHandler<HTMLSelectElement>, children: IPlayerClasses[], value: string, name: string }): JSX.Element {
  const { onChange, children, name, value } = props
  return (
    <select className="h-6 w-full focus:border-poe-60 border-2 rounded-sm p-0 m-0" value={value} name={name} onChange={onChange} >
      {children.map(c => {
        return (<>
          <option value={c.classe} key={c.classe} >{c.classe}</option>
          <SubListInput parent={c} />
        </>
        )
      })}
    </select>
  )
}

function SubListInput(props: { parent: IPlayerClasses }): JSX.Element {
  const { parent } = props
  return (<>
    {parent.ascendancy.map(a => {
      return <option value={`${a}`} key={`${parent.classe}-${a}`} >{`|--------${a}`}</option>
    })}
  </>
  )

}