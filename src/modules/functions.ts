import path from "path"
import { app, BrowserWindow } from "electron"
import { download } from "electron-dl"

import InitialGems from "../assets/data/gems.json"
import fs from "fs"

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
			dldFiles ++
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
