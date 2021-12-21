import React, { useContext, useState, useMemo, useCallback, useEffect, useRef, ChangeEventHandler, ChangeEvent } from "react"
import { mdiAllergy, mdiBookEdit, mdiBookEditOutline, mdiContentDuplicate, mdiDelete, mdiDeleteSweep, mdiPlus } from "@mdi/js"
import Icon from "@mdi/react"

import { CurActContext } from "./LevelingRenderer"

import { RichTextEditable } from "./RichTextEditable"
import { TextEditable, TextInput } from "./TextEditable"
import { Gem } from "./Components"
import { MenuBar, MenuButton, EditSaveNoteButton } from "./MenuBar"

export function ZoneGears(props: {
  curGuide: IClassesGuide
  ClassGuideIsOnEdit: boolean
  onGearSocketSelected: (actId: number, gearName: string, gemName: string, index: number, e: React.SyntheticEvent<HTMLImageElement>) => void
  ClassGuide_SaveGearNote?: (actId: number, actNotes: string) => void
  ClassGuide_AddGearSocket?: () => void
  ClassGuide_DeleteGearSocket?: (actId: number, gearName: string, index: number, e: React.SyntheticEvent<HTMLImageElement>) => void
  ClassGuide_CopyToNextAct?: (actId: number) => void
  curSocketEdited: GearSocketRef
}): JSX.Element {
  const curAct = useContext(CurActContext)
  const {
    curGuide,
    ClassGuideIsOnEdit,
    ClassGuide_SaveGearNote,
    ClassGuide_AddGearSocket,
    ClassGuide_DeleteGearSocket,
    ClassGuide_CopyToNextAct,
    onGearSocketSelected,
    curSocketEdited,
  } = props

  const [actNotes, setactNotes] = useState("")
  const [noteIsOnEdit, setnoteIsOnEdit] = useState(false)

  const editNote = useCallback(() => {
    if (noteIsOnEdit) ClassGuide_SaveGearNote(curAct.actid, actNotes)
    setnoteIsOnEdit(!noteIsOnEdit)
  }, [noteIsOnEdit, actNotes, curAct])

  const onActNoteChange = useCallback(e => {
    setactNotes(e.target.value)
  }, [])

  const onCopyToNextAct = useCallback(()=>{
    ClassGuide_CopyToNextAct(curAct.actid)
  }, [curAct]) 


  const curGearsAct = useMemo(() => {
    if (curGuide && curGuide.acts) {
      const _cga = curGuide.acts.find(act => act.actId === curAct.actid)
      setactNotes(_cga.notes)
      return _cga
    } else return {} as IClassesGuideAct
  }, [curAct, curGuide])

  return (
    <>
      <div className="relative flex flex-col mb-2">
        {ClassGuideIsOnEdit && (
          <MenuBar pos_x="left" pos_y="top">
            <EditSaveNoteButton isOnEdit={noteIsOnEdit} onSave={editNote} onEdit={editNote} />
          </MenuBar>
        )}

        {ClassGuideIsOnEdit && (
          <MenuBar pos_x="right" pos_y="top">
            <MenuButton onClick={ClassGuide_AddGearSocket} tooltip="Add new group" mdiPath={mdiPlus} />
            <MenuButton onClick={onCopyToNextAct} tooltip="Copy to next Act" mdiPath={mdiContentDuplicate} />
          </MenuBar>
        )}

        <h2>Gears</h2>
        <div className="flex flex-col">
          {(curGearsAct.notes || (noteIsOnEdit && ClassGuideIsOnEdit)) && (
            <div className={`flex-shrink-0 ${noteIsOnEdit ? "h-32" : ""} max-h-36 overflow-y-auto relative`}>
              <RichTextEditable isOnEdit={noteIsOnEdit} onChange={onActNoteChange}>
                {actNotes}
              </RichTextEditable>
            </div>
          )}

          <div className="pt-1 flex-grow flex flex-row flex-wrap gap-2 items-start">
            {curGearsAct.gears.map(gear => {
              return (
                <div key={`${gear.name}_${curAct.actid}`} className="max-w-xs">
                  <Gear
                    ClassGuideIsOnEdit={ClassGuideIsOnEdit}
                    gear={gear}
                    curActId={curAct.actid}
                    onGearGemClick={onGearSocketSelected}
                    onGearGemDoubleClick={ClassGuide_DeleteGearSocket}
                    curSocketEdited={curSocketEdited}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

function Gear(props: {
  gear: IClassesGuideGear
  ClassGuideIsOnEdit: boolean
  curActId: number
  onGearGemClick: (actId: number, gearName: string, gemName: string, index: number, e: React.SyntheticEvent<HTMLImageElement>) => void
  onGearGemDoubleClick: (actId: number, gearName: string, index: number, e: React.SyntheticEvent<HTMLImageElement>) => void
  curSocketEdited: GearSocketRef
}): JSX.Element {
  const { gear, ClassGuideIsOnEdit, curActId, onGearGemClick, onGearGemDoubleClick, curSocketEdited } = props

  const [groupName, setgroupName] = useState(gear.name)
  const [groupNotes, setgroupNotes] = useState(gear.notes)
  const [isGroupNameOnEdit, setisGroupNameOnEdit] = useState(false)
  const [isGroupNoteEdit, setisGroupNoteEdit] = useState(false)

  const editGroupName = useCallback(() => {
    if (isGroupNameOnEdit && prevGroupName.current !== groupName) {
      window.poe_interface_API.sendSync("levelingRenderer", "saveClassGuide", "GearName", prevGroupName.current, groupName)
      prevGroupName.current = groupName
    }
    setisGroupNameOnEdit(!isGroupNameOnEdit)
  }, [isGroupNameOnEdit, groupName])

  const prevGroupName = useRef(groupName)

  const editGroupNote = useCallback(() => {
    if (isGroupNoteEdit)
      window.poe_interface_API.sendSync("levelingRenderer", "saveClassGuide", "GearNotes", gear.name, groupNotes, curActId)
    setisGroupNoteEdit(!isGroupNoteEdit)
  }, [isGroupNoteEdit, groupNotes, curActId])

  const onGroupNameChange = useCallback(e => {
    setgroupName(e.target.value)
  }, [])

  const onGroupNotesChange = useCallback(e => {
    setgroupNotes(e.target.value)
  }, [])

  const addGearSlot = useCallback(() => {
    window.poe_interface_API.sendSync("levelingRenderer", "saveClassGuide", "addGearSlot", gear.name, curActId)
  }, [curActId, gear.name])

  const delGear = useCallback(() => {
    window.poe_interface_API.sendSync("levelingRenderer", "saveClassGuide", "delGear", gear.name, curActId)
  }, [curActId, gear.name])

  const delGearInAllActs = useCallback(() => {
    window.poe_interface_API.sendSync("levelingRenderer", "saveClassGuide", "delGearInAllActs", gear.name)
  }, [gear.name])

  return (
    <div className={`${ClassGuideIsOnEdit ? "h-gear-edit" : "h-gear"} w-gear border-2 border-poe-1 bg-poe-96 rounded-lg p-2`}>
      {ClassGuideIsOnEdit && (
        <MenuBar pos_x="right" pos_y="top" relative={true}>
          <MenuButton mdiPath={mdiBookEdit} onClick={editGroupName} tooltip="Edit group name" />
          <MenuButton mdiPath={mdiBookEditOutline} onClick={editGroupNote} tooltip="Edit group notes" />
          <MenuButton mdiPath={mdiPlus} onClick={addGearSlot} tooltip="Add a slot" />
          <MenuButton mdiPath={mdiDelete} onClick={delGear} tooltip="Delete group" />
          <MenuButton mdiPath={mdiDeleteSweep} onClick={delGearInAllActs} tooltip="Delete group in all acts" />
        </MenuBar>
      )}

      <TextEditable isOnEdit={isGroupNameOnEdit} onChange={onGroupNameChange} name="groupName" value={groupName} />
      <div className={`flex flex-row gap-2 ${isGroupNoteEdit ? "w-inventory" : ""}`}>
        <div className={`${(gear.gems ? gear.gems.length : 0) <= 3 ? "poe-item-3slots" : "poe-item-xslots"} self-start justify-self-start flex-grow-0 flex-shrink-0 min-h-0 border-poe-97 border-2 rounded-lg p-[2px]`}>
          {gear.gems &&
            gear.gems.map((gem, index) => (
              <Gem
                selected={curSocketEdited.gemIndex === index && curSocketEdited.gearName === gear.name && ClassGuideIsOnEdit}
                key={gem.key + index}
                curGem={gem}
                onClick={e => {
                  onGearGemClick(curActId, gear.name, gem.name, index, e)
                }}
                onDoubleClick={e => {
                  onGearGemDoubleClick(curActId, gear.name, index, e)
                }}
              />
            ))}
        </div>
        <div className="flex-grow relative overflow-y-auto text-xs">
          <RichTextEditable isOnEdit={isGroupNoteEdit} onChange={onGroupNotesChange}>
            {groupNotes}
          </RichTextEditable>
        </div>
      </div>
    </div>
  )
}

export function GemSelectorUTility(props: {
  gemsSkel: IGemList[]
  selectedGemName: string
  //curGemEdit: { actId: number; gearName: string; gemIndex: number }
  selectNewGem: (e: React.SyntheticEvent<HTMLDivElement>, gemName: string) => void
}): JSX.Element {
  const { gemsSkel, selectedGemName, selectNewGem } = props

  const curAct = useContext(CurActContext)

  const [gemFilterText, setgemFilterText] = useState("")
  const [pageNum, setPageNum] = useState(1)
  const [BeforeActId, setBeforeActId] = useState(true)
  const [showAdvancedGems, setshowAdvancedGems] = useState(true)
  const [showSupportGems, setshowSupportGems] = useState(true)
  const [showActiveGems, setshowActiveGems] = useState(true)
  const [showSockets, setshowSockets] = useState(true)

  const [actFilter, setactFilter] = useState(0)

  const { gems, hasMore, hasLess, gemCount } = useSearchGem(
    gemsSkel,
    // selectedGemName,
    pageNum,
    gemFilterText,
    BeforeActId && actFilter,
    showSockets,
    showActiveGems,
    showSupportGems,
    showAdvancedGems
  )
  const observer = useRef({} as IntersectionObserver)

  const prevIntersect = useCallback(
    node => {
      if (observer && observer.current && node) {
        if (hasLess) observer.current.observe(node)
        else observer.current.unobserve(node)
      }
    },
    [hasLess]
  )

  const nextIntersect = useCallback(
    node => {
      if (observer && observer.current && node) {
        if (hasMore) observer.current.observe(node)
        else observer.current.unobserve(node)
      }
    },
    [hasMore]
  )

  useEffect(() => {
    setactFilter(curAct.actid)
  }, [BeforeActId, curAct])

  // Never be recompiled
  useEffect(() => {
    observer.current = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target.id === "next" && entry.isIntersecting) setPageNum(prev => prev + 1)
        if (entry.target.id === "prev" && entry.isIntersecting) setPageNum(prev => prev - 1)
      }
    })
    return () => {
      if (observer.current && observer.current.disconnect) observer.current.disconnect()
    }
  }, [])

  const handleGemsFilterChange = useCallback(e => {
    setgemFilterText(e.target.value)
    setPageNum(1)
  }, [])

  const onCheckboxChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      switch (e.target.name) {
        case "showOnlyCurAct":
          setBeforeActId(!BeforeActId)
          break
        case "showAdvancedGems":
          setshowAdvancedGems(!showAdvancedGems)
          break
        case "showSupportGems":
          setshowSupportGems(!showSupportGems)
          break
        case "showActiveGems":
          setshowActiveGems(!showActiveGems)
          break
        case "showSockets":
          setshowSockets(!showSockets)
          break
      }
    },
    [BeforeActId, showAdvancedGems, showSupportGems, showActiveGems, showSockets]
  )

  return (
    <>
      <h2>Gem Utility ({gemCount})</h2>
      <div className="flex flex-row max-h-full h-full overflow-hidden pb-6">
        <div className="flex content-start flex-grow-0 flex-wrap gap-2 overflow-y-scroll max-h-full">
          {gems.map((gem, i) => {
            if (i === 11)
              return (
                <>
                  <div className="-m-1" ref={prevIntersect} id="prev" key={`prev_${gem.key}`} />
                  <GemListElement selectGem={selectNewGem} key={`gem_${gem.key}`} gem={gem} selected={gem.label === selectedGemName} />
                </>
              )
            else if (i === gems.length - 10)
              return (
                <>
                  <GemListElement selectGem={selectNewGem} key={`gem_${gem.key}`} gem={gem} selected={gem.label === selectedGemName} />
                  <div className="-m-1" ref={nextIntersect} id="next" key={`next_${gem.key}`} />
                </>
              )
            else
              return <GemListElement selectGem={selectNewGem} key={`gem_${gem.key}`} gem={gem} selected={gem.label === selectedGemName} />
          })}
        </div>
        <div className="flex flex-col flex-shrink-0 w-48 gap-1 p-2">
          <h3>Filters</h3>
          <TextInput key="GemFilter" name="gemsearch" value={gemFilterText} onChange={handleGemsFilterChange} />
          <div>
            <input name="showSockets" type="checkbox" checked={showSockets} onChange={onCheckboxChange} />
            <label> Show Sockets</label>
          </div>
          <div>
            <input name="showActiveGems" type="checkbox" checked={showActiveGems} onChange={onCheckboxChange} />
            <label> Show active gems</label>
          </div>
          <div>
            <input name="showSupportGems" type="checkbox" checked={showSupportGems} onChange={onCheckboxChange} />
            <label> Show support gems</label>
          </div>
          <div>
            <input name="showAdvancedGems" type="checkbox" checked={showAdvancedGems} onChange={onCheckboxChange} />
            <label> Show advanced gems</label>
          </div>
          <div>
            <input name="showOnlyCurAct" type="checkbox" checked={BeforeActId} onChange={onCheckboxChange} />
            <label> Show only ≤ act ({curAct.actid})</label>
          </div>
        </div>
      </div>
    </>
  )
}

