import React, { useState, useEffect, useContext } from "react"
import { Gem } from "./Gem"
import Icon from "@mdi/react"
import { mdiReload } from "@mdi/js"

export function ZoneGears(props: {
	curRichText: IRichText[]
	curGuide: IGuide
	curAct: IAppAct
}): JSX.Element {
	const curAct = props.curAct
	const curRichText = props.curRichText
	const curGearsAct = props.curGuide.acts.find((act) => act.act == curAct.actid)

	return (
		<div className="relative flex flex-col min-h-200px mb-2">
			<h2>Gears</h2>
			<span
				className="absolute top-1 right-1 cursor-pointer"
				onClick={() => window.levelingAPI.send("guide", "reload")}
			>
				<Icon path={mdiReload} size={1} title="Recharger tous les jsons" />
			</span>
			{curGearsAct && curGearsAct.gears ? (
				<div>
					{curGearsAct.notes ? (
						<RichText curRichText={curRichText} text={curGearsAct.notes} />
					) : null}

					<div className="flex flex-row flex-wrap gap-2 items-start">
						{curGearsAct.gears.map((gear, index) => {
							return (
								<div className="max-w-xs">
									<Gear key={gear.name + index} gear={gear} curRichText={curRichText} />
								</div>
							)
						})}
					</div>
				</div>
			) : null}
		</div>
	)
}

function Gear(props: { gear: Gear ,	curRichText: IRichText[]
}): JSX.Element {
	const gear = props.gear
	const curRichText = props.curRichText


	console.log(gear)

	return (
		<div className="border-2 border-poe-99 rounded-lg p-2">
			<p>{gear.name}</p>
			<div className="flex flex-row gap-2 ">
				<div
					className={`${
						(gear.gems ? gear.gems.length : 0) + (gear.chasses ? gear.chasses.length : 0) <= 3
							? "poe-item-3slots"
							: "poe-item-xslots"
					} flex-none`}
				>
					{gear.gems ? gear.gems.map((gem, index) => <Gem key={gem.name+index} curGem={gem} />) : null}
					{gear.chasses ? gear.chasses.map((color, index) => (
								<div className={`poe-${color}-socket`} key={color + index}></div>)): null}
				</div>
				{gear.notes?<div className="flex-grow"><RichText curRichText={curRichText} text={gear.notes}/></div>:null}
			</div>
		</div>
	)
}

export function RichText(props: { curRichText: IRichText[]; text: string }): JSX.Element {
	let text = props.text
	const curRichText = props.curRichText

	if (curRichText) {
		for (const filtre of curRichText) {
			//TODO: \\0 don t work if it the last work ... find a way to hilight
			const str = filtre.data.join("|")
			const regex = new RegExp( `(${str})\\b`, 'gi')
			// console.log(regex)
			const subst = `<span class='richtext-${filtre.classe}'>$1</span>`
			text = text.replace(regex, subst)
			// console.log(text)
		}
	}
	// console.log("Substitution result: ", text)

	if (text) return <p dangerouslySetInnerHTML={{ __html: text }} />
	else return null
}
