import { Guides } from "./Guides"
import path from 'path'
import fs from 'fs'
import { debugMsg, findGem, getAssetPath } from './functions'
import { MenuItem, NativeImage, nativeImage } from "electron"

interface callback {
    (filename: string): void
}

export class ClassesGuides extends Guides<IClassesGuide>{
    protected CurGuide: IClassesGuide
    public Warning: string[]
    Icon : NativeImage

    constructor() {
        super("classguides")
        this.Icon =  nativeImage.createFromPath(path.join(getAssetPath(), "/images/arrow-right-bold.png"))
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
                    this.Warning.push(`Missing file ${path.join(this.CurGuide.identity.sysAssetPath, `tree-${act.act}(.png|.jpg)`)}`)
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

    AppendMenu(menu: MenuItem, callback: callback): void {
        // if (this.getCurGuide().identity.url) {
        //     menu.getMenuItemById("templateUrl").click = () => {
        //       shell.openExternal(this.ClassGuides.getCurGuide().identity.url)
        //     }
        //     menu.getMenuItemById("templateUrl").enabled = true
        //   }

        this.getIdentities().forEach(_identity => {
            let must_append = false
            let _menu = menu.submenu.getMenuItemById("classesG_" + _identity.class)

            if (!_menu) {
                _menu = new MenuItem({
                    label: _identity.class,
                    id: "classesG_" + _identity.class,
                    submenu: [],
                })
                must_append = true
            }

            _menu.submenu.append(
                new MenuItem({
                    label: this.getGuideLabel(_identity.filename),
                    icon: _identity.filename === this.getCurGuideID() ? this.Icon : undefined,
                    id: `${_identity.filename}`,
                    click: () => {
                        debugMsg(`loading class Guide :${this.getGuideLabel(_identity.filename)} \n ${_identity.filename}`)
                        callback(_identity.filename)
                    },
                })
            )
            if (must_append === true) menu.submenu.append(_menu)
        })

    }
}

