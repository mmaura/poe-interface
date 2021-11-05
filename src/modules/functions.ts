import { app, BrowserWindow, dialog } from "electron"
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
  try {
    const dataFile = fs.readFileSync(filename)
    const Json = JSON.parse(dataFile.toLocaleString())
    return Json
  } catch (error: any) {
    dialog.showMessageBox(null, {
      message: `une erreur est survenue au chargement du fichier :`,
      detail: `\n ${filename}.\n\n ${error.message}`,
      title: "Erreur de chargement Json",
      type: "error",
    })
    return null
  }

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


export function extractGuide(): void {
  const _defaultActGuide = loadJson("/home/mmaura/Sources/poe-interface/src/assets/actsguides/default/guide.json") as IActsGuide
  const dstActGuide = {} as IActsGuide
  dstActGuide.identity = {} as ActGuideIdentity
  dstActGuide.acts = [] as IAct[]

  Object.assign(dstActGuide.identity, _defaultActGuide.identity)
  dstActGuide.identity.name = "default-fr"

  _defaultActGuide.acts.forEach(act => {
    const _act = {} as IAct
    _act.act = act.act
    _act.actid = act.actid
    _act.zones = [] as IZone[]
    act.zones.forEach(zone => {
      const _zone = {} as IZone
      _zone.hasRecipe = zone.hasRecipe
      _zone.hasWaypoint = zone.hasWaypoint
      _zone.haspassive = zone.haspassive
      _zone.hastrial = zone.hastrial
      _zone.level = zone.level
      _zone.name = zone.name
      _zone.quest = zone.quest
      _zone.questRewardsSkills = zone.questRewardsSkills
      _zone.recipe = zone.recipe
      _act.zones.push(_zone)
    })
    dstActGuide.acts.push(_act)
    fs.writeFileSync("/home/mmaura/Sources/poe-interface/src/assets/actsguides/default/test.json", JSON.stringify(dstActGuide,null, 2))
  })
}