// export function LazyScrollingList(props: { items: any[], hasMore: boolean, hasLess: boolean }): JSX.Element {
//   const { items, hasMore, hasLess } = props

//   const observer = useRef({} as IntersectionObserver)

//   const prevIntersect = useCallback(
//     node => {
//       if (observer && observer.current && node) {
//         if (hasLess) observer.current.observe(node)
//         else observer.current.unobserve(node)
//       }
//     },
//     [hasLess]
//   )

//   const nextIntersect = useCallback(
//     node => {
//       if (observer && observer.current && node) {
//         if (hasMore) observer.current.observe(node)
//         else observer.current.unobserve(node)
//       }
//     },
//     [hasMore]
//   )

//   // Never be recompiled
//   useEffect(() => {
//     observer.current = new IntersectionObserver(entries => {
//       for (const entry of entries) {
//         if (entry.target.id === "next" && entry.isIntersecting) setPageNum(prev => prev + 1)
//         if (entry.target.id === "prev" && entry.isIntersecting) setPageNum(prev => prev - 1)
//       }
//     })
//     return () => {
//       if (observer.current && observer.current.disconnect) observer.current.disconnect()
//     }
//   }, [])
//   items.map((gem, i) => {
//     if (i === 4)
//       return (
//         <>
//           <div className="border-0" ref={prevIntersect} id="prev" key={`prev_${gem.key}`} />
//           <GemListElement selectGem={selectNewGem} key={`gem_${gem.key}`} gem={gem} selected={gem.name === selectedGemName} />
//         </>
//       )
//     else if (i === items.length - 3)
//       return (
//         <>
//           <GemListElement selectGem={selectNewGem} key={`gem_${gem.key}`} gem={gem} selected={gem.name === selectedGemName} />
//           <div className="border-0" ref={nextIntersect} id="next" key={`next_${gem.key}`} />
//         </>
//       )
//     else return <GemListElement selectGem={selectNewGem} key={`gem_${gem.key}`} gem={gem} selected={gem.name === selectedGemName} />
//   })
// }

