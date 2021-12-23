import { Guides } from "./Guides"
import path from 'path'
import fs from 'fs'
import { FindFileExt, getAbsPackagedPath, MyLogger } from './functions'
import { MenuItem, NativeImage, nativeImage, shell, dialog } from "electron"
import ini from 'ini'
import { JsonFile } from "./JsonFile"
import { Gems } from "./Gems"

export class ClassesGuides extends Guides<IClassesGuide>{
  protected CurGuide: IClassesGuide
  protected Gems: Gems
  Icon: NativeImage

  constructor () {
    super("classguides")
    this.Icon = nativeImage.createFromPath(path.join(getAbsPackagedPath(), "/images/arrow-right-bold.png"))
    this.Gems = new Gems()
  }

  async Init(defaultGuideFilename?: string): Promise<void> {
    await this.Gems.Init().then(() => super.Init(defaultGuideFilename))
  }

  getGemsList(): IGemList[] {
    return this.Gems.getGemsList()
  }

  async parseCurGuide(): Promise<void> {
    //defaulting missing values
    if (!this.CurGuide.identity.class) this.CurGuide.identity.class = "Guardian"

    if (!this.CurGuide.acts) this.CurGuide.acts = [] as IClassesGuideAct[]

    for (const actSkeleton of this.ActsZonesSkeleton.acts) {
      let i = -1, ext = ""
      do {
        i++
        ext = FindFileExt(path.join(this.CurGuide.identity.guideSysPath, `tree-${actSkeleton.actId - i}`))
      } while (!ext && (actSkeleton.actId - i > 0))

      let actGuide = this.CurGuide.acts.find(a => a.actId === actSkeleton.actId)
      if (!actGuide) {
        MyLogger.info(`no act ${actSkeleton.actId} in ClasseGuide, defaulting`)
        this.CurGuide.acts.push(actGuide = { actId: actSkeleton.actId, actName: actSkeleton.actName, gears: [] as IClassesGuideGear[] } as IClassesGuideAct)
      }
      actGuide.actName = actSkeleton.actName
      if (!actGuide.gears) actGuide.gears = [] as IClassesGuideGear[]


      if (i !== 0) MyLogger.info(`no skilltree image found for ${actSkeleton.actId} in ClasseGuide, defaulting with act ${actSkeleton.actId - i}`)
      if (actSkeleton.actId - i === 0) {
        MyLogger.info(`no skilltree image found for ${actSkeleton.actId} and acts before in ClasseGuide, defaulting with "?"`)
        actGuide.treeimage = `assets/images/guides/tree-0.png`
      }
      else actGuide.treeimage = `${this.CurGuide.identity.guideWebPath}/tree-${actSkeleton.actId - i}${ext}`
    }

    this.CurGuide.acts.sort((a, b) => a.actId - b.actId)
      .forEach(act => {
        if (act.gears) {
          act.gears.forEach((gear) => {
            gear.gems = [] as IGemList[]
            if (gear.gem_info)
              gear.gem_info.forEach((g_info, index) => {
                const _gem = this.Gems.getByName(g_info.name)
                if (_gem !== undefined) {
                  _gem.is_new = true

                  const prevAct = this.CurGuide.acts.find(a => a.actId === (act.actId - 1))
                  if (prevAct !== undefined) {
                    const prevGear = prevAct.gears.find(gr => gr.name === gear.name)
                    if (prevGear !== undefined && prevGear.gems !== undefined) {
                      if (prevGear.gems.find(gm => gm.name === _gem.name))
                        _gem.is_new = false //false
                    }
                  }

                  _gem.key = `${act.actId}-${gear.name.replace(" ", "_")}-${_gem.name.replace(" ", "_")}-${index}`
                  if ((g_info.note) && (g_info.note !== '')) _gem.notes = g_info.note

                  gear.gems.push({ ..._gem })
                }
                else MyLogger.log('info', `Gem ${g_info.name} was not found.`)
              })
            else MyLogger.log('info', `gear does not have gem, for act ${act.actId}, gear: '${gear.name}'.`)
          })
        } else MyLogger.log('info', `gears not exist for act ${act.actId}.`)
      })
  }

