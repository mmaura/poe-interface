import { MenuItem, nativeImage, NativeImage } from "electron"
import { getAssetPath, MyLogger } from "./functions"
import { Guides } from "./Guides"
import path from 'path'

export class ActsGuides extends Guides<IActsGuide> {
    protected CurGuide: IActsGuide
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
                        : MyLogger.log('info', `no 'altimage' field in: act ${_act.act}, ${_zone.name}`)
                    _tmp_zone.image !== undefined
                        ? (_zone.image = _tmp_zone.image)
                        : MyLogger.log('info', `no 'image' field in: act ${_act.act}, ${_zone.name}`)
                    _tmp_zone.note !== undefined
                        ? (_zone.note = _tmp_zone.note)
                        :MyLogger.log('info', `no 'note' field in: act ${_act.act}, ${_zone.name}`)
                }
                else MyLogger.log('info', `no zone found in act:${_act.actid}`)
            })
            else MyLogger.log('info', `no zone found in act: ${_act.actid}`)
        })
        else MyLogger.log('info', "no acts found in guide")
    }

    AppendMenu(menu: MenuItem): void {
        let mustAppendSeparator = true

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
}