export function GemListElement(props: {
  gem: IGemList
  selected: boolean
  selectGem: (e: React.SyntheticEvent<HTMLDivElement>, gemName: string) => void
}): JSX.Element {
  const { gem, selected, selectGem } = props

  return (
    <div
      onClick={e => {
        selectGem(e, gem.name)
      }}
      className={`w-gem-list-element min-w-gem-list-element max-h-gem-list-element h-gem-list-element p-1 flex-grow-0 flex-shrink-0 flex flex-row bg-gradient-to-l to-poe-96 via-transparent from-poe-97  border-poe-1 border-2  hover:border-poe-60 hover:border-2 rounded-md${
        selected ? "border-2 border-poe-50 rounded-md" : ""
      }`}>
      <div className="flex-grow-0 flex-shrink-0 w-16 h-16">
        <img className={` ${gem.is_alternateQuality === true ? "filter sepia" : ""}`} src={gem.image} />
      </div>
      <div className="flex-grow flex flex-col items-end">
        <div className="text-poe-4 text-right font-semibold">{gem.label}</div>
        <div className="flex-row flex h-full w-full items-end">
          {!gem.is_socket && (
            <div className="w-1/3 flex-grow-0">
              Lvl: <span className="text-poe-4">{gem.required_level}</span>
            </div>
          )}
          <div className="flex-grow text-right">
            {gem.currency_amount ? (
              <div className="flex fex-col gap-1 justify-end">
                Cost: <span className="text-poe-4">{gem.currency_amount}x</span>
                <img alt={gem.currency} className="h-6 w-6" src={gem.currency} />
              </div>
            ) : (
              !gem.is_socket && (
                <div>
                  Cost: <span className="text-poe-4">Drop Only</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// export function GemListElement2(props: {
//   children?: Element[]
//   gem: IGemList
//   selected: boolean
//   selectGem: (e: React.SyntheticEvent<HTMLDivElement>, gemName: string) => void
// }): JSX.Element {
//   const { children, gem, selected, selectGem } = props

//   return (
//     <div
//       onClick={e => {
//         selectGem(e, gem.name)
//       }}
//       className={`h-20 p-1 w-5/12 flex-grow-0 flex-shrink-0 flex flex-row bg-poe-96 border-poe-1 border-2 hover:border-poe-60 hover:border-2 rounded-md${
//         selected ? "border-2 border-poe-50 rounded-md" : ""
//       }`}>
//       <div className="flex-grow-0 flex-shrink-0 w-16 h-16">
//         <img className={` ${gem.isAlternateQuality === true ? "filter sepia" : ""}`} src={gem.image} />
//       </div>
//       <div className="flex-grow flex flex-col items-end">
//         <div className="text-poe-4 text-right font-semibold">{gem.label}</div>
//         <div className="flex-row flex h-full w-full items-end">
//           {!gem.is_socket && (
//             <div className="w-1/3 flex-grow-0">
//               Lvl: <span className="text-poe-4">{gem.required_level}</span>
//             </div>
//           )}
//           {children}
//         </div>
//       </div>
//     </div>
//   )
// }

/**
 *
 * @param gemsSkel
 * @param pageNum
 * @param filter
 * @param BeforeActId 0 to disable act filter
 * @param showAdvancedGems
 * @returns
 */
function useSearchGem(
  gemsSkel: IGemList[],
  // selectedGemName: string,
  pageNum: number,
  filter: string,
  BeforeActId: number,
  showSockets: boolean,
  showActiveGems: boolean,
  showSupportGems: boolean,
  showAdvancedGems: boolean
) {
  const [hasLess, setHasLess] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [gems, setGems] = useState([] as IGemList[])
  const [gemCount, setgemCount] = useState(gemsSkel.length)

  const pageLen = 60
  const delta = 12

  console.log("useSearchGem")

  const filteredGems = useMemo(() => {
    const gem = gemsSkel.filter(g => {
      if (filter) {
        const regex = new RegExp(`.*${filter}.*`, "i")
        if (!regex.test(g.name)) return false
      }
      if (!showAdvancedGems && (g.is_alternateQuality || g.is_advanced)) return false
      if (!showSupportGems && g.is_support) return false
      if (!showActiveGems && g.is_active) return false
      if (!showSockets && g.is_socket) return false
      if (BeforeActId && !g.is_socket) {
        let haveBeforeActId = false
        for (const r of g.quest_rewards)
          if (r.act <= BeforeActId) {
            haveBeforeActId = true
            break
          }
        if (haveBeforeActId === false)
          for (const r of g.vendor_rewards)
            if (r.act <= BeforeActId) {
              haveBeforeActId = true
              break
            }
        if (haveBeforeActId === false) return false
      }
      return true
    })
    setgemCount(gem.length)
    return gem
  }, [gemsSkel, filter, BeforeActId, showActiveGems, showSupportGems, showAdvancedGems, showSockets])

  useEffect(() => {
    // if (SelectGem !== selectedGemName) pageNum = Math.round((filteredGems.findIndex(g=>g.name === selectedGemName) - pageLen/2)/delta)

    let indexFin = (pageNum - 1) * delta + pageLen
    const indexDebut = pageNum * delta - delta
    if (indexFin > filteredGems.length) indexFin = filteredGems.length

    setGems(filteredGems.slice(indexDebut, indexFin))
    setHasMore(filteredGems.length > indexFin)
    setHasLess(indexDebut > 0)

    console.log("debut: %s, fin: %s, count: %s", indexDebut, indexFin, gemCount)
  }, [filteredGems, pageNum])

  // const SelectGem = useMemo(() => {
  //   return selectedGemName
  // }, [selectedGemName])

  return { gems, hasMore, hasLess, gemCount }
}
