import React, { useContext } from "react"
import ReactTooltip from "react-tooltip"

import { GetAllActs } from "../../modules/functions"
import { PlayerContext } from "../window"
import { RichText } from "./Gears"

// export function LevelingGuide(props: {curZone: IAppZone, curAct: IAppAct}): JSX.Element {
export function LevelingGuide(props: any): JSX.Element {
	const curZone: IAppZone = props.curZone
	const curAct: IAppAct = props.curAct

	const curPlayer = useContext(PlayerContext) as IAppPlayer

	function handleActChange(e: React.ChangeEvent<HTMLSelectElement>) {
		props.onActChange(e)
	}

	function handleZoneChange(e: React.ChangeEvent<HTMLSelectElement>) {
		props.onZoneChange(e)
	}

	return (
		<div className="container">
			<div className="flex flex-row flex-nowrap px-5 py-2 space-x-2">
				<select
					className="lvlg-map-feature min-w-min"
					value={curAct.actid}
					onChange={handleActChange}
				>
					{GetAllActs().map(function (act: IAppAct) {
						return (
							<option key={act.actid} value={act.actid}>
								{act.act}
							</option>
						)
					})}
				</select>

				<select
					className="lvlg-map-feature flex-grow"
					value={curZone.name}
					onChange={handleZoneChange}
				>
					{curAct.zones.map(function (zone: IAppZone) {
						return (
							<option key={zone.level + "-" + zone.name} value={zone.name}>
								{zone.name}
							</option>
						)
					})}
				</select>

				<div
					className={`lvlg-map-feature enabled text-center align-middle text-4xl  font-bold 
                ${curZone.level - curPlayer.level > 2 ? "text-yellow-500 border-yellow-500" : ""}
                ${curZone.level - curPlayer.level > 4 ? "text-red-500 border-red-500" : ""}
                ${curPlayer.level - curZone.level > 5 ? "disabled" : ""}
            `}
				>
					{curZone.level}
				</div>
				<div className={`lvlg-map-feature ${curZone.hasRecipe ? "enabled" : "disabled"}`}>
					{" "}
					<img className="w-full h-full" src="../assets/images/waypoint.png" />{" "}
				</div>
				<div className={`lvlg-map-feature ${curZone.hastrial ? "enabled" : "disabled"}`}>
					{" "}
					<img className="w-full h-full" src="../assets/images/portal.png" />{" "}
				</div>
				<div className={`lvlg-map-feature ${curZone.hastrial ? "enabled" : "disabled"}`}>
					{" "}
					<img className="w-full h-full" src="../assets/images/Offering_to_the_Goddess.png" />{" "}
				</div>
				<div className={`lvlg-map-feature ${curZone.haspassive ? "enabled" : "disabled"}`}>
					{" "}
					<img className="w-full h-full" src="../assets/images/Book_of_Skill.png" />{" "}
				</div>
			</div>
		</div>
	)
}

export function ZoneNotes(props: { curRichText: IRichText[]; curZone: IAppZone }): JSX.Element {
	const curZone = props.curZone
	const curRichText = props.curRichText

	return (
		<div className="container flex flex-col min-h-200px">
			<h2>Notes</h2>
			<div className="text-2xl">
				{curZone.note ? <RichText curRichText={curRichText} text={curZone.note} /> : null}
			</div>
			{/* <p className="text-xl">{curZone.note}</p> */}
		</div>
	)
}

export function ZoneMap(props: { curAct: IAppAct; curZone: IAppZone }): JSX.Element {
	const curZone = props.curZone
	const curAct = props.curAct

	if (curZone.image[0] !== "none" && curZone.image.length > 0) {
		return (
			<div className="container flex flex-col min-h-200px">
				<div className="">
					<h2>Navigation</h2>
				</div>
				<div className="flex flex-row flex-wrap">
					{curZone.image.map((val) => {
						const path = "../assets/images/zones/" + curAct.act + "/" + val + ".png"
						return <img key={path} className="" src={path} />
					})}
				</div>
				<div className="">
					<span>{curZone.altimage !== "none" ? curZone.altimage : ""}</span>
				</div>
			</div>
		)
	} else
		return (
			<div className="container flex flex-col min-h-200px">
				<div className="">
					<h2>Navigation</h2>
				</div>
				<div className="">
					<span>{curZone.altimage !== "none" ? curZone.altimage : ""}</span>
				</div>
			</div>
		)
}

export function LevelTips(props: any): JSX.Element {
	//const [levelTips, setlevelTips] = useState(  )

	return <div>choses a faire en fonction du level</div>
}
