import { MenuItem, nativeImage, NativeImage, dialog } from "electron"
import { ActsZonesSkeleton, FindFileExt, getAbsPackagedPath, MyLogger } from "./functions"
import { Guides } from "./Guides"
import path from 'path'
import fs from 'fs'
import { JsonFile } from "./JsonFile"

export class ActsGuides extends Guides<IActsGuide> {
  protected CurGuide: IActsGuide
  protected CurMergedGuide: IActsGuide
  Icon: NativeImage
  // private DefaultZones: JsonFile<IActsGuide>

  constructor () {
    super("actsguides")
    this.Icon = nativeImage.createFromPath(path.join(getAbsPackagedPath(), "/images/arrow-right-bold.png"))
  }

  async selectGuide(defaultGuideFilename?: string): Promise<void> {
    super.selectGuide(defaultGuideFilename).then(() => this.MergeGuide())
  }

  getCurMergedGuide(): IActsGuide {
    return this.CurMergedGuide
  }

  parseCurGuide(): void {
    if (this.CurGuide.acts) for (const act of this.CurGuide.acts) {
      if (act.zones) for (const zone of act.zones) {
        if (zone.image) for (const index in zone.image) {
          const ext = FindFileExt(path.join(this.CurGuide.identity.sysAssetPath, act.actid.toString(), zone.image[index]))
          if (ext) zone.image[index] = `${zone.image[index]}${ext}`
          else MyLogger.log('info', `image ${path.join(this.CurGuide.identity.sysAssetPath, act.actid.toString(), zone.image[index])} not found`)
        }
      }
      else MyLogger.log('info', `no zone found in act: ${act.actid}`)
    }
    else MyLogger.log('info', "no acts found in guide")
  }

  async MergeGuide(): Promise<void> {
    delete this.CurMergedGuide
    this.CurMergedGuide = JSON.parse(JSON.stringify(this.CurGuide))

    if (ActsZonesSkeleton.getObject()) for (const defaultAct of ActsZonesSkeleton.getObject().acts) {
      let act = this.CurMergedGuide.acts.find(a => a.actid === defaultAct.actid)
      if (!act) {
        MyLogger.log("info", `act ${defaultAct.actid} ${defaultAct.act} not found in actsGuide defaulting.`)
        this.CurMergedGuide.acts.push(act = { actid: defaultAct.actid, act: defaultAct.act, zones: [] } as IActsGuideAct)
      }

      if (defaultAct.zones) for (const defaultZone of defaultAct.zones) {
        let zone = act.zones.find(z => z.name === defaultZone.name)
        if (!zone) {
          MyLogger.log("info", `zone ${defaultZone.name} not found in actsGuide defaulting.`)
          act.zones.push(zone = { name: defaultZone.name, note: "" } as IActsGuideZone)
        }

        zone.hasRecipe = defaultZone.hasRecipe
        zone.hasWaypoint = defaultZone.hasWaypoint
        zone.haspassive = defaultZone.haspassive
        zone.hastrial = defaultZone.hastrial
        zone.level = defaultZone.level

        if (!zone.image) zone.image = []
        else for (const img in zone.image) {
          zone.image[img] = `${this.getCustomWebBaseName()}/${act.actid}/${zone.image[img]}`
        }

        if ((defaultZone.image) && (defaultZone.image.length > 0)) {
          for (const img of defaultZone.image) {
            zone.image.push(`assets/images/zones/${act.actid}/${img}.png`)
          }
        }
      }
    }
    else MyLogger.log('error', 'No default zone loader')
    // this.emit("GuideMerged", this.CurGuide)
  }

  AppendMenu(menu: MenuItem): void {
    let mustAppendSeparator = true
    super._AppendMenu(menu)

    const Identities = this.getIdentities().sort(t => (t.readonly === true) ? -1 : 1)
    if (Identities) Identities.forEach((_identity: ActGuideIdentity) => {
      if (mustAppendSeparator && !(_identity.readonly === true)) {
        mustAppendSeparator = false
        const _menu = new MenuItem({ type: "separator" })
        menu.submenu.append(_menu)
      }

      MyLogger.info(`Add menu ${_identity.filename}`)
      const _menu = new MenuItem({
        label: this.getGuideLabel(_identity.filename),
        icon: _identity.filename === this.getGuideId() ? this.Icon : undefined,
        id: `${_identity.filename}`,
        click: () => {
          this.selectGuide(_identity.filename)
        },
      })
      menu.submenu.append(_menu)
    })
  }

  async saveCurGuide(): Promise<void> {
    super.saveGuide(this.CurGuide)
  }

  async SaveZoneNote(actid: number, zonename: string, zonenote: string): Promise<void> {
    this.getZoneByActAndZonename(this.getActByID(actid), zonename).note = zonenote

    this.saveCurGuide().then(() => {
      this.MergeGuide().then(() => {
        this.emit("GuideContentChanged", this.CurGuide)
      })
    })
  }

  async SaveNavigationNote(actid: number, zonename: string, altimage: string): Promise<void> {
    this.getZoneByActAndZonename(this.getActByID(actid), zonename).altimage = altimage
    this.saveCurGuide().then(() => {
      this.MergeGuide().then(() => {
        this.emit("GuideContentChanged", this.CurGuide)
      })
    })
  }

  getActByID(actid: number): IActsGuideAct {
    let act = this.CurGuide.acts.find(act => act.actid === actid)
    if (!act) this.CurGuide.acts.push(act = { actid: actid, zones: [] as IActsGuideZone[] } as IActsGuideAct)
    return act
  }

