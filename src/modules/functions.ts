import { app, BrowserWindow } from "electron"
import { download } from "electron-dl"
import fs from "fs"
import path from "path"

import InitialGems from "../assets/data/gems.json"
import { JsonFile } from "./JsonFile"
import winston from "winston"


export const MyLogger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: path.join(getLocalCustomPath(), "log.txt") }),
    new winston.transports.Console(),
    ]
})

MyLogger.log('info', 'starting')

export function findGem(name: string): IGems {
  return InitialGems.find(e => {
    return e.name === name
  })
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



/**
 * Dev utils
 */
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


export function extractActsBaseGuide(): void {
  const _defaultActGuide = new JsonFile<IActsGuide>(path.join(getAssetPath(), "data", "full_guide.json"))
  _defaultActGuide.load()
  const dstActGuide = {} as IActsGuide
  dstActGuide.identity = {} as GuideIdentity
  dstActGuide.acts = [] as IAct[]

  Object.assign(dstActGuide.identity, _defaultActGuide.getObject().identity)
  dstActGuide.identity.name = "base"

  _defaultActGuide.getObject().acts.forEach((act: IAct) => {
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
      _zone.image = zone.image
      _act.zones.push(_zone)
    })
    dstActGuide.acts.push(_act)
    fs.writeFileSync(path.join(getAssetPath(), "actsguides", "default", "test_base.json"), JSON.stringify(dstActGuide, null, 2))
  })
}

export function extractActsCustomGuide(): void {
  const _defaultActGuide = new JsonFile<IActsGuide>(path.join(getAssetPath(), "data", "full_guide.json"))
  _defaultActGuide.load()

  const dstActGuide = {} as IActsGuide
  dstActGuide.identity = {} as GuideIdentity
  dstActGuide.acts = [] as IAct[]

  Object.assign(dstActGuide.identity, _defaultActGuide.getObject().identity)
  dstActGuide.identity.name = "default"

  _defaultActGuide.getObject().acts.forEach((act: IAct) => {
    const _act = {} as IAct
    _act.act = act.act
    _act.actid = act.actid
    _act.zones = [] as IZone[]
    act.zones.forEach(zone => {
      const _zone = {} as IZone
      _zone.altimage = zone.altimage
      // _zone.image = zone.image
      _zone.name = zone.name
      _zone.note = zone.note
      _act.zones.push(_zone)
    })
    dstActGuide.acts.push(_act)
    fs.writeFileSync(path.join(getAssetPath(), "actsguides", "default", "test_custom.json"), JSON.stringify(dstActGuide, null, 2))
  })
}















/**
 * 
 * @returns the base absolute path of the packaged assets files
 */
export function getAbsPackagedPath(): string {
  return app.isPackaged
    ? path.resolve(path.join(process.resourcesPath, "app", ".webpack", "renderer", "assets"))
    : path.resolve(path.join(app.getAppPath(), ".webpack", "renderer", "assets"))
}

/**
 * 
 * @returns the web base path of the packaged assets files
 */
export function getPackagedWebBaseName(): string {
  return 'assets'
}

/**
 * 
 * @returns the base absolute path of the custom assets files
 */
export function getAbsCustomPath(): string {
  return path.resolve(path.join(app.getPath("userData"), "custom"))
}

/**
 * 
 * @returns the web base path of the custom assets files
 */
export function getCustomWebBaseName(): string {
  return "userdata://"

}

// export function debugMsg(msg: string): void {
//   if (!app.isPackaged) {
//     console.log(`=> ${msg}`)
//   }
// }

// export function errorMsg(msg: string): void {
//   const _msg = `${msg}`
//   debugMsg(_msg)
//   throw new Error(_msg);
// }