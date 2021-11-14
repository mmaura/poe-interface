import { MenuItem, nativeImage, NativeImage, dialog } from "electron"
import { getAssetPath, getPackagedWebBaseName, MyLogger } from "./functions"
import { Guides } from "./Guides"
import path from 'path'
import fs from 'fs'
import { JsonFile } from "./JsonFile"
import { ZoneGears } from "../renderers/leveling/Components"

export class ActsGuides extends Guides<IActsGuide> {
    protected CurGuide: IActsGuide
    Icon: NativeImage
    private DefaultZones: JsonFile<IActsGuide>

    constructor() {
        super("actsguides")
        this.Icon = nativeImage.createFromPath(path.join(getAssetPath(), "/images/arrow-right-bold.png"))
        this.DefaultZones = new JsonFile(path.join(getAssetPath(), "data", "zones.json"))
        this.DefaultZones.load()
    }

    parseCurGuide(): void {
        if (this.CurGuide.acts) for (const act of this.CurGuide.acts) {
            const defaultAct = this.DefaultZones.getObject().acts.find(a => a.actid === act.actid)
            act.act = defaultAct.act
            if (act.zones) for (const zone of act.zones) {
                const defaultZone = this.DefaultZones.getObject().acts.find(a => a.actid === act.actid).zones.find(z => z.name === zone.name)

                if (zone.image) for (let image in zone.image) {
                    if (fs.existsSync(path.join(this.CurGuide.identity.sysAssetPath, image)))
                        image = `${this.CurGuide.identity.webAssetPath}/zones/${act.actid}/${image}`
                    else
                        image = `images/zones/${act.actid}/${image}`
                }
            }
            else MyLogger.log('info', `no zone found in act: ${act.actid}`)
        }
        else MyLogger.log('info', "no acts found in guide")

        // if (this.CurGuide.acts) this.CurGuide.acts.forEach(_act => {
        //     if (_act.zones) _act.zones.forEach(_zone => {
        //         const _tmp_zone = this.CurGuide.acts
        //             .find(__act => __act.actid === _act.actid)
        //             .zones.find(__zone => __zone.name === _zone.name)

        //         if (_tmp_zone) {
        //             _tmp_zone.altimage !== undefined
        //                 ? (_zone.altimage = _tmp_zone.altimage)
        //                 : MyLogger.log('info', `no 'altimage' field in: act ${_act.actid}, ${_zone.name}`)

        //             if (_tmp_zone.image !== undefined) {
        //                 // (_zone.image = _tmp_zone.image)
        //                 _zone.image = []
        //                 for (const img of _tmp_zone.image) {
        //                     if (img !== "none")
        //                         if (fs.existsSync(path.join(this.CurGuide.identity.sysAssetPath, img))) {
        //                             MyLogger('info')
        //                             _zone.image.push(`${this.CurGuide.identity.webAssetPath}/zones/${_act.actid}/${img}`)
        //                         }
        //                         else {
        //                             _zone.image.push(`images/zones/${_act.actid}/${img}`)
        //                         }
        //                 }
        //             }
        //             else MyLogger.log('info', `no 'image' field in: act ${_act.actid}, ${_zone.name}`)

        //             _tmp_zone.note !== undefined
        //                 ? (_zone.note = _tmp_zone.note)
        //                 : MyLogger.log('info', `no 'note' field in: act ${_act.actid}, ${_zone.name}`)
        //         }
        //         else MyLogger.log('info', `no zone found in act:${_act.actid}`)
        //     })
        //     else MyLogger.log('info', `no zone found in act: ${_act.actid}`)
        // })
        // else MyLogger.log('info', "no acts found in guide")
    }

    AppendMenu(menu: MenuItem): void {
        let mustAppendSeparator = true

        menu.submenu.append(new MenuItem({
            label: "Duplicate current guide",
            click: () => {
                this.DuplicateGuide().then(guide => {
                    this.Init(guide)
                })
            }
        }))


        menu.submenu.append(new MenuItem({
            label: `Import From POELevelingGuide`,
            click: () => {
                dialog.showOpenDialog(null, {
                    title: "Choose directory of the POELevelingGuide to Import",
                    properties: ['openDirectory']

                }).then(value => {
                    if (!value.canceled) {
                        this.ImportPOELevelingGuide(value.filePaths[0])

                    }
                })
            }
        }))

        menu.submenu.append(new MenuItem({ type: "separator" }))
        const Identities = this.getIdentities().sort(t => (t.readonly === true) ? -1 : 1)
        if (Identities) Identities.forEach((_identity: ActGuideIdentity) => {
            if (mustAppendSeparator && !(_identity.readonly === true)) {
                mustAppendSeparator = false
                const _menu = new MenuItem({ type: "separator" })
                menu.submenu.append(_menu)
            }

            const _menu = new MenuItem({
                label: this.getGuideLabel(_identity.filename),
                icon: _identity.filename === this.getCurGuideID() ? this.Icon : undefined,

                id: `${_identity.filename}`,
                click: () => {
                    this.setCurGuide(_identity.filename)
                },
            })
            menu.submenu.append(_menu)
        })
    }

    SaveZoneNote(actid: number, zonename: string, zonenote: string): void {
        this.CurGuide.acts.find(act => act.actid === actid).zones.find(zone => zonename === zone.name).note = zonenote
        this.saveCurGuide()
    }

    SaveNavigationNote(actid: number, zonename: string, altimage: string): void {
        this.CurGuide.acts.find(act => act.actid === actid).zones.find(zone => zonename === zone.name).altimage = altimage
        this.saveCurGuide()
    }

    ImportPOELevelingGuide(buildPath: string): void {
        const dirs = fs.readdirSync(buildPath, { withFileTypes: true })
        const ActGuide = {} as IActsGuide
        ActGuide.acts = []

        const ZonesMod = new JsonFile<IActsGuide>(path.join(getAssetPath(), "data", "zones.json"))
        ZonesMod.load()


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
                            const Zones = [] as IZone[]

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

            if (fs.existsSync(actGuidePath))
                actGuidePath += Date.now().toString()

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
