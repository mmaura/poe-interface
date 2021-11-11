import { Guides } from "./Guides"
import path from 'path'
import fs from 'fs'
import { debugMsg, findGem, getAssetPath } from './functions'
import { MenuItem, NativeImage, nativeImage, shell } from "electron"

export class ClassesGuides extends Guides<IClassesGuide>{
    protected CurGuide: IClassesGuide
    public Warning: string[]
    Icon: NativeImage

    constructor() {
        super("classguides")
        this.Icon = nativeImage.createFromPath(path.join(getAssetPath(), "/images/arrow-right-bold.png"))
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

    AppendMenu(menu: MenuItem): void {
        let _menu: MenuItem

        this.getIdentities().forEach((_identity: ClassGuideIdentity) => {
            let must_append = false
            _menu = menu.submenu.getMenuItemById("classesG_" + _identity.class)

            if (!_menu) {
                _menu = new MenuItem({
                    label: _identity.class,
                    id: "classesG_" + _identity.class,
                    icon: _identity.filename === this.getCurGuideID() ? this.Icon : undefined,
                    submenu: [],
                })
                must_append = true
            }

            _menu.submenu.append(
                new MenuItem({
                    label: this.getGuideLabel(_identity.filename),
                    icon: _identity.filename === this.getCurGuideID() ? this.Icon : undefined,
                    submenu: [
                        {
                            label: "WebSite",
                            click: () => {
                                shell.openExternal(_identity.url)
                            },
                            enabled: (_identity.url !== undefined)
                        },
                        {
                            label: "Select",
                            id: `${_identity.filename}`,
                            click: () => {
                                debugMsg(`loading class Guide :${this.getGuideLabel(_identity.filename)} \n ${_identity.filename}`)
                                this.setCurGuide(_identity.filename)
                            }
                        }

                    ]
                })
            )
            if (must_append === true) menu.submenu.append(_menu)
        })

    }
}

