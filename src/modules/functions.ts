import { app, BrowserWindow } from "electron"
import { download } from "electron-dl"
import fs from "fs"
import path from "path"

import InitialGems from "../assets/data/gems.json"

export function findGem(name: string): IGems {
  return InitialGems.find(e => {
    return e.name === name
  })
}

export function loadJsonClasses(): IClasses[] {
  const dataFile = fs.readFileSync(path.join(getAssetPath(), "data", "classes.json"))
  return JSON.parse(dataFile.toLocaleString())
}

export function loadJsonRichText(acts: IActsGuide): IRichText[] {
  const richTextJson = loadJson(path.join(getAssetPath(), "data", "richtext.json")) as IRichText[]

  for (const act of acts.acts) {
    richTextJson.find(text => text.classe === "zones").data.push(act.act)
    for (const zone of act.zones) richTextJson.find(text => text.classe === "zones").data.push(zone.name)
  }
  return richTextJson
}

export function loadJsonAct(file?: string): IActsGuide {
  let ActJson = {} as IActsGuide

  if (file === undefined) {
    ActJson = loadJson(path.join(getAssetPath(), "data", "acts.json"))
  } else {
    //TODO: load a custom guide
    ActJson = {} as IActsGuide
  }
  return ActJson
}

export function loadJson(filename: string): any {
  const dataFile = fs.readFileSync(filename)
  const Json = JSON.parse(dataFile.toLocaleString())
  return Json
}

export function getAssetPath(): string {
  const _AssetPath = app.isPackaged
    ? path.join(process.resourcesPath, "app", ".webpack", "renderer", "assets")
    : path.join(app.getAppPath(), ".webpack", "renderer", "assets")

  return _AssetPath
}

/**
 *
 * @returns userdata asset path
 */
export function getLocalCustomPath(): string {
  return path.join(app.getPath("userData"), "custom")
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