  getZoneByActAndZonename(act: IActsGuideAct, zonename: string): IActsGuideZone {
    let zone = act.zones.find(zone => zonename === zone.name)
    if (!zone) act.zones.push(zone = { name: zonename } as IActsGuideZone)
    return zone
  }

  ImportPOELevelingGuide(buildPath: string): void {
    const dirs = fs.readdirSync(buildPath, { withFileTypes: true })
    const ActGuide = {} as IActsGuide
    ActGuide.acts = []

    const ZonesMod = new JsonFile<IActsGuide>(path.join(getAbsPackagedPath(), "data", "zones.json"))
    ZonesMod.Init()


    const match = buildPath.split(path.sep)[buildPath.split(path.sep).length - 1].match(/([0-9]\.[0-9]{2})\s(\w+)\s(\w+)/)
    MyLogger.log('importGuide', `Identity match in folder name: (${match} )`)

    try {
      ActGuide.identity = { game_version: Number(match[1]), name: match[3], lang: 'en' }
      MyLogger.log('importGuide', `for guide : (${ActGuide.identity.game_version} - ${ActGuide.identity.name} - ${ActGuide.identity.lang})`)
    }
    catch {
      MyLogger.log('importGuide', `unable to find name, or class, or version, defaulting..`)
      ActGuide.identity = { game_version: 3.16, name: Date.now().toString(), lang: 'en' }
      MyLogger.log('importGuide', `for guide : (${ActGuide.identity.game_version}  - ${ActGuide.identity.name} )`)
    }

    if (dirs) {
      dirs.forEach(file => {
        if (file.isDirectory()) {
          try {
            const [, act] = file.name.match(/Act\s([0-9]*)/)

            if (act) {
              const actid = Number(act)
              const Zones = [] as IActsGuideZone[]

              MyLogger.log('importGuide', `|-act:${actid}->(${path.join(buildPath, file.name)})`)
              const dirss = fs.readdirSync(path.join(buildPath, file.name), { withFileTypes: true })
              if (dirss) {
                dirss.forEach(f => {
                  if (f.isFile()) {
                    if (f.name === 'notes.txt') {
                      MyLogger.log('importGuide', `|----notes->(${path.join(buildPath, file.name, f.name)})`)
                      const data = fs.readFileSync(path.join(buildPath, file.name, f.name))
                      const content = `${data.toLocaleString()}\n\n`
                      const zones = content.matchAll(/^zone:(.*?)\n(.*?)(.*?)\n\n/msg)
                      if (zones) {
                        try {
                          for (const zone of zones) {
                            let zoneName = ""

                            if (zone[1] === "The Crypt")
                              if (actid === 2) zone[1] = "The Crypt Level 1"
                              else if (actid === 7) zone[1] = "The Crypt"

                            if (zone[1] === "The Crypt 2") zone[1] = "The Crypt"

                            if (ZonesMod.getObject().acts.find(a => a.actid === actid).zones.find(z => z.name === zone[1]) !== undefined)
                              zoneName = zone[1]
                            else if (ZonesMod.getObject().acts.find(a => a.actid === actid).zones.find(z => z.name === `The ${zone[1]}`) !== undefined)
                              zoneName = `The ${zone[1]}`
                            else if (ZonesMod.getObject().acts.find(a => a.actid === actid).zones.find(z => z.name === `The ${zone[1]} Level 1`) !== undefined)
                              zoneName = `The ${zone[1]} Level 1`

                            else
                              MyLogger.log('importGuide', `|--//-Not found-//-->(${zone[1]})`)

                            if (zoneName !== "") {
                              MyLogger.log('importGuide', `|---------Zone->(${zoneName})`)
                              let _zone
                              if ((_zone = Zones.find(a => a.name === zoneName))) {
                                MyLogger.log('importGuide', `|----duplicate->(${zoneName}) concat notes`)
                                _zone.note.concat(`\n\n${zone[3]} `)
                              }
                              else
                                Zones.push({ name: zoneName, note: zone[3] })
                            }
                          }
                        }
                        catch (e) {
                          MyLogger.log('importGuide', `|-------////---> Error when try to iterate (${zones})`)
                        }
                      }
                    }
                  }
                })
              }
              ActGuide.acts.push({ actid: actid, zones: Zones })
            }
          }
          catch (e) { MyLogger.log('importGuide', `|-////->(${path.join(buildPath, file.name)})`) }
        }
      })
    }

    try {
      let actGuidePath = path.join(this.getAbsCustomPath(), ActGuide.identity.name)

      if (fs.existsSync(actGuidePath)) actGuidePath += Date.now().toString()

      ActGuide.identity.filename = path.normalize(path.join(actGuidePath, "guide.json"))
      fs.mkdirSync(actGuidePath, { recursive: true })

      MyLogger.log('importGuide', `save ${ActGuide.identity.filename}`)

      const json = new JsonFile<IActsGuide>(ActGuide.identity.filename)
      const tmp = JSON.parse(JSON.stringify(ActGuide)) as IActsGuide
      delete tmp.identity.filename
      delete tmp.identity.readonly
      delete tmp.identity.sysAssetPath
      delete tmp.identity.webAssetPath

      json.setObject(tmp)
      json.save()
    }
    catch (e) {
      MyLogger.log('importGuide', `Error when saving custom guide in ${ActGuide.identity.filename}`)
    }
    this.Init(this.CurGuide.identity.filename)
  }
}
