import path from 'path'
import fs, { constants } from 'fs'
import { Lang, MyLogger } from './functions'
import { JsonFile } from './JsonFile'
import { DataLoader } from './DataLoader'
import { dialog, MenuItem } from 'electron'

interface GuideType {
  identity: GuidesIdentity
}

export abstract class Guides<T extends GuideType> extends DataLoader {
  protected Identities = [] as GuidesIdentity[]
  protected CurGuide: T

  abstract parseCurGuide(): void
  abstract saveCurGuide(): Promise<void>
  abstract ImportPOELevelingGuide(buildPath: string): void


  constructor (subdir: string) {
    super(subdir)
  }

  /**
   * 
   * @param defaultGuideName the guide name to load
   */
  async Init(defaultGuideFilename?: string): Promise<void> {
    this.Identities = [] as GuidesIdentity[]

    Promise.all([
      this.populateIdentities(this.getAbsPackagedPath(), this.getPackagedWebBaseName(), true),
      this.populateIdentities(this.getAbsCustomPath(), this.getCustomWebBaseName())
        .catch(() => {
          MyLogger.log('info', `No custom guide in ${this.getAbsCustomPath()}`)
        }),
    ]).finally(() => { this.selectGuide(defaultGuideFilename) })
  }

  /**
   * populate Identities with the Guides.
   * 
   * @param dirPath the path where to scan for guides file
   * @param webPath the web url to files
   * @param readOnly true if guide must not be editable by user
   */
  private async populateIdentities(dirPath: string, webPath: string, readOnly?: boolean) {
    for (const f of this.FilesFromSubPath(dirPath)) {
      if (f.search(/guide(-(.*))?\.json$/) !== -1) {
        const json = new JsonFile<T>(f)
        await json.Init()
          .then(() => {
            const object = json.getObject()
            if ((readOnly) && (readOnly === true)) object.identity.readonly = true
            else object.identity.readonly = false
            if (!object.identity.name) object.identity.name = "newName"
            if (!object.identity.lang) object.identity.lang = "en"
            if (!object.identity.game_version) object.identity.game_version = 3.16
            object.identity.filename = f
            object.identity.webAssetPath = this.extractWebPath(webPath, f)
            object.identity.sysAssetPath = path.dirname(f)
            this.Identities.push(object.identity)
          })
          .catch((e) => {
            MyLogger.log('error', `Error when populate guide in ${f}`)
            MyLogger.log('error', `${e}`)
          })
      }
    }
  }

  /**
   * 
   * @returns The Identities
   */
  getIdentities(): GuidesIdentity[] {
    return this.Identities
  }

  /**
   * 
   * @param filename guide filename 
   * @returns if filename empty return 'default' identity in 'OsLocaleLang' if not found, return 'default' identity in 'en', 
   * if not found return the first identity
   */
  getIdentity(filename?: string): GuidesIdentity {
    let curIdent = {} as GuidesIdentity

    if (filename) curIdent = this.Identities.find(ident => ident.filename === filename)
    if (!curIdent) curIdent = this.Identities.find(ident => ident.name === "default" && ident.lang === Lang)
    if (!curIdent) curIdent = this.Identities.find(ident => ident.name === "default" && ident.lang === 'en')
    if (!curIdent) curIdent = this.Identities[0]
    return curIdent
  }

  /**
   * 
   * @returns return unique guide id (the guide path and filename)
   */
  getGuideId(): string {
    if (this.CurGuide) return `${this.CurGuide.identity.filename}`
    else return undefined
  }


  /**
   * 
   * @param filename the guid id (filename) to get the label
   * @returns The guide label
   */
  getGuideLabel(filename?: string): string {
    let ident
    if (filename) {
      ident = this.getIdentity(filename)
      return `${ident.game_version} - ${ident.lang} - ${ident.name}`
    }
    else return `${this.CurGuide.identity.game_version} - ${this.CurGuide.identity.lang} - ${this.CurGuide.identity.name}`
  }

  /**
   * 
   * @returns current guide or undefined
   */
  getGuide(): T {
    if (this.CurGuide) return this.CurGuide
    else return undefined
  }


  protected _AppendMenu(menu: MenuItem): void {
    menu.submenu.append(new MenuItem({
      label: `Create empty guide`,
      click: () => {
        this.createEmptyGuide()
      }

    }))

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
  }

  /**
   * 
   * @param GuideFilename the guide id (filename) to use
   */
  async selectGuide(GuideFilename?: string): Promise<void> {
    const selectedIdent = this.getIdentity(GuideFilename)
    let oldGuideFilename
    try {
      oldGuideFilename = this.CurGuide.identity.filename
    } catch (e) {
      oldGuideFilename = ""
    }

    try {
      const json = new JsonFile<T>(selectedIdent.filename)
      await json.Init()
      this.CurGuide = json.getObject()
      this.CurGuide.identity = selectedIdent

      this.parseCurGuide()
      if (oldGuideFilename === this.CurGuide.identity.filename) {
        this.emit("GuideContentChanged", this.CurGuide)
      }
      else
        this.emit("ChangeSelectedGuided", this.CurGuide)
      MyLogger.log('info', `set cur guide ${this.CurGuide.identity.filename}`)
    }
    catch (e) {
      MyLogger.log('error', `Error When setting curGuide : \n\tfilename:(${GuideFilename})\n\tcurIdent:(${selectedIdent})\n\tthis.CurGuide:(${this.CurGuide}) `)
      MyLogger.error(e)
    }
  }

