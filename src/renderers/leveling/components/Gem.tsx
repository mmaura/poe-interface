import React, { useState, useEffect, useContext, useCallback } from "react"

import ReactTooltip from "react-tooltip"
import Icon from "@mdi/react"
import { mdiEye } from "@mdi/js"

import { ActContext, PlayerContext } from "../window"

export function ZoneGem(props: { curGuide: IGuide; curAct: IAppAct }): JSX.Element {
	const curGuide = props.curGuide
	const gems = [] as IAppGems[]
	const curPlayer = useContext(PlayerContext) as IAppPlayer
	const curAct = useContext(ActContext) as IAppAct
	const [showAll, setshowAll] = useState(false)

	if (curGuide && curGuide.acts ) {
			curGuide.acts.filter(act => act.act == curAct.actid || showAll)
			.map(act => 
				act.gears.map(gear => 
					gear.gems.map(gem => (!gems.includes(gem))? gems.push(gem):null)
				)
			)

			return (
				<div className="relative overflow-y-auto">
					<h2>Liste des courses</h2>
					<span className="absolute top-1 right-1 cursor-pointer" onClick={() => setshowAll(!showAll)}>
						<Icon
							path={mdiEye}
							size={1}
							title="Afficher tout / filtré par lvl et act"
						/>
					</span>
					{gems
						.filter(
							(gem) => Math.abs(gem.required_lvl - curPlayer.level) < 8 || showAll
						)
						.sort((a, b) => a.required_lvl - b.required_lvl)
						.map((_gem) => {
							return <LongGem key={_gem.name} gem={_gem} />
						})}
				</div>
			)
		}
	
	return <h2>Liste des courses vide</h2>
}

export function LongGem(props: { gem: IGems }): JSX.Element {
	const curGem = props.gem

	const curPlayer = useContext(PlayerContext) as IAppPlayer
	const curAct = useContext(ActContext) as IAppAct

	let curBuy = curGem.buy.filter((buy) => {
		return buy.available_to.includes(curPlayer.characterClass) && buy.act === curAct.actid 
	})

	//make sure "A Fixture of Fate" never be first if a quest alternative
	curBuy = curBuy.sort((a,b) => (a.quest_name == "A Fixture of Fate"  && a.act=== b.act)?-1:0   )

	if (curGem) {
		return (
			<div className="grid grid-cols-12 gap-1 items-center">
				{/* <div className="col-span-4 flex flex-row"> */}
				<span>lvl: {curGem.required_lvl}&nbsp;</span>
				<Gem curGem={curGem} />
				<span className="col-span-3">{curGem.name}</span>
				{/* </div> */}
				<div className="col-span-6 flex flex-col">
					{curBuy.length > 0 ? (
						curBuy.map((_buy, index) => {
							return (
								<p key={index}>
									<span className="text-poe-3">{_buy.npc}</span>&nbsp;
									<span
										className="text-poe-60 cursor-pointer"
										onClick={() => {
											window.levelingAPI.openWiki(_buy.quest_name)
										}}
									>
										{_buy.quest_name}&nbsp;
									</span>
									<span className="text-poe-3">{_buy.town}</span>
								</p>
							)
						})
					) : (
						<p>
							{/* <span> not available for your class at this act, </span> */}
							<span className="text-poe-60">Ask a friend.</span>
						</p>
					)}
				</div>
			</div>
		)
	}

	return <div></div>
}

export function Gem(props: { curGem: IGems }): JSX.Element {
	const curGem = props.curGem
	const gemClick = useCallback((e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
		e.preventDefault()
		window.levelingAPI.openExternal("https://www.poewiki.net/wiki/" + curGem.name)
	}, [])

	useEffect(() => {
		ReactTooltip.rebuild()
	}, [curGem])

	return (
		<div
			data-for={`gem` + curGem.name}
			data-tip={`gem` + curGem.name}
			data-effect="solid"
			data-place="left"
			data-delay-hide="1000"
		>
			<img
				onClick={() => window.levelingAPI.openWiki(curGem.name)}
				className="w-socket h-socket cursor-pointer"
				src={"../assets/images/gems/" + curGem.name.replace(" ", "_") + ".png"}
			/>
			<ReactTooltip id={`gem` + curGem.name} clickable>
				<h2>
					{curGem.name} - {curGem.required_lvl}
				</h2>

				{curGem.buy.map((_buy, index) => {
					return (
						<div className="grid grid-cols-3 gap-2 w-auto">
							<p key={index}>
								<span className="text-poe-3">Act: {_buy.act}&nbsp;</span>
								<span className="text-poe-3">{_buy.town}&nbsp;</span>
								<span
									className="text-poe-50 cursor-pointer"
									onClick={() => window.levelingAPI.openWiki(_buy.npc)}
								>
									{_buy.npc}
								</span>
							</p>
							<span
								className="text-poe-60 cursor-pointer"
								onClick={() => window.levelingAPI.openWiki(_buy.quest_name)}
							>
								{_buy.quest_name}
							</span>
							<span className="text-poe-50">{_buy.available_to}</span>
							<br />
						</div>
					)
				})}
			</ReactTooltip>
		</div>
	)
}
