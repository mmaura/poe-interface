import { MenuItem, nativeImage, NativeImage } from "electron"
import { FindFileExt, getAbsPackagedPath, getPackagedWebBaseName, MyLogger } from "./functions"
import { Guides } from "./Guides"
import path from 'path'
import fs from 'fs'
import { JsonFile } from "./JsonFile"

export class ActsGuides extends Guides<IActsGuide> {
  protected CurGuide: IActsGuide
  Icon: NativeImage

  constructor () {
    super("actsguides")
    this.Icon = nativeImage.createFromPath(path.join(getAbsPackagedPath(), "/images/arrow-right-bold.png"))
  }

  async Init(defaultGuideFilename?: string): Promise<void> {
    await super.Init(defaultGuideFilename)
  }

  async selectGuide(defaultGuideFilename?: string): Promise<void> {
    await super.selectGuide(defaultGuideFilename)
    await this.parseCurGuide()
  }

  async parseCurGuide(): Promise<void> {

    if (!this.CurGuide.acts) this.CurGuide.acts = [] as IActsGuideAct[]

    //default missing informations guide
    if (this.ActsZonesSkeleton) for (const skeletonAct of this.ActsZonesSkeleton.acts) {
      let guideAct = this.CurGuide.acts.find(a => a.actId === skeletonAct.actId)
      if (!guideAct) {
        MyLogger.log("info", `act ${skeletonAct.actId} ${skeletonAct.actName} not found in actsGuide defaulting.`)
        this.CurGuide.acts.push(guideAct = { actId: skeletonAct.actId, actName: skeletonAct.actName, zones: [] as IActsGuideZone[] } as IActsGuideAct)
      }

      guideAct.actName = skeletonAct.actName
      if (!guideAct.zones) guideAct.zones = [] as IActsGuideZone[]

      if (skeletonAct.zones) for (const skeletonZone of skeletonAct.zones) {
        let guideZone = guideAct.zones.find(z => z.name === skeletonZone.name)
        if (!guideZone) {
          MyLogger.log("info", `zone ${skeletonZone.name} not found in actsGuide defaulting.`)
          //TODO: dont push town zone 
          guideAct.zones.push(guideZone = { name: skeletonZone.name, note: "", altimage: "", image: [] } as IActsGuideZone)
        }

        //always append skeleton values
        guideZone.hasRecipe = skeletonZone.hasRecipe
        guideZone.hasWaypoint = skeletonZone.hasWaypoint
        guideZone.haspassive = skeletonZone.haspassive
        guideZone.hastrial = skeletonZone.hastrial
        guideZone.level = skeletonZone.level

        guideZone.image = []

        //local guide zone images
        if (guideZone.localImage) for (const guideImg of guideZone.localImage) {
          const filename = path.join(this.CurGuide.identity.guideSysPath, guideAct.actId.toString(), guideImg)
          const ext = FindFileExt(filename)
          if (ext) guideZone.image.push(`${this.CurGuide.identity.guideWebPath}/${guideAct.actId}/${guideImg}${ext}`)
          else MyLogger.log('error', `unable to find file extension for local guide file : (${filename})`)
        }

        //always append skeleton zone images
        if ((skeletonZone.skelImage) && (skeletonZone.skelImage.length > 0)) for (const skeletonImg of skeletonZone.skelImage) {
          const filename = path.join(this.CurGuide.identity.appSysAssetPath, "images", "zones", guideAct.actId.toString(), skeletonImg)
          const ext = FindFileExt(filename)
          if (ext) guideZone.image.push(`${this.CurGuide.identity.appWebAssetPath}/images/zones/${guideAct.actId}/${skeletonImg}${ext}`)
          else MyLogger.log('error', `unable to find file extension for skeleton guide file : (${filename})`)
        }
      }
    }
    else {
      MyLogger.log('error', 'skeleton zone does not exist')
      throw ('error: skeleton zone does not exist')
    }
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

    const guide2Save = { identity: {}, acts: [] as IActsGuideAct[] } as IActsGuide
    guide2Save.identity.name = this.CurGuide.identity.name
    guide2Save.identity.filename = this.CurGuide.identity.filename
    guide2Save.identity.lang = this.CurGuide.identity.lang
    guide2Save.identity.game_version = this.CurGuide.identity.game_version


    if (this.CurGuide) {
      for (const guideAct of this.CurGuide.acts) {
        let curAct2Save = {} as IActsGuideAct
        guide2Save.acts.push(curAct2Save = {
          actId: guideAct.actId,
          actName: guideAct.actName,
          zones: [] as IActsGuideZone[]
        } as IActsGuideAct)

        for (const guideZone of guideAct.zones) {
          let curZone2Save = {} as IActsGuideZone
          curAct2Save.zones.push(curZone2Save = {
            name: guideZone.name as string,
            note: guideZone.note as string,
            altimage: guideZone.altimage as string,
            localImage: guideZone.localImage as string[]
          } as IActsGuideZone)
        }
      }
      super.saveGuide(guide2Save)
    }
    else {
      MyLogger.log('error', 'No curguide to save')
      throw ('error: No curguide to save')
    }
  }

  async SaveZoneNote(actid: number, zonename: string, zonenote: string): Promise<void> {
    this.getZoneByActAndZonename(this.getActByID(actid), zonename).note = zonenote

    this.saveCurGuide().then(() => {
      this.emit("GuideContentChanged", this.CurGuide)
    })
  }

  async SaveNavigationNote(actid: number, zonename: string, altimage: string): Promise<void> {
    this.getZoneByActAndZonename(this.getActByID(actid), zonename).altimage = altimage
    this.saveCurGuide().then(() => {
      this.emit("GuideContentChanged", this.CurGuide)
    })
  }

  getActByID(actid: number): IActsGuideAct {
    let act = this.CurGuide.acts.find(act => act.actId === actid)
    if (!act) this.CurGuide.acts.push(act = { actId: actid, zones: [] as IActsGuideZone[] } as IActsGuideAct)
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

                            if (ZonesMod.getObject().acts.find(a => a.actId === actid).zones.find(z => z.name === zone[1]) !== undefined)
                              zoneName = zone[1]
                            else if (ZonesMod.getObject().acts.find(a => a.actId === actid).zones.find(z => z.name === `The ${zone[1]}`) !== undefined)
                              zoneName = `The ${zone[1]}`
                            else if (ZonesMod.getObject().acts.find(a => a.actId === actid).zones.find(z => z.name === `The ${zone[1]} Level 1`) !== undefined)
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
              ActGuide.acts.push({ actId: actid, zones: Zones })
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
      delete tmp.identity.guideSysPath
      delete tmp.identity.guideWebPath

      json.setObject(tmp)
      json.save()
    }
    catch (e) {
      MyLogger.log('importGuide', `Error when saving custom guide in ${ActGuide.identity.filename}`)
    }
    this.Init(this.CurGuide.identity.filename)
  }
}
