import React, { useState, useEffect, useCallback, useLayoutEffect } from "react"
import * as ReactDOM from "react-dom"

import "../index.css"
import "./index.css"

import { Player, LevelingGuide, ZoneNotes, ZoneMap, SkillTree, ZoneGem, ZoneGears } from "./Components"

import { getCurAct, getCurZone } from "../modules/functions"
import { IpcRendererEvent } from "electron"

export const PlayerContext = React.createContext({} as IAppPlayer)
export const ActContext = React.createContext({} as IAppAct)

function App(props: { Init: any }) {
	const [curAct, setcurAct] = useState(getCurAct(1))
	const [curZone, setcurZone] = useState({} as IAppZone)

	const [curPlayer, setcurPlayer] = useState(props.Init[3] as IAppPlayer)
	// const [curGuide, setcurGuide] = useState(props.Init[1] as IGuide)
	const curGuide = props.Init[1] as IGuide

	const [curRichText, setcurRichText] = useState(props.Init[0] as IRichText[])

	/*********************************
	 * Events
	 */
	const onActChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		setcurAct(getCurAct(Number(e.target.value)))
	}, [])

	const onZoneChange = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			setcurZone(getCurZone(curAct.actid, e.target.value))
		},
		[curAct]
	)
	/**********************************
	 * Effects
	 */
	useEffect(() => {
		setcurZone(getCurZone(curAct.actid, ""))
	}, [curAct])

	/**********************************
	 * IPC
	 */
	window.poe_interfaceAPI.receive("player", (e, arg) => {
		console.log("receive async player")
		setcurPlayer(arg)
	})

	window.poe_interfaceAPI.receive("playerArea", (e, arg) => {
		console.log("receive async Area")
		const _curAct = getCurAct(arg.currentZoneAct)
		setcurAct(_curAct)
		setcurZone(getCurZone(_curAct.actid, arg.currentZoneName))
	})

	return (
		<div className="p-4">
			<ActContext.Provider value={curAct}>
				<PlayerContext.Provider value={curPlayer}>
					<div className="flex flex-row flex-nowrap pb-0">
						<div className="flex-grow-0">
							<Player />
							<h1>{curAct.act + curAct.actid + " : " + curZone.name}</h1>
						</div>
						<div className="flex-grow">
							<LevelingGuide
								onActChange={onActChange}
								onZoneChange={onZoneChange}
								curAct={curAct}
								curZone={curZone}
							/>
						</div>
					</div>

					<div className="grid grid-cols-6 gap-2">
						<div className="col-span-3">
							<ZoneMap curZone={curZone} curAct={curAct} />
						</div>
						<div className="container col-span-3 row-span-3 min-w-650px">
							<ZoneGears curGuide={curGuide} curAct={curAct} curRichText={curRichText} />
							<ZoneGem curGuide={curGuide} curAct={curAct} />
						</div>
						<div className="col-span-3">
							<ZoneNotes curZone={curZone} curRichText={curRichText} />
						</div>
						<div className="col-span-3">
							<SkillTree  curGuide={curGuide} curAct={curAct}/>
						</div>
					</div>
				</PlayerContext.Provider>
			</ActContext.Provider>
		</div>
	)
}

window.poe_interfaceAPI.sendSync("Init", "get").then((e) => {
	// console.log("then ", e)
	ReactDOM.render(<App Init={e} />, document.getElementById("root"))
})
