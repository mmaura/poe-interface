import { Guides } from "./Guides"
import path from 'path'
import fs from 'fs'
import { findGem } from './functions'

export class ClassesGuides extends Guides<IClassesGuide>{
    protected CurGuide: IClassesGuide
    public Warning: string[]

    constructor() {
        super("classguides")
    }

    async Init(defaultGuideFilename?: string): Promise<IClassesGuide> {
        await super.Init()
        return await this.setCurGuide(defaultGuideFilename)
    }

    parseCurGuide(): void {
        if (this.CurGuide.acts) {
            this.CurGuide.acts.forEach(act => {
                if (fs.existsSync(path.join(this.CurGuide.identity.sysAssetPath, "/tree-" + act.act + ".png")))
                    act.treeimage = this.CurGuide.identity.webAssetPath + "/tree-" + act.act + ".png"
                else if (fs.existsSync(path.join(this.CurGuide.identity.sysAssetPath, "/tree-" + act.act + ".jpg")))
                    act.treeimage = this.CurGuide.identity.webAssetPath + "/tree-" + act.act + ".jpg"
                else {
                    this.Warning.push(`Missing file ${path.join(this.CurGuide.identity.sysAssetPath, `tree-${act.act}(.png|.jpg)`)}`                    )
                    act.treeimage = null
                }
                if (act.gears) {
                    act.gears.forEach(gear => {
                        gear.gems = [] as IAppGems[]
                        if (gear.gem_info)
                            gear.gem_info.forEach(({ name }) => {
                                const _gem = findGem(name)
                                if (_gem !== undefined) gear.gems.push(_gem)
                                else this.Warning.push(`Gem ${name} was not found.`)
                            })
                        else this.Warning.push(`gear does not have gem, for act ${act.act}, gear: '${gear.name}'.`)
                    })
                } else this.Warning.push(`gears not exist for act ${act.act}.`)
            })
        } else this.Warning.push(`no acts for guide ${this.CurGuide.identity.filename} .`)
    }
}

