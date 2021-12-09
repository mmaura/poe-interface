import React, { useContext, useState, useMemo, useCallback, useEffect, useRef, ChangeEventHandler, ChangeEvent } from "react"
import { mdiAllergy, mdiBookEdit, mdiBookEditOutline, mdiContentDuplicate, mdiDelete, mdiDeleteSweep, mdiPlus } from "@mdi/js"
import Icon from "@mdi/react"

import { CurActContext } from "./LevelingRenderer"

import { RichTextEditable } from "./RichTextEditable"
import { TextEditable, TextInput } from "./TextEditable"
import { Gem } from "./Components"
import { MenuBar, MenuButton, EditSaveNoteButton } from "./MenuBar"

export function ZoneGears(props: { curGuide: IClassesGuide; ClassGuideIsOnEdit: boolean; gemsSkel: IGemList[] }): JSX.Element {
  const curAct = useContext(CurActContext)
  const { curGuide, ClassGuideIsOnEdit, gemsSkel } = props

  const [actNotes, setactNotes] = useState("")
  const [isOnEdit, setisOnEdit] = useState(false)
  const [selectedGemName, setselectedGemName] = useState("")
  const [curSocketEdited, setSocketEdited] = useState({ actId: 0, gearName: "", gemIndex: 0 })

  const onGearSocketSelected = useCallback(
    (actId: number, gearName: string, gemName: string, index: number, e: React.SyntheticEvent<HTMLImageElement>) => {
      e.preventDefault()
      if (ClassGuideIsOnEdit) {
        setselectedGemName(gemName)
        setSocketEdited({ actId: actId, gearName: gearName, gemIndex: index })
      } else window.poe_interface_API.openExternal("https://www.poewiki.net/wiki/" + gemName)
    },
    [ClassGuideIsOnEdit]
  )

  const onGearGemDoubleClick = useCallback(
    (actId: number, gearName: string, gemName: string, index: number, e: React.SyntheticEvent<HTMLImageElement>) => {
      e.preventDefault()
      if (ClassGuideIsOnEdit) {
        window.poe_interface_API.sendSync("levelingRenderer", "saveClassGuide", "delGearGem", {
          actId: actId,
          gearName: gearName,
          gemIndex: index,
        })
      }
    },
    [ClassGuideIsOnEdit]
  )

  const selectNewGem = useCallback(
    (e: React.SyntheticEvent<HTMLDivElement>, newGearName: string) => {
      e.preventDefault()
      window.poe_interface_API.sendSync("levelingRenderer", "saveClassGuide", "setGearGem", curSocketEdited, newGearName)
    },
    [curSocketEdited]
  )

  const editNote = useCallback(() => {
    if (isOnEdit) window.poe_interface_API.sendSync("levelingRenderer", "saveClassGuide", "ActNotes", curAct.actid, actNotes)
    setisOnEdit(!isOnEdit)
  }, [isOnEdit, actNotes, curAct])

  const onActNoteChange = useCallback(e => {
    setactNotes(e.target.value)
  }, [])

  const curGearsAct = useMemo(() => {
    if (curGuide && curGuide.acts) {
      const _cga = curGuide.acts.find(act => act.act === curAct.actid)
      setactNotes(_cga.notes)
      return _cga
    } else return {} as IClassesGuideAct
  }, [curAct, curGuide])

  const addGear = useCallback(() => {
    window.poe_interface_API.sendSync("levelingRenderer", "saveClassGuide", "addGear", curAct.actid)
  }, [curAct.actid])

  return (
    <div className="container relative flex flex-row mb-2">
    <div className="relative flex flex-col mb-2">
      {ClassGuideIsOnEdit && (
        <MenuBar pos_x="left" pos_y="top">
          <EditSaveNoteButton isOnEdit={isOnEdit} onSave={editNote} onEdit={editNote} />
        </MenuBar>
      )}

      {ClassGuideIsOnEdit && (
        <MenuBar pos_x="right" pos_y="top">
          <MenuButton onClick={addGear} tooltip="Add new group" mdiPath={mdiPlus} />
          <MenuButton
            onClick={() => {
              return
            }}
            tooltip="Add new group"
            mdiPath={mdiContentDuplicate}
          />
        </MenuBar>
      )}

      <h2>Gears</h2>
      <div className="flex flex-col">
        {(curGearsAct.notes || isOnEdit) && ClassGuideIsOnEdit && (
          <div className={`flex-shrink-0 ${isOnEdit ? "h-32" : ""} max-h-36 overflow-y-auto relative`}>
            <RichTextEditable isOnEdit={isOnEdit} onChange={onActNoteChange}>
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
                  onGearGemDoubleClick={onGearGemDoubleClick}
                  curGemEdit={curSocketEdited}
                />
              </div>
            )
          })}
        </div>
      </div>
      </div>
      {ClassGuideIsOnEdit && curSocketEdited && (
        <GemUTility
          selectNewGem={selectNewGem}
          curGemEdit={curSocketEdited}
          gemsSkel={gemsSkel}
          selectedGemName={selectedGemName}
          key={"gem_utility"}
        />
      )}
    </div>
  )
}