  /**
   * 
   * @param identity the new identity of the cur guide to save on file (filename was calculated here)
   */
  async saveNewIdentity(identity: GuidesIdentity): Promise<void> {
    const oldFilename = path.dirname(this.CurGuide.identity.filename)
    if (identity.class) this.CurGuide.identity.class = identity.class
    if (identity.url) this.CurGuide.identity.url = identity.url
    if (this.CurGuide.identity.name !== identity.name) {
      this.CurGuide.identity.name = identity.name
      this.CurGuide.identity.filename = path.join(this.findUniqueGuidePath(identity.name), 'guide.json')
      fs.renameSync(oldFilename, path.dirname(this.CurGuide.identity.filename))
    }
    this.CurGuide.identity.lang = identity.lang
    this.CurGuide.identity.game_version = identity.game_version

    this.saveCurGuide().then(() => {
      console.log("appel init avec %o", this.CurGuide.identity.filename)
      this.Init(this.CurGuide.identity.filename)
    })
  }

  /**
   * Record guide.json file after deleting unwanted keys.
   * @param guide the entire guide
   */
  protected async saveGuide(guide: T): Promise<void> {
    try {
      MyLogger.log('info', `save ${guide.identity.filename}`)

      const json = new JsonFile<T>(guide.identity.filename)
      const tmp = JSON.parse(JSON.stringify(guide)) as T
      delete tmp.identity.filename
      delete tmp.identity.readonly
      delete tmp.identity.sysAssetPath
      delete tmp.identity.webAssetPath

      json.setObject(tmp)
      await json.save()
    }
    catch (e) {
      MyLogger.log('error', `Error when saving custom guide in ${this.CurGuide.identity.filename}`)
    }
  }

  createEmptyGuide(): void {
    const g = {} as T
    g.identity = {} as GuidesIdentity
    g.identity.game_version = 3.16
    g.identity.name = "New Guide"
    g.identity.lang = Lang
    const guidePath = this.findUniqueGuidePath(g.identity.name)
    fs.mkdirSync(guidePath)
    g.identity.filename = path.join(guidePath, "guide.json")

    this.saveGuide(g).then((e) => {
      this.Init(g.identity.filename)
    })
  }


  /**
   * 
   * @param filename name(optional) of the guide to duplicate (current guide if empty)
   * @returns true or throw error
   */
  async DuplicateGuide(filename?: string): Promise<string> {
    try {
      if (!filename) filename = this.CurGuide.identity.filename
      const srcIdent = this.getIdentity(filename)
      const dstPath = this.findUniqueGuidePath(srcIdent.name)

      const newFilename = path.join(dstPath, "guide.json")
      this._recursiveCopyFileSync(srcIdent.sysAssetPath, dstPath, path.basename(srcIdent.filename))

      const json = new JsonFile<T>(newFilename)
      await json.Init()
      const guide = json.getObject()
      guide.identity.name = `${srcIdent.name}_copy`
      json.setObject(guide)
      await json.save()

      return newFilename
    }
    catch (e) {
      MyLogger.log('error', `Error when duplicate custom guide in (${filename})`)
      MyLogger.log('error', `${e}`)
    }
  }

  /**
   * copy recursively a directory
   * @param src 
   * @param dst 
   * @param guideName the basename of the guide to copy
   * 
   * TODO: Use guideName to filter guide.json files copied
   */
  private _recursiveCopyFileSync(src: string, dst: string, guideName?: string): void {
    MyLogger.log('info', `mkdir ${dst}`)
    fs.mkdirSync(dst, { recursive: true })

    fs.readdirSync(src, { withFileTypes: true }).forEach(item => {
      if (item.isFile()) {
        fs.copyFileSync(path.join(src, item.name), path.join(dst, item.name), constants.COPYFILE_EXCL)
        MyLogger.log('info', `cp ${path.join(src, item.name)} ${path.join(dst, item.name)} `)
      }
    })
  }

  /**
   * Append '_copy' while destination directory exist
   * 
   * @param dstPath Destination Path without guideName directory
   * @param guideName GuideName
   * @returns { dstPath, guideName }
   */
  findUniqueGuidePath(guideName: string): string {
    let newPath = path.normalize(path.join(this.getAbsCustomPath(), guideName))
    while (fs.existsSync(newPath)) {
      guideName = `${guideName}_copy`
      newPath = path.normalize(path.join(this.getAbsCustomPath(), guideName))
    }
    return newPath
  }
}
