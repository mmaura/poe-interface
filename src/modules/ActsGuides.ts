import { Guides } from "./Guides"
import { JsonFile } from "./JsonFile"

export class ActsGuides extends Guides<IActsGuide> {
    protected CurGuide: IActsGuide
    public Warning: string[]

    constructor() {
        super("actsguides")
    }

    async Init(defaultGuideFilename?: string): Promise<IActsGuide> {
        await super.Init()
        return await this.setCurGuide(defaultGuideFilename)
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
}
