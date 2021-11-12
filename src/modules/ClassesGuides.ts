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

    AppendMenu(menu: MenuItem, playersClasses: IPlayerClasses[]): void {

        playersClasses.sort((a, b) => {
            if (a.classe < b.classe) { return -1 }
            if (a.classe > b.classe) { return 1 }
            return 0;
            //pour chaque classe
        }).forEach(c => {
            let selectedGuide = false
            let mustAppendSeparator = false

            let curCount = 0
            const ClassSubMenus = [] as MenuItem[]
            const classesGuides = this.getIdentities().filter(ident => ident.class === c.classe)
            if (classesGuides.find(c => c.filename === this.getCurGuideID())) selectedGuide = true

            curCount += classesGuides.length

            c.ascendancy.sort((a, b) => {
                if (a < b) { return -1 }
                if (a > b) { return 1 }
                return 0;
                //pour chaque ascendance
            }).forEach(a => {

                const ascendancyGuides = this.getIdentities().filter(ident => ident.class === a)
                if (ascendancyGuides.find(g => g.filename === this.getCurGuideID())) selectedGuide = true

                curCount += ascendancyGuides.length

                const ascendancyMenu = new MenuItem({
                    label: `(${ascendancyGuides.length}) ${a}`,
                    enabled: ascendancyGuides.length > 0 ? true : false,
                    icon: ascendancyGuides.find(g => g.filename === this.getCurGuideID()) ? this.Icon : undefined,
                    submenu: []
                })

                //pour chaque guide d'ascendance
                ascendancyGuides.forEach(asc => {
                    if (mustAppendSeparator && !(asc.readonly === true)) {
                        mustAppendSeparator = false
                        ascendancyMenu.submenu.append(new MenuItem({ type: "separator" }))
                    }

                    ascendancyMenu.submenu.append(new MenuItem({
                        label: this.getGuideLabel(asc.filename),
                        icon: asc.filename === this.getCurGuideID() ? this.Icon : undefined,
                        submenu: [
                            {
                                label: "Use it",
                                click: () => {
                                    debugMsg(`loading class Guide :${this.getGuideLabel(asc.filename)} \n ${asc.filename}`)
                                    this.setCurGuide(asc.filename)
                                }
                            },
                            {
                                label: "go to WebSite",
                                click: () => { shell.openExternal(asc.url) },
                                enabled: (asc.url !== undefined)
                            },
                            {
                                label: "Duplicate",
                                click: () => { this.DuplicateGuide(asc.filename).then((f) => 
                                    this.Init(f)) 
                                },
                            },
                        ]
                    }))
                })
                ClassSubMenus.push(ascendancyMenu)
            })

            const classMenu = new MenuItem({
                label: `(${curCount}) ${c.classe}`,
                submenu: [],
                enabled: curCount > 0 ? true : false,
                icon: selectedGuide ? this.Icon : undefined,
            })

            selectedGuide = false

            //pour chaque sous menu de classe ()
            ClassSubMenus.forEach(menu => { classMenu.submenu.append(menu) })

            if (classesGuides.length > 0) classMenu.submenu.append(new MenuItem({ type: "separator" }))

            //pour chaque guide de classe
            classesGuides.forEach(classe => {
                classMenu.submenu.append(new MenuItem({
                    label: this.getGuideLabel(classe.filename),
                    icon: classe.filename === this.getCurGuideID() ? this.Icon : undefined,
                    submenu: [
                        {
                            label: "Use it",
                            click: () => {
                                debugMsg(`loading class Guide :${this.getGuideLabel(classe.filename)} \n ${classe.filename}`)
                                this.setCurGuide(classe.filename)
                            }
                        },
                        {
                            label: "go to WebSite",
                            click: () => { shell.openExternal(classe.url) },
                            enabled: (classe.url !== undefined)
                        },
                        {
                            label: "Duplicate",
                            click: () => { this.DuplicateGuide(classe.filename).then((f) => 
                                this.setCurGuide(f)) 
                            },
                        },
                ]
                }))
            })
            menu.submenu.append(classMenu)
        })






        // this.getIdentities().sort(t => t.readonly === true ? -1 : 1).forEach((_identity: ClassGuideIdentity) => {
        //     // let must_append = false
        //     // _menu = menu.submenu.getMenuItemById(`ClassG_${_identity.class}`)

        //     // if (!_menu) {
        //     //     _menu = new MenuItem({
        //     //         label: _identity.class,
        //     //         id: `ClassG_${_identity.class}`,
        //     //         icon: _identity.filename === this.getCurGuideID() ? this.Icon : undefined,
        //     //         submenu: [],
        //     //     })
        //     //     must_append = true
        //     // }

        //     // if (mustAppendSeparator && !(_identity.readonly === true)) {
        //     //     mustAppendSeparator = false
        //     //     const _menu = new MenuItem({ type: "separator" })
        //     //     menu.submenu.append(_menu)
        //     // }
        //     // else mustAppendSeparator = true
        //     try {
        //         menu.submenu.getMenuItemById(`ClassG_${_identity.class}`).submenu.append(
        //             new MenuItem({
        //                 label: this.getGuideLabel(_identity.filename),
        //                 icon: _identity.filename === this.getCurGuideID() ? this.Icon : undefined,
        //                 submenu: [
        //                     {
        //                         label: "Select it",
        //                         id: `${_identity.filename}`,
        //                         click: () => {
        //                             debugMsg(`loading class Guide :${this.getGuideLabel(_identity.filename)} \n ${_identity.filename}`)
        //                             this.setCurGuide(_identity.filename)
        //                         }
        //                     },
        //                     {
        //                         label: "WebSite",
        //                         click: () => {
        //                             shell.openExternal(_identity.url)
        //                         },
        //                         enabled: (_identity.url !== undefined)
        //                     },
        //                 ]
        //             })
        //         )
        //     }
        //     catch (e) {
        //         this.Warning.push(`Error when create menu${e}`)
        //     }
        //     // if (must_append === true) menu.submenu.append(_menu)
        // })

    }
}

