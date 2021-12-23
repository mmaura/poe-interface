import { app } from "electron"
import fs from "fs"
import path from "path"

import { JsonFile } from "./JsonFile"
import winston from "winston"

export const Lang = app.getLocaleCountryCode().toLowerCase()

export const MyLogger = winston.createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    importGuide: 3
  },
  transports: [
    new winston.transports.File({ filename: path.join(getLocalCustomPath(), 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(getLocalCustomPath(), 'info.log'), level: 'info' }),
    new winston.transports.File({ filename: path.join(getLocalCustomPath(), 'import.log'), level: 'importGuide' }),
    new winston.transports.Console({ level: 'error' }),
  ]
})

MyLogger.log('info', 'starting')
MyLogger.log('error', 'starting')
MyLogger.log('error', `detected OS lang : ${Lang}`)

/**
 * 
 * @param filename filename without extension
 * @param returnFullname return filename with path or only ext default: ext
 * @param exts extension to try to find in order
 * @returns the find extension without the filename
 */
export function FindFileExt(filename: string, returnFullname?: boolean, exts?: string[]): string {
  if (!exts) exts = [".png", ".jpg"]

  for (const ext of exts) if (fs.existsSync(`${filename}${ext}`)) return returnFullname ? `${filename}${ext}` : ext

  return undefined
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
 * @returns userdata asset path
 */
export function getLocalCustomPath(): string {
  return path.join(app.getPath("userData"), "custom")
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









/**
 * Dev utils
 */
// export async function DlAllGemImg(win: BrowserWindow): Promise<void> {
//   let dldFiles = 0

//   for (const gem of InitialGems) {
//     const directory = path.join(getAbsPackagedPath(), "images", "gems")
//     const filename = gem.name.replace(" ", "_") + ".png"

//     if (!fs.existsSync(path.join(directory, filename))) {
//       dldFiles++
//       const fileUrl = gem.iconPath

//       await download(win, fileUrl, {
//         filename: filename,
//         directory: directory,
//         showBadge: true,
//       })
//     }
//   }
//   console.log("downloaded: %d , total: %d", dldFiles, InitialGems.length)
// }

export function extractActsBaseGuide(): void {
  const _defaultActGuide = new JsonFile<IActsGuide>(path.join(getAbsPackagedPath(), "data", "full_guide.json"))
  _defaultActGuide.Init()
  const dstActGuide = {} as IActsGuide
  dstActGuide.identity = {} as GuidesIdentity
  dstActGuide.acts = [] as IActsGuideAct[]

  Object.assign(dstActGuide.identity, _defaultActGuide.getObject().identity)
  dstActGuide.identity.name = "base"

  _defaultActGuide.getObject().acts.forEach((act: IActsGuideAct) => {
    const _act = {} as IActsGuideAct
    _act.actName = act.actName
    _act.actId = act.actId
    _act.zones = [] as IActsGuideZone[]
    act.zones.forEach(zone => {
      const _zone = {} as IActsGuideZone
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
    fs.writeFileSync(path.join(getAbsPackagedPath(), "actsguides", "default", "test_base.json"), JSON.stringify(dstActGuide, null, 2))
  })
}

export function extractActsCustomGuide(): void {
  const _defaultActGuide = new JsonFile<IActsGuide>(path.join(getAbsPackagedPath(), "data", "full_guide.json"))
  _defaultActGuide.Init()

  const dstActGuide = {} as IActsGuide
  dstActGuide.identity = {} as GuidesIdentity
  dstActGuide.acts = [] as IActsGuideAct[]

  Object.assign(dstActGuide.identity, _defaultActGuide.getObject().identity)
  dstActGuide.identity.name = "default"

  _defaultActGuide.getObject().acts.forEach((act: IActsGuideAct) => {
    const _act = {} as IActsGuideAct
    _act.actName = act.actName
    _act.actId = act.actId
    _act.zones = [] as IActsGuideZone[]
    act.zones.forEach(zone => {
      const _zone = {} as IActsGuideZone
      _zone.altimage = zone.altimage
      // _zone.image = zone.image
      _zone.name = zone.name
      _zone.note = zone.note
      _act.zones.push(_zone)
    })
    dstActGuide.acts.push(_act)
    fs.writeFileSync(path.join(getAbsPackagedPath(), "actsguides", "default", "test_custom.json"), JSON.stringify(dstActGuide, null, 2))
  })
}















