import path from "path"
import { app, BrowserWindow } from "electron"
import { download } from "electron-dl"

import InitialGems from "../assets/data/gems.json"
import fs from "fs"
import { findGem } from "../renderers/modules/functions"

export function loadJsonGuide(guidename?: string): IGuide {
	let guide = {} as IGuide
	let guidePath = ""
	let assetPath = ""

	if (guidename === undefined) {
		guidePath = path.join(getAssetPath(), "classguides", "default")
		assetPath = "../assets/classguides/default/"
	} else {
		//TODO: load a custom guide
		guidePath = path.join(getAssetPath(), "classguides", "default")
		assetPath = "../assets/classguides/default/"
	}

	const dataFile = fs.readFileSync(path.join(guidePath, "guide.json"))
	guide = JSON.parse(dataFile.toLocaleString())


	guide.acts.forEach((act) => {
		act.treeimage = assetPath + "/tree-" + act.act + ".png"
		act.gears.forEach((gear) => {
			gear.gems = [] as IAppGems[]
			if (gear.gem_info)
				gear.gem_info.forEach(({ name }) => {
					gear.gems.push(findGem(name))
				})
		})
	})



	return guide
}

export function loadJsonRichText(acts: IAppAct[], file?: string): IRichText[] {
	let richTextJson = [] as IRichText[]

	if (file === undefined) {
		const dataFile = fs.readFileSync(path.join(getAssetPath(), "data", "richtext.json"))
		richTextJson = JSON.parse(dataFile.toLocaleString())
	} else {
		//TODO: load a custom guide
		richTextJson = [] as IRichText[]
	}

	for (const act of acts) {
		richTextJson.find((text) => text.classe === "zones").data.push(act.act)
		for (const zone of act.zones)
			richTextJson.find((text) => text.classe === "zones").data.push(zone.name)
	}

	return richTextJson
}

export function loadJsonAct(file?: string): IAppAct[] {
	let ActJson = [] as IAppAct[]

	if (file === undefined) {
		const dataFile = fs.readFileSync(path.join(getAssetPath(), "data", "acts.json"))
		ActJson = JSON.parse(dataFile.toLocaleString())
	} else {
		//TODO: load a custom guide
		ActJson = [] as IAppAct[]
	}
	return ActJson
}

export function getAssetPath(): string {
	//process.env.MY_ENV_VAR === 'production'
	const _AssetPath = app.isPackaged
		? path.join(process.resourcesPath, "app", ".webpack", "renderer", "assets")
		: path.join(app.getAppPath(), ".webpack", "renderer", "assets")

	return _AssetPath
}

export async function DlAllGemImg(win: BrowserWindow) {
	const nbGem = InitialGems.length
	let dldFiles = 0

	for (const gem of InitialGems) {
		const directory = path.join(getAssetPath(), "images", "gems")
		const filename = gem.name.replace(" ", "_") + ".png"

		if (!fs.existsSync(path.join(directory, filename))) {
			dldFiles++
			const fileUrl = gem.iconPath
			// console.log("%s => %s", filename, fileUrl)

			await download(win, fileUrl, {
				filename: filename,
				directory: directory,
				showBadge: true,
			})
		}
	}
	console.log("downloaded: %d , total: %d", dldFiles, InitialGems.length)
}
// async function downloadFile(url: string, path: string) {
// 	const res = await fetch(url)
// 	const fileStream = fs.createWriteStream(path)
// 	await new Promise((resolve, reject) => {
// 		res.body.pipe(fileStream)
// 		res.body.on("error", reject)
// 		fileStream.on("finish", resolve)
// 	})
// }