function Gear(props: {
  gear: IClassesGuideGear
  ClassGuideIsOnEdit: boolean
  curActId: number
  onGearGemClick: (actId: number, gearName: string, gemName: string, index: number, e: React.SyntheticEvent<HTMLImageElement>) => void
  onGearGemDoubleClick: (actId: number, gearName: string, gemName: string, index: number, e: React.SyntheticEvent<HTMLImageElement>) => void
  curGemEdit: { actId: number; gearName: string; gemIndex: number }
}): JSX.Element {
  const { gear, ClassGuideIsOnEdit, curActId, onGearGemClick, onGearGemDoubleClick, curGemEdit } = props

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
    <div className="border-2 border-poe-1 bg-poe-96 rounded-lg p-2">
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
        <div className={`${(gear.gems ? gear.gems.length : 0) <= 3 ? "poe-item-3slots" : "poe-item-xslots"} flex-none`}>
          {gear.gems
            ? gear.gems.map((gem, index) => (
                <Gem
                  selected={curGemEdit.gemIndex === index && curGemEdit.gearName === gear.name && ClassGuideIsOnEdit}
                  key={gem.key + index}
                  curGem={gem}
                  onClick={e => {
                    onGearGemClick(curActId, gear.name, gem.name, index, e)
                  }}
                  onDoubleClick={e => {
                    onGearGemDoubleClick(curActId, gear.name, gem.name, index, e)
                  }}
                />
              ))
            : null}
        </div>
        <div className="flex-grow relative">
          <RichTextEditable isOnEdit={isGroupNoteEdit} onChange={onGroupNotesChange}>
            {groupNotes}
          </RichTextEditable>
        </div>
      </div>
    </div>
  )
}

