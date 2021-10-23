import React, { useState, useEffect } from "react"
import * as ReactDOM from "react-dom"

import "../index.css"
import "./index.css"

import Player from "./components/Player"
import { LevelingGuide, ZoneNotes, ZoneMap } from "./components/LevelingGuide"
import { ZoneGears } from "./components/Gears"
import { ZoneGem } from "./components/Gem"
import { ZoneMenu } from "./components/Menu"

import { getCurAct, getCurZone } from "../modules/functions"

export const PlayerContext = React.createContext({})
export const ActContext = React.createContext({})

function App() {
	const [curPlayer, setcurPlayer] = useState({
		characterAscendancy: "unknown",
		characterClass: "unknown",
		currentZoneAct: 1,
		currentZoneName: "",
		level: 1,
		name: "Loading ...",
	} as IAppPlayer)

	const [curAct, setcurAct] = useState(() => {
		return getCurAct(1)
	})
	const [curZone, setcurZone] = useState(() => {
		return getCurZone(curAct.actid, "")
	})
	const [curGuide, setcurGuide] = useState(() => {
		return undefined as IGuide
	})
	const [curRichText, setcurRichText] = useState(undefined as IRichText[])

	/*********************************
	 * Events
	 */
	function onActChange(e: React.ChangeEvent<HTMLSelectElement>) {
		setcurAct(getCurAct(Number(e.target.value)))
	}

	function onZoneChange(e: React.ChangeEvent<HTMLSelectElement>) {
		setcurZone(getCurZone(curAct.actid, e.target.value))
	}

	/**********************************
	 * Effects
	 */

	useEffect(() => {
		setcurZone(getCurZone(curAct.actid, ""))
	}, [curAct])

	/**********************************
	 * IPC
	 */
	window.levelingAPI.receive("richText", (e, arg)=>{
		setcurRichText(arg)
	})
	window.levelingAPI.receive("player", (e, arg) => {
		setcurPlayer(arg)
	})

	window.levelingAPI.receive("guide", (e, arg) => {
		setcurGuide(arg)
	})

	window.levelingAPI.receive("playerArea", (e, arg) => {
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
							{curPlayer?<Player />:null}
							<h1>{curAct.act + " : " + curZone.name}</h1>
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
						{/* <div className="col-span-6">
            <ZoneMenu curGuide={curGuide}   />
            </div> */}
						<div className="col-span-6">
							<ZoneMap curZone={curZone} curAct={curAct} />
						</div>
						<div className="col-span-3">
							<ZoneNotes curZone={curZone} curRichText={curRichText} />
						</div>
						{(curGuide) ? (
							<div className="container col-span-3">
								<ZoneGears curGuide={curGuide} curAct={curAct} curRichText={curRichText} />
								<ZoneGem curGuide={curGuide} curAct={curAct} />
							</div>
						) : null}
						{/* <div className="container col-span-3">
              <ZoneGem curGuide={curGuide}  />
            </div>
            <div className="container col-span-3">
              <h2>Progression du personnage</h2>
            </div> */}
					</div>
				</PlayerContext.Provider>
			</ActContext.Provider>
		</div>
	)

}

ReactDOM.render(<App />, document.getElementById("root"))


