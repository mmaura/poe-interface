import { app, BrowserWindow } from "electron"
import { download } from "electron-dl"
import fs from "fs"
import path from "path"

import InitialGems from "../assets/data/gems.json"
import { JsonFile } from "./JsonFile"
import winston from "winston"


export const Lang = app.getLocaleCountryCode().toLowerCase()

const myCustomLevels = {
  levels: {
    parseGuide: 0,
    importGuide: 1,
    info: 2,
    debug: 3,
    error: 4
  },
  colors: {
    parseGuide: 'blue',
    importGuide: 'green',
    info: 'yellow',
    debug: 'orange',
    error: 'red'
  }
};

export const MyLogger = winston.createLogger({
  levels: myCustomLevels.levels,
  transports: [
    // new winston.transports.File({ filename: path.join(getLocalCustomPath(), "log.log") }),
    new winston.transports.File({ filename: path.join(getLocalCustomPath(), 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(getLocalCustomPath(), 'info.log'), level: 'info' }),
    new winston.transports.File({ filename: path.join(getLocalCustomPath(), 'debug.log'), level: 'debug' }),
    new winston.transports.File({ filename: path.join(getLocalCustomPath(), 'import.log'), level: 'importGuide' }),
    new winston.transports.File({ filename: path.join(getLocalCustomPath(), 'guides.log'), level: 'parseGuide' }),
    // new winston.transports.Console(),
  ]
})

MyLogger.log('info', 'starting')
MyLogger.log('error', 'starting')
MyLogger.log('error', `detected OS lang : ${Lang}`)

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

// export function ImportPOELevelingGuide(buildPath: string): void {
//   const dirs = fs.readdirSync(buildPath, { withFileTypes: true })
//   const ActGuide = {} as IActsGuide
//   ActGuide.acts = []

//   const match = buildPath.split(path.sep)[buildPath.split(path.sep).length - 1].match(/([0-9]\.[0-9]{2})\s(\w+)\s(\w+)/)
//   MyLogger.log('importGuide', `Identity match in folder name: (${match} )`)

//   try {
//     ActGuide.identity = { game_version: Number(match[1]), class: match[2], name: match[3], lang: 'en' }
//     MyLogger.log('importGuide', `for guide : (${ActGuide.identity.game_version} - ${ActGuide.identity.class} - ${ActGuide.identity.name} - ${ActGuide.identity.lang})`)
//   }
//   catch {
//     MyLogger.log('importGuide', `unable to find name, or class, or version, defaulting..`)
//     ActGuide.identity = { game_version: 3.16, class: "Templar", name: Date.now().toString(), lang: 'en' }
//     MyLogger.log('importGuide', `for guide : (${ActGuide.identity.game_version} - ${ActGuide.identity.class} - ${ActGuide.identity.name} )`)
//   }

//   if (dirs) {
//     dirs.forEach(file => {
//       if (file.isDirectory()) {
//         try {
//           const [, act] = file.name.match(/Act\s([0-9]*)/)

//           if (act) {
//             const Zones = [] as IZone[]

//             MyLogger.log('importGuide', `|-act:${act}->(${path.join(buildPath, file.name)})`)
//             const dirss = fs.readdirSync(path.join(buildPath, file.name), { withFileTypes: true })
//             if (dirss) {
//               dirss.forEach(f => {
//                 if (f.isFile()) {
//                   if (f.name === 'notes.txt') {
//                     MyLogger.log('importGuide', `|----notes->(${path.join(buildPath, file.name, f.name)})`)
//                     const data = fs.readFileSync(path.join(buildPath, file.name, f.name))
//                     const content = `${data.toLocaleString()}\n\n`
//                     const zones = content.matchAll(/^zone:(.*?)\n(.*?)(.*?)\n\n/msg)
//                     if (zones) {
//                       try {
//                         for (const zone of zones) {
//                           MyLogger.log('importGuide', `|---------Zone->(${zone[1]})`)
//                           Zones.push({ name: zone[1], note: zone[3] })
//                         }
//                       }
//                       catch (e) {
//                         MyLogger.log('importGuide', `|-------////---> Error when try to iterate (${zones})`)
//                       }
//                     }
//                   }
//                 }
//               })
//             }
//             ActGuide.acts.push({ actid: Number(act), zones: Zones })
//           }
//         }
//         catch(e){
//           MyLogger.log('importGuide', `|-////->(${path.join(buildPath, file.name)})`)

//         }
//       }
//     })
//   }
// }