export function GemUTility(props: {
  gemsSkel: IGemList[]
  selectedGemName: string
  curGemEdit: { actId: number; gearName: string; gemIndex: number }
  selectNewGem: (e: React.SyntheticEvent<HTMLDivElement>, gemName: string) => void
}): JSX.Element {
  const { gemsSkel, selectedGemName, curGemEdit, selectNewGem } = props

  const curAct = useContext(CurActContext)

  const [gemFilterText, setgemFilterText] = useState("")
  const [pageNum, setPageNum] = useState(1)
  const [showOnlyCurAct, setshowOnlyCurAct] = useState(true)
  const [showAdvancedGems, setshowAdvancedGems] = useState(true)
  const [showSupportGems, setshowSupportGems] = useState(false)
  
  const [actFilter, setactFilter] = useState(0)

  const { gems, hasMore, hasLess, gemCount } = useSearchGem(gemsSkel, pageNum, gemFilterText, showOnlyCurAct && actFilter, showSupportGems, showAdvancedGems)
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
  }, [showOnlyCurAct, curAct])

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
          setshowOnlyCurAct(!showOnlyCurAct)
          break
        case "showAdvancedGems":
          setshowAdvancedGems(!showAdvancedGems)
          break
          case "showSupportGems":
            setshowSupportGems(!showSupportGems)
            break
  
          
      }

    },
    [showOnlyCurAct, showAdvancedGems]
  )

  return (
    // <div className={`container relative ${curGemEdit ? "cursor-not-allowed disabled" : ""} `}>
    <div className={`container relative `}>
      <h2>Gem Utility ({gemCount})</h2>
      <MenuBar pos_x="right" pos_y="top">
        <label>Filter</label>
        <TextInput key="GemFilter" name="gemsearch" value={gemFilterText} onChange={handleGemsFilterChange} />
        <label>Only available at current act ({curAct.actid})</label>
        <input name="showOnlyCurAct" type="checkbox" checked={showOnlyCurAct} onChange={onCheckboxChange} />
        <label>show advanced gems</label>
        <input name="showAdvancedGems" type="checkbox" checked={showAdvancedGems} onChange={onCheckboxChange} />
        <label>show support gems</label>
        <input name="showSupportGems" type="checkbox" checked={showSupportGems} onChange={onCheckboxChange} />
      </MenuBar>
      {/* <div className="p-2 flex flex-row gap-2 h-11 w-2/3">
      </div> */}
      <div className="flex flex-wrap gap-2 h-72 overflow-y-scroll">
        {gems.map((gem, i) => {
          if (i === 4)
            return (
              <>
                <div className="border-0" ref={prevIntersect} id="prev" key={`prev_${gem.key}`} />
                <GemListElement selectGem={selectNewGem} key={`gem_${gem.key}`} gem={gem} selected={gem.label === selectedGemName} />
              </>
            )
          else if (i === gems.length - 3)
            return (
              <>
                <GemListElement selectGem={selectNewGem} key={`gem_${gem.key}`} gem={gem} selected={gem.label === selectedGemName} />
                <div className="border-0" ref={nextIntersect} id="next" key={`next_${gem.key}`} />
              </>
            )
          else return <GemListElement selectGem={selectNewGem} key={`gem_${gem.key}`} gem={gem} selected={gem.label === selectedGemName} />
        })}
      </div>
    </div>
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
      className={`h-20 p-1 w-5/12 flex-grow-0 flex-shrink-0 flex flex-row bg-poe-96 border-poe-1 border-2 hover:border-poe-60 hover:border-2 rounded-md${
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
 * @param showOnlyAct 0 to disable act filter
 * @param showAdvancedGems
 * @returns
 */
function useSearchGem(gemsSkel: IGemList[], pageNum: number, filter: string, showOnlyAct: number, showSupportGems: boolean, showAdvancedGems: boolean) {
  const [hasLess, setHasLess] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [gems, setGems] = useState([] as IGemList[])
  const [gemCount, setgemCount] = useState(gemsSkel.length)

  const pageLen = 30
  const delta = 6
  const regex = new RegExp(`.*${filter}.*`, "i")

  console.log("useSearchGem")
  console.log(filter, showOnlyAct, showAdvancedGems, showSupportGems)

  const filteredGems = useMemo(() => {
    let gem = gemsSkel

    if (!showAdvancedGems) gem = gem.filter(g => !(g.is_alternateQuality || g.is_advanced))
    if (!showSupportGems) gem = gem.filter(g => !(g.is_support || g.is_advanced))

    
    if (showOnlyAct)
      gem = gem.filter(g => {
        for (const r of g.quest_rewards) if (r.act <= showOnlyAct) return true
        for (const r of g.vendor_rewards) if (r.act <= showOnlyAct) return true
      })
    if (filter) gem = gem.filter(g => regex.test(g.name))

    setgemCount(gem.length)
    return gem
  }, [filter, gemsSkel, showOnlyAct, showAdvancedGems])

  useEffect(() => {
    let indexFin = (pageNum - 1) * delta + pageLen
    const indexDebut = pageNum * delta - delta
    if (indexFin > filteredGems.length) indexFin = filteredGems.length

    setGems(filteredGems.slice(indexDebut, indexFin))
    setHasMore(filteredGems.length > indexFin)
    setHasLess(indexDebut > 0)

    console.log("debut: %s, fin: %s, count: %s", indexDebut, indexFin, gemCount)
  }, [filteredGems, pageNum])

  return { gems, hasMore, hasLess, gemCount }
}