  AppendMenu(menu: MenuItem, playersClasses: IClassesAscendancies[]): void {
    super._AppendMenu(menu)

    playersClasses.sort((a, b) => {
      if (a.classe < b.classe) { return -1 }
      if (a.classe > b.classe) { return 1 }
      return 0
      //pour chaque classe
    })
      .forEach(c => {
        let selectedGuide = false
        let mustAppendSeparator = false

        let curCount = 0
        const ClassSubMenus = [] as MenuItem[]
        const classesGuides = this.getIdentities().filter(ident => ident.class === c.classe)
        if (classesGuides.find(c => c.filename === this.getGuideId())) selectedGuide = true

        curCount += classesGuides.length

        c.ascendancy.sort((a, b) => {
          if (a < b) { return -1 }
          if (a > b) { return 1 }
          return 0
          //pour chaque ascendance
        }).forEach(a => {

          const ascendancyGuides = this.getIdentities().filter(ident => ident.class === a)
          if (ascendancyGuides.find(g => g.filename === this.getGuideId())) selectedGuide = true

          curCount += ascendancyGuides.length

          const ascendancyMenu = new MenuItem({
            label: `(${ascendancyGuides.length}) ${a} `,
            enabled: ascendancyGuides.length > 0 ? true : false,
            icon: ascendancyGuides.find(g => g.filename === this.getGuideId()) ? this.Icon : undefined,
            submenu: []
          })

          //pour chaque guide d'ascendance
          ascendancyGuides.forEach(asc => {
            if ((asc.readonly === true)) mustAppendSeparator = true
            if (mustAppendSeparator && !(asc.readonly === true)) {
              mustAppendSeparator = false
              ascendancyMenu.submenu.append(new MenuItem({ type: "separator" }))
            }

            MyLogger.info(`Add menu ${asc.filename}`)

            ascendancyMenu.submenu.append(new MenuItem({
              label: this.getGuideLabel(asc.filename),
              icon: asc.filename === this.getGuideId() ? this.Icon : undefined,
              click: () => {
                this.selectGuide(asc.filename)
              }
            }))
          })
          ClassSubMenus.push(ascendancyMenu)
        })

        const classMenu = new MenuItem({
          label: `(${curCount}) ${c.classe} `,
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
            icon: classe.filename === this.getGuideId() ? this.Icon : undefined,
            click: () => {
              // debugMsg(`loading class Guide :${ this.getGuideLabel(classe.filename) } \n ${ classe.filename } `)
              this.selectGuide(classe.filename)
            }
          }))
        })
        menu.submenu.append(classMenu)
      })
  }

  getTreeImagePath(actid: number): string {
    return this.CurGuide.acts.find(a => a.actId === actid) ? path.join(this.CurGuide.identity.guideSysPath, this.CurGuide.acts.find(a => a.actId === actid).treeimage) : ""
  }

  setTreeImagePath(filename: string, actid: number): void {
    fs.copyFileSync(filename, path.normalize(`${this.CurGuide.identity.guideSysPath}${path.sep}tree-${actid}${path.extname(filename)}`))
    this.parseCurGuide().then(() => this.emit("GuideContentChanged", this.CurGuide))
  }

  async saveCurGuide(): Promise<void> {
    const guide2Save = { identity: {} as ClassGuideIdentity, acts: [] as IClassesGuideAct[] } as IClassesGuide
    guide2Save.identity.name = this.CurGuide.identity.name
    guide2Save.identity.filename = this.CurGuide.identity.filename
    guide2Save.identity.lang = this.CurGuide.identity.lang
    guide2Save.identity.game_version = this.CurGuide.identity.game_version
    guide2Save.identity.class = this.CurGuide.identity.class
    guide2Save.identity.url = this.CurGuide.identity.url

    if (this.CurGuide) {
      for (const guideAct of this.CurGuide.acts) {
        let curAct2Save = {} as IClassesGuideAct
        guide2Save.acts.push(curAct2Save = {
          actId: guideAct.actId,
          actName: guideAct.actName,
          notes: guideAct.notes,
          gears: [] as IClassesGuideGear[]
        } as IClassesGuideAct)
        for (const guideGear of guideAct.gears) {
          let curGear2Save = {} as IClassesGuideGear
          curAct2Save.gears.push(curGear2Save = {
            name: guideGear.name,
            gem_info: guideGear.gem_info,
            notes: guideGear.notes
          } as IClassesGuideGear)
        }
      }
      super.saveGuide(guide2Save)
    }
    else {
      MyLogger.log('error', 'No curguide to save')
      throw ('error: No curguide to save')
    }
  }

  async setGearName(gearName: string, name: string): Promise<void> {

    const wantedName = this.uniqGearName(name)

    this.CurGuide.acts.forEach(act => {
      const gear = act.gears.find(g => g.name === gearName)
      if (gear) gear.name = wantedName
    })
    this.saveCurGuide().then(() => {
      this.emit("GuideContentChanged", this.CurGuide)
    })
  }

  async setGearNotes(gearId: string, notes: string, actId: number): Promise<void> {
    this.CurGuide.acts.find(a => a.actId === actId).gears.find(g => g.name === gearId).notes = notes
    this.saveCurGuide().then(() => {
      this.emit("GuideContentChanged", this.CurGuide)
    })
  }

  async setActNotes(notes: string, actId: number): Promise<void> {
    this.CurGuide.acts.find(a => a.actId === actId).notes = notes
    this.saveCurGuide().then(() => {
      this.emit("GuideContentChanged", this.CurGuide)
    })
  }

  async addGearSlot(gearName: string, actId: number): Promise<void> {
    const gear = this.CurGuide.acts.find(a => a.actId === actId).gears.find(g => g.name === gearName)
    const slots = (gear.gem_info ? gear.gem_info.length : 0)

    if (slots <= 6) {
      if (!gear.gem_info) gear.gem_info = []
      gear.gem_info.push({ name: "White Socket" })
      gear.gems.push(this.Gems.getByName("White Socket"))
      this.saveCurGuide().then(() => {
        this.emit("GuideContentChanged", this.CurGuide)
      })
    }
  }

  async setGearGem(curGemEdit: { actId: number, gearName: string, gemIndex: number }, newName: string): Promise<void> {
    const { actId, gearName, gemIndex } = curGemEdit
    const curGear = this.CurGuide.acts.find(a => a.actId === actId).gears.find(g => g.name === gearName)

    curGear.gem_info[gemIndex].name = newName
    curGear.gems[gemIndex] = this.Gems.getByName(newName)
    this.saveCurGuide().then(() => {
      this.emit("GuideContentChanged", this.CurGuide)
    })
  }

  async delGearGem(curGemEdit: { actId: number, gearName: string, gemIndex: number }): Promise<void> {
    const { actId, gearName, gemIndex } = curGemEdit

    const curGear = this.CurGuide.acts.find(a => a.actId === actId).gears.find(g => g.name === gearName)
    curGear.gems.splice(gemIndex, 1)
    curGear.gem_info.splice(gemIndex, 1)

    this.saveCurGuide().then(() => {
      this.emit("GuideContentChanged", this.CurGuide)
    })
  }
  async addGear(actId: number): Promise<void> {

    let gears = this.CurGuide.acts.find(a => a.actId === actId).gears
    if (!gears) {
      gears = [] as IClassesGuideGear[]
    }

    const gear = {} as IClassesGuideGear
    gear.name = this.uniqGearName("new group")
    gear.gem_info = []
    gear.gems = [] as IGemList[]

    gears.push(gear)
    this.saveCurGuide().then(() => {
      this.emit("GuideContentChanged", this.CurGuide)
    })
  }

  async delGear(gearName: string, actId: number): Promise<void> {
    const index = this.CurGuide.acts.find(a => a.actId === actId).gears.findIndex(g => g.name === gearName)
    if (index !== -1) this.CurGuide.acts.find(a => a.actId === actId).gears.splice(index, 1)
    this.saveCurGuide().then(() => {
      this.emit("GuideContentChanged", this.CurGuide)
    })
  }

  async delGearInAllActs(gearName: string): Promise<void> {
    for (const act of this.CurGuide.acts) {
      const index = act.gears.findIndex(g => g.name === gearName)
      if (index !== -1) act.gears.splice(index, 1)
    }
    this.saveCurGuide().then(() => {
      this.emit("GuideContentChanged", this.CurGuide)
    })
  }

  async copyToNextAct(curActId: number): Promise<void> {
    const newActGears = this.CurGuide.acts.find(act => act.actId === curActId + 1).gears

    for (const gear of this.CurGuide.acts.find(act => act.actId === curActId).gears)
      newActGears.push(gear)
    this.saveCurGuide().then(() => {
      this.emit("GuideContentChanged", this.CurGuide)
    })

  }

  uniqGearName(wantedName: string): string {
    let name = wantedName
    let notSure: boolean

    do {
      notSure = false
      if (this.CurGuide.acts) for (const act of this.CurGuide.acts)
        if (act.gears) for (const gear of act.gears)
          if (gear.name === name) {
            name = `_${name} `
            notSure = true
          }
    }
    while (notSure)
    return name
  }

  ImportPOELevelingGuide(buildPath: string): void {
    const baseDirs = fs.readdirSync(buildPath, { withFileTypes: true })
    const ClassGuide = {} as IClassesGuide

    const classFile = ini.parse(fs.readFileSync(path.join(buildPath, "gems", "class.ini")).toString())

    const match = buildPath.split(path.sep)[buildPath.split(path.sep).length - 1].match(/([0-9]\.[0-9]{2})\s(.*)/)
    MyLogger.log('importGuide', `Identity match in folder name: (${match[0]} )`)

    try {
      ClassGuide.identity = { game_version: Number(match[1]), class: classFile.class, name: match[2], lang: 'en' }
      MyLogger.log('importGuide', `for guide : (${ClassGuide.identity.game_version} - ${classFile.class} - ${ClassGuide.identity.name} - ${ClassGuide.identity.lang})`)
    }
    catch {
      MyLogger.log('importGuide', `unable to find name, or class, or version, defaulting..`)
      ClassGuide.identity = { game_version: 3.16, class: "Templar", name: Date.now().toString(), lang: 'en' }
      MyLogger.log('importGuide', `for guide : (${ClassGuide.identity.game_version} - ${ClassGuide.identity.name} )`)
    }

    ClassGuide.acts = [] as IClassesGuideAct[]

    if (baseDirs) {
      const files = fs.readdirSync(path.join(buildPath, "gems"), { withFileTypes: true })

      if (files) {
        const gemsIniFilesActs = []
        for (const file of files) {
          if (file.isFile()) {
            // const level = Number(file.name.substr(0, file.name.length - 4))
            const result = file.name.match(/([0-9]{2})\.ini$/)
            if (result) {
              const level = Number(result[1])
              switch (true) {
                case (level <= 13):
                  if (!gemsIniFilesActs[1]) gemsIniFilesActs[1] = []
                  gemsIniFilesActs[1].push(path.join(buildPath, "gems", file.name))
                  break
                case (level <= 23):
                  if (!gemsIniFilesActs[2]) gemsIniFilesActs[2] = []
                  gemsIniFilesActs[2].push(path.join(buildPath, "gems", file.name))
                  break
                case (level <= 33):
                  if (!gemsIniFilesActs[3]) gemsIniFilesActs[3] = []
                  gemsIniFilesActs[3].push(path.join(buildPath, "gems", file.name))
                  break
                case (level <= 41):
                  if (!gemsIniFilesActs[4]) gemsIniFilesActs[4] = []
                  gemsIniFilesActs[4].push(path.join(buildPath, "gems", file.name))
                  break
                case (level <= 45):
                  if (!gemsIniFilesActs[5]) gemsIniFilesActs[5] = []
                  gemsIniFilesActs[5].push(path.join(buildPath, "gems", file.name))
                  break
                case (level <= 50):
                  if (!gemsIniFilesActs[6]) gemsIniFilesActs[6] = []
                  gemsIniFilesActs[6].push(path.join(buildPath, "gems", file.name))
                  break
                case (level <= 55):
                  if (!gemsIniFilesActs[7]) gemsIniFilesActs[7] = []
                  gemsIniFilesActs[7].push(path.join(buildPath, "gems", file.name))
                  break
                case (level <= 61):
                  if (!gemsIniFilesActs[8]) gemsIniFilesActs[8] = []
                  gemsIniFilesActs[8].push(path.join(buildPath, "gems", file.name))
                  break
                case (level <= 64):
                  if (!gemsIniFilesActs[9]) gemsIniFilesActs[9] = []
                  gemsIniFilesActs[9].push(path.join(buildPath, "gems", file.name))
                  break
                case (level <= 69):
                  if (!gemsIniFilesActs[10]) gemsIniFilesActs[10] = []
                  gemsIniFilesActs[10].push(path.join(buildPath, "gems", file.name))
                  break
                case (level > 69):
                  if (!gemsIniFilesActs[11]) gemsIniFilesActs[11] = []
                  gemsIniFilesActs[11].push(path.join(buildPath, "gems", file.name))
                  break
              }
            }
          }
        }
        for (const gemsIniFilesAct in gemsIniFilesActs) {
          this.appendPOELevelingGuideGemFiles(ClassGuide, Number(gemsIniFilesAct), ...gemsIniFilesActs[gemsIniFilesAct])
        }

        // copy empty act gears with previous act gears
        for (const skelAct of this.ActsZonesSkeleton.acts.sort((a, b) => a.actId - b.actId)) {
          if (!ClassGuide.acts.find(a => a.actId === skelAct.actId)) ClassGuide.acts.push({ actId: skelAct.actId, gears: [] })
          if (!ClassGuide.acts.find(a => a.actId === skelAct.actId).gears) ClassGuide.acts.find(a => a.actId === skelAct.actId).gears == [] as IClassesGuideGear[]
          if (ClassGuide.acts.find(a => a.actId === skelAct.actId).gears.length === 0)
            if (skelAct.actId === 1) break
            else {
              let prevAct
              let i = skelAct.actId - 1
              do {
                prevAct = ClassGuide.acts.find(a => a.actId === i)
                i = i - 1
              }
              while (!prevAct && i > 0)
              ClassGuide.acts.find(a => a.actId === skelAct.actId).gears = prevAct.gears
            }
        }


        const ascendancy = fs.readFileSync(path.join(buildPath, "ascendancy.txt"))
        if (ascendancy) ClassGuide.acts.push({ actId: 50, notes: `${ascendancy.toString()} `, gears: [] })

        const info = fs.readFileSync(path.join(buildPath, "build_info.txt"))
        if (info) {
          ClassGuide.acts.find(a => a.actId === 1).notes = `${info.toString()}`

          const url = info.toString().match(/(http[s]:\/\/.*)/)
          if ((url) && (url.length > 0)) ClassGuide.identity.url = url[0]
        }

        let classGuidePath
        try {
          classGuidePath = this.findUniqueGuidePath(ClassGuide.identity.name)
          ClassGuide.identity.filename = path.normalize(path.join(classGuidePath, "guide.json"))

          fs.mkdirSync(classGuidePath, { recursive: true })

          MyLogger.log('importGuide', `save ${ClassGuide.identity.filename} `)

          const json = new JsonFile<IClassesGuide>(ClassGuide.identity.filename)
          const tmp = JSON.parse(JSON.stringify(ClassGuide)) as IClassesGuide
          delete tmp.identity.filename
          delete tmp.identity.readonly
          delete tmp.identity.guideSysPath
          delete tmp.identity.guideWebPath

          json.setObject(tmp)
          json.save()
        }
        catch (e) {
          MyLogger.log('importGuide', `Error when saving custom guide in ${ClassGuide.identity.filename} `)
        }

        for (let i = 1; i < 12; i++) {
          const treeSrc = path.join(buildPath, `Act ${i}`, 'tree.jpg')

          if (fs.existsSync(treeSrc)) {
            const treeDst = path.join(classGuidePath, `tree-${i}.jpg`)
            fs.copyFileSync(treeSrc, treeDst)
          }
        }

        this.Init(ClassGuide.identity.filename)
      }
      else MyLogger.log('importGuide', `No Gem directory or gem files in ${path.join(buildPath, "gems")} `)
    }
  }

  appendPOELevelingGuideGemFiles(ClassGuide: IClassesGuide, actId: number, ...initFiles: string[]): void {
    for (const initFile of initFiles) {
      const gemFile = ini.parse(`\n${fs.readFileSync(initFile).toString().replace('\ufeff', '')} `) //remove utf16 char
      for (const gem in gemFile) {
        if (gemFile[gem].gem && gemFile[gem].gem !== '') {
          let guideAct = {} as IClassesGuideAct

          guideAct = ClassGuide.acts.find(a => a.actId === actId)
          if (!guideAct) ClassGuide.acts.push(guideAct = {} as IClassesGuideAct)

          guideAct.actId = actId

          if (!guideAct.gears) guideAct.gears = [] as IClassesGuideGear[]

          let guideGear
          guideGear = guideAct.gears.find(g => g.name === gem.substr(0, gem.length - 1))
          if (!guideGear) guideAct.gears.push(guideGear = {} as IClassesGuideGear)

          guideGear.name = gem.substr(0, gem.length - 1)

          if ((!guideGear.gem_info) || (!guideGear.gem_info.find(g => g.name === gemFile[gem].gem))) {
            let note = ""
            if (!guideGear.gem_info) guideGear.gem_info = []
            if (gemFile[gem].note) note = gemFile[gem].note

            if (this.Gems.Exist(gemFile[gem].gem))
              guideGear.gem_info.push({ name: gemFile[gem].gem, note: note })
            else MyLogger.log('importGuide', `Try to add unknown(${gemFile[gem].gem}) gem, in file(${initFile})`)
          }
        }
      }
    }
  }
}

