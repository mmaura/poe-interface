import InitialAct from "../../assets/data/acts.json"
import InitialClasses from "../../assets/data/classes.json"
import InitialGems from "../../assets/data/gems.json"

export function getCharacterClass(characterClass: string): string {
	const _character = InitialClasses.find((e) => {
		if (e.classe === characterClass || e.ascendancy.includes(characterClass)) return true
	})
	return _character.classe
}

export function findGem(name: string): IGems {
	return InitialGems.find((e) => {
		return e.name === name
	})
}

export function getCurZone(actID: number, zoneID: string): IAppZone {
	const curAct = getCurAct(actID)
	let curZone

	if (zoneID !== "") {
		curZone = curAct.zones.find((e) => {
			return e.name === zoneID
		})
	}

	if (curZone === undefined) {
		return curAct.zones[0]
	} else {
		return curZone
	}
}

export function getCurAct(actid: number): IAppAct {
	const _curAtct = InitialAct.find((e) => {
		return e.actid === actid
	})
	return _curAtct
}

export function GetAllActs(): IActs[] {
	return InitialAct
}
