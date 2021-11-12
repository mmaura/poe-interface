import { MenuItem, nativeImage, NativeImage } from "electron"
import { debugMsg, getAssetPath } from "./functions"
import { Guides } from "./Guides"
import path from 'path'

export class ActsGuides extends Guides<IActsGuide> {
    protected CurGuide: IActsGuide
    public Warning: string[]
    Icon: NativeImage

    constructor() {
        super("actsguides")
        this.Icon = nativeImage.createFromPath(path.join(getAssetPath(), "/images/arrow-right-bold.png"))
    }

    parseCurGuide(): void {
        if (this.CurGuide.acts) this.CurGuide.acts.forEach(_act => {
            if (_act.zones) _act.zones.forEach(_zone => {
                const _tmp_zone = this.CurGuide.acts
                    .find(__act => __act.actid === _act.actid)
                    .zones.find(__zone => __zone.name === _zone.name)

                if (_tmp_zone) {
                    _tmp_zone.name !== undefined
                        ? (_zone.altimage = _tmp_zone.altimage)
                        : this.Warning.push(`no 'altimage' field in ${_zone.name} act ${_act.act}`)
                    _tmp_zone.image !== undefined
                        ? (_zone.image = _tmp_zone.image)
                        : this.Warning.push(`no 'image' field in ${_zone.name} act ${_act.act}`)
                    _tmp_zone.note !== undefined
                        ? (_zone.note = _tmp_zone.note)
                        : this.Warning.push(`no 'note' field in ${_zone.name} act ${_act.act}`)
                }
                else this.Warning.push(`no zone found in act:${_act.actid} and zone:${_zone.name} of guide`)
            })
            else this.Warning.push(`no zone found in act: ${_act.actid} guide`)
        })
        else this.Warning.push("no acts found in guide")
    }

    AppendMenu(menu: MenuItem): void {
        let mustAppendSeparator = true

        this.getIdentities().sort(t => (t.readonly === true) ? -1 : 1).forEach((_identity: ActGuideIdentity) => {
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
                    debugMsg(`loading acts Guide :${this.getGuideLabel(_identity.filename)} \n ${_identity.filename}`)
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
}
