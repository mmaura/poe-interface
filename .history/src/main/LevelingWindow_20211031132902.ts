import {
  BrowserWindow,
  ipcMain,
  NativeImage,
  IpcMainInvokeEvent,
  app,
  Menu,
  shell,
  MenuItem,
  dialog,
} from "electron"
import Store from "electron-store"

import PathOfExileLog from "poe-log-monitor"
import path from "path"
import fs from "fs"

import {
  findGem,
  loadJsonAct,
  loadJsonRichText,
  loadJsonClasses,
  getLocalCustomPath,
  getAssetPath,
  loadJson,
} from "../modules/functions"

declare const LEVELING_WINDOW_WEBPACK_ENTRY: string
declare const LEVELING_WINDOW_PRELOAD_WEBPACK_ENTRY: never

export class LevelingWindow {
  protected _Window: BrowserWindow
  protected _Menu: Menu
  private _AppStore: Store

  private _CanClose = false
  private _PoeLog: PathOfExileLog
  private _LogLoaded: boolean

  private _CurClassGuide: IClassesGuide
  private _ClassesGuidesIdentities: ClassGuideIdentity[]
  private _RichTextJson: IRichText[]
  private _CurActsGuide: IActsGuide
  private _ActsGuidesIdentities: ActGuideIdentity[]
  private _ClassesJson: IClasses[]

  private _MyPlayer: IAppPlayer
  private _MyConn: plm_conn

  constructor(appStore: any, AppIcon: NativeImage) {
    this._AppStore = appStore

    this._MyPlayer = <IAppPlayer>{}
    this._MyConn = <plm_conn>{}

    this._Window = new BrowserWindow({
      width: 1370,
      height: 1200,
      icon: AppIcon,
      title: "Leveling Guide",
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        //worldSafeExecuteJavaScript: true,
        preload: LEVELING_WINDOW_PRELOAD_WEBPACK_ENTRY,
      },
    })

    this.InitJsonData()
    this.makeMenus()

    this._Window.loadURL(LEVELING_WINDOW_WEBPACK_ENTRY)
    if (!app.isPackaged) this._Window.webContents.openDevTools({ mode: "detach" })

    /************************
     * Window Events
     */
    this._Window.on("close", e => {
      if (this._CanClose === false) {
        this._Window.hide()
        e.preventDefault()
      }
    })

    this._Window.on("closed", () => {
      this._Window = null
    })

    /**********************************
     * IPC
     */
    ipcMain.handle("Init", (event: IpcMainInvokeEvent, ...arg) => {
      console.log("****** ipcMain handle Init: %o", arg)

      return [
        "Init",
        this._CurActsGuide,
        this._RichTextJson,
        this._CurClassGuide,
        this._MyPlayer,
        this._CurActsGuide.acts[0].actid,
        this._CurActsGuide.acts[0].zones[0].name,
      ]
    })
    ipcMain.handle("richText", (event: IpcMainInvokeEvent, ...arg) => {
      console.log("******ipcMain handle richText: %o", arg)
      switch (arg[0] as string) {
        case "reload":
          this._RichTextJson = loadJsonRichText(this._CurActsGuide)
          break
      }
      return this._RichTextJson
    })

    // ipcMain.handle("player", (event: IpcMainInvokeEvent, ...arg) => {
    // 	console.log("******ipcMain handle player: %o", arg)
    // 	return this._MyPlayer
    // })
    // ipcMain.handle("AllActs", (event: IpcMainInvokeEvent, ...arg) => {
    // 	console.log("******ipcMain handle player: %o", arg)
    // 	return this._ActJson
    // })

    ipcMain.handle("guide", (event: IpcMainInvokeEvent, ...arg) => {
      console.log("ipcMain handle guide: %o", arg)

      switch (arg[0] as string) {
        case "reload":
          console.log("reload:", this._CurClassGuide.identity.filename)
          this.loadCurClassGuideFromJson()
          break
      }
      event.returnValue = this._CurClassGuide
      return this._CurClassGuide
    })
  }

  /**********************************
   * POE LOG
   */
  setPoeLog(poeLog: PathOfExileLog): void {
    this._PoeLog = poeLog
    this._LogLoaded = false

    /**********************************
     * Poe Log Events
     */
    this._PoeLog.on("parsingComplete", () => {
      this._LogLoaded = true

      console.log("send parsing complete")

      this._Window.webContents.send("levelingRenderer", ["player", this._MyPlayer])
      this._Window.webContents.send("conn", this._MyConn)
    })

    this._PoeLog.on("login", data => {
      this._MyConn = data
      if (this._LogLoaded === true) this._Window.webContents.send("conn", this._MyConn)
    })

    this._PoeLog.on("level", data => {
      this._MyPlayer.name = data.name
      this._MyPlayer.characterClass = this.getCharacterClass(data.characterClass)
      this._MyPlayer.characterAscendancy = data.characterClass
      this._MyPlayer.level = data.level

      if (this._LogLoaded === true) {
        console.log("level up : send player")
        this._Window.webContents.send("levelingRenderer", ["player", this._MyPlayer])
      }
    })

    this._PoeLog.on("area", area => {
      if (area.type === "area") {
        this._MyPlayer.currentZoneName = area.name
        this._MyPlayer.currentZoneAct = area.info[0].act

        if (this._LogLoaded === true) {
          console.log("area change : send player")
          this._Window.webContents.send("levelingRenderer", ["playerArea", this._MyPlayer])
        }
      }
    })
  }

  setCanClose(state: boolean): void {
    this._CanClose = state
  }

  close(): void {
    this._CanClose = true
    this._Window.close()
  }

  show(): void {
    this._Window.show()
  }

  hide(): void {
    this._Window.hide()
  }

  getCharacterClass(characterClass: string): string {
    const _character = this._ClassesJson.find(e => {
      if (e.classe === characterClass || e.ascendancy.includes(characterClass)) return true
    })
    return _character.classe
  }

  OpenLocalHelperFile(file: string): void {
    const exts = ["png", "jpg", "gif"]
    let filename = path.join(getLocalCustomPath(), "images", "memo", file)

    for (const ext of exts) {
      console.log(filename + "." + ext)
      if (fs.existsSync(filename + "." + ext)) {
        filename = filename + "." + ext
        break
      }
    }
    shell.openPath(filename)
  }

  private InitJsonData(): void {
    this.LoadJsonClassesGuidesIdentities()
    this.loadCurClassGuideFromJson(this._AppStore.get("curClassGuide") as string)

    this.LoadJsonActsGuidesIdentities()
    this.loadCurActsGuideFromJson(this._AppStore.get("curActsGuide") as string)

    this._RichTextJson = loadJsonRichText(this._CurActsGuide)
    this._ClassesJson = loadJsonClasses()
  }

  reloadAll(): void {
    this.LoadJsonClassesGuidesIdentities()
    this.loadCurClassGuideFromJson()

    this.LoadJsonClassesGuidesIdentities()
    this.loadCurActsGuideFromJson()

    this._RichTextJson = loadJsonRichText(this._CurActsGuide)
    this._ClassesJson = loadJsonClasses()

    this._Window.webContents.send("levelingRenderer", [
      "All",
      this._CurActsGuide,
      this._RichTextJson,
      this._CurClassGuide,
    ])
  }

  LoadJsonClassesGuidesIdentities(): void {
    let filename = path.join(getAssetPath(), "classguides", "default", "guide.json")
    let guide = loadJson(filename) as IClassesGuide
    guide.identity.filename = filename
    guide.identity.webAssetPath = "../assets/classguides/default/"
    guide.identity.sysAssetPath = path.join(getAssetPath(), "classguides", "default")
    this._ClassesGuidesIdentities = [guide.identity]
    console.log("look for classguide in : ", filename)

    const customGuideDir = path.join(getLocalCustomPath(), "classguides")
    if (!fs.existsSync(customGuideDir)) {
      fs.mkdirSync(customGuideDir, { recursive: true })
    } else {
      fs.readdirSync(customGuideDir).forEach(dir => {
        filename = path.join(customGuideDir, dir, "guide.json")
        if (fs.existsSync(filename)) {
          console.log("look for classguide in : ", filename)
          guide = loadJson(filename) as IClassesGuide
          guide.identity.filename = filename
          guide.identity.webAssetPath = "userdata://classguides/" + dir + "/"
          guide.identity.sysAssetPath = path.join(path.join(customGuideDir, dir))
          this._ClassesGuidesIdentities.push(guide.identity)
        }
      })
    }
  }

  loadCurClassGuideFromJson(guideName?: string): void {
    const InfoMessages = [] as string[]
    if (guideName === undefined) guideName = this._CurClassGuide.identity.name

    let _ident = this._ClassesGuidesIdentities.find(identity => identity.name === guideName)

    if (!_ident) _ident = this._ClassesGuidesIdentities[0]
    this._CurClassGuide = loadJson(_ident.filename) as IClassesGuide
    this._CurClassGuide = Object.assign(this._CurClassGuide, { identity: _ident })
    console.log(this._CurClassGuide)

    if (this._CurClassGuide.acts) {
      this._CurClassGuide.acts.forEach(act => {
        if (fs.existsSync(path.join(_ident.sysAssetPath, "tree-" + act.act + ".png")))
          act.treeimage = _ident.webAssetPath + "/tree-" + act.act + ".png"
        else if (fs.existsSync(path.join(_ident.sysAssetPath, "tree-" + act.act + ".jpg")))
          act.treeimage = _ident.webAssetPath + "/tree-" + act.act + ".jpg"
        else {
          InfoMessages.push(
            `Le fichier ${path.join(
              _ident.sysAssetPath,
              `tree-${act.act}(.png|.jpg)`
            )} n'a pas été trouvé, pas d'arbre de talent pour l'act ${act.act}`
          )
          act.treeimage = null
        }
        if (act.gears) {
          act.gears.forEach(gear => {
            gear.gems = [] as IAppGems[]
            if (gear.gem_info)
              gear.gem_info.forEach(({ name }) => {
                const _gem = findGem(name)
                if (_gem !== undefined) gear.gems.push(_gem)
                else InfoMessages.push(`La gemme ${name} n'a pas été trouvée.`)
              })
          })
        } else {
          InfoMessages.push(`Pas de gears pour l'act ${act.act}.`)
        }
      })
    } else {
      InfoMessages.push(`Le ClassGuide ne contient aucun act.`)
    }
    if (InfoMessages.length > 0)
      dialog.showMessageBox(null, {
        message: `Au moins un élément du ClassGuide "${guideName}" n'a pas été chargés correctement.`,
        detail: InfoMessages.join("\n"),
        title: "Avertissement au chargement du ClassGuide",
        type: "warning",
      })
  }
  getLocalClassGuidesDir(): string {
    return path.join(getLocalCustomPath(), "classguides")
  }

  duplicateCurClassGuide(): void {
    const classGuideName = Date.now().toString()
    const dst = this.getLocalClassGuidesDir()

    let _ident = this._ClassesGuidesIdentities.find(
      identity => identity.name === this._CurClassGuide.identity.name
    )
    if (!_ident) _ident = this._ClassesGuidesIdentities[0]

    fs.mkdirSync(path.join(dst, classGuideName), { recursive: true })
    fs.readdirSync(_ident.sysAssetPath).forEach(item => {
      // if(item !== "guide.json")
      fs.copyFileSync(path.join(_ident.sysAssetPath, item), path.join(dst, classGuideName, item))
    })

    const _guide_file = path.join(dst, classGuideName, "guide.json")
    const _guide = loadJson(_guide_file) as IClassesGuide
    _guide.identity.name = classGuideName
    fs.writeFileSync(_guide_file, JSON.stringify(_guide, null, 2))

    if (this._AppStore.get("OpenDirOnDuplicate") === true) shell.openPath(dst)
    if (this._AppStore.get("OpenEditorOnDuplicate") === true) shell.openPath(_guide_file)
    this.LoadJsonClassesGuidesIdentities()
    this.loadCurClassGuideFromJson(classGuideName)
    this.makeMenus()
  }

  LoadJsonActsGuidesIdentities(): void {
    let filename = path.join(getAssetPath(), "actsguides", "default", "guide.json")
    let guide = loadJson(filename) as IActsGuide

    guide.identity.filename = filename
    guide.identity.webAssetPath = "../assets/actsguides/default/"
    guide.identity.sysAssetPath = path.join(getAssetPath(), "actsguides", "default")
    this._ActsGuidesIdentities = [guide.identity]
    console.log("look for ActsGuide in : ", filename)

    const customGuideDir = path.join(getLocalCustomPath(), "actsguides")
    if (!fs.existsSync(customGuideDir)) {
      fs.mkdirSync(customGuideDir, { recursive: true })
    } else {
      fs.readdirSync(customGuideDir).forEach(dir => {
        filename = path.join(customGuideDir, dir, "guide.json")
        if (fs.existsSync(filename)) {
          console.log("look for ActsGuide in : ", filename)
          guide = loadJson(filename) as IActsGuide
          guide.identity.filename = filename
          guide.identity.webAssetPath = "userdata://actsguides/" + dir + "/"
          guide.identity.sysAssetPath = path.join(path.join(customGuideDir, dir))
          this._ActsGuidesIdentities.push(guide.identity)
        }
      })
    }
  }

  loadCurActsGuideFromJson(actsGuideName?: string): void {
    const InfoMessages = [] as string[]
    if (actsGuideName === undefined) actsGuideName = this._CurActsGuide.identity.name

    let _ident = this._ActsGuidesIdentities.find(identity => identity.name === actsGuideName)

    if (!_ident) _ident = this._ActsGuidesIdentities[0]
    this._CurActsGuide = loadJson(_ident.filename) as IActsGuide
    this._CurActsGuide = Object.assign(this._CurActsGuide, { identity: _ident })
    console.log(this._CurActsGuide)

    if (this._CurActsGuide.acts) {
      //TODO: use custom zone guide images
      // this._CurActGuide.acts.forEach(act => {
      //   // if (fs.existsSync(path.join(_ident.sysAssetPath, "zones")))
      //   //   console.log("Chargement des images zones personnelles.")
      // })
    } else {
      InfoMessages.push(`L'ActGuide ne contient aucun act.`)
    }
    if (InfoMessages.length > 0)
      dialog.showMessageBox(null, {
        message: `Au moins un élément de l'ActsGuide "${actsGuideName}" n'a pas été chargés correctement.`,
        detail: InfoMessages.join("\n"),
        title: "Avertissement au chargement de l'ActsGuide",
        type: "warning",
      })
  }

  duplicateCurActsGuide(): void {
    const actsGuideName = Date.now().toString()
    const dst = this.getLocalActsGuidesDir()

    let _ident = this._ActsGuidesIdentities.find(
      identity => identity.name === this._CurActsGuide.identity.name
    )
    if (!_ident) _ident = this._ActsGuidesIdentities[0]

    fs.mkdirSync(path.join(dst, actsGuideName), { recursive: true })
    fs.mkdirSync(path.join(dst, actsGuideName, "zones"))

    fs.readdirSync(path.join(_ident.sysAssetPath, "zones"), { withFileTypes: true }).forEach(zItem => {
      if (zItem.isDirectory) {
        // console.log(`mkdir ${path.join(dst, actsGuideName, "zones", zItem.name)}`)
        fs.mkdirSync(path.join(dst, actsGuideName, "zones", zItem.name))
        fs.readdirSync(path.join(_ident.sysAssetPath, "zones", zItem.name), { withFileTypes: true }).forEach(
          imgItem => {
            if (imgItem.isFile) {
              // console.log(
              //   `cp ${path.join(_ident.sysAssetPath, "zones", zItem.name, imgItem.name)} ${path.join(dst, actsGuideName, "zones", zItem.name, imgItem.name)}`
              // )
              fs.copyFileSync(path.join(_ident.sysAssetPath, "zones", zItem.name, imgItem.name), path.join(dst, actsGuideName, "zones", zItem.name, imgItem.name))
            }
          }
        )
      }
    })

    const _actsGuide_file = path.join(dst, actsGuideName, "guide.json")
    const _src_actsGuideJson = loadJson(_ident.filename) as IActsGuide

    const _dst_actsGuidejson = {} as IActsGuide
    _dst_actsGuidejson.identity = {} as ActGuideIdentity
    _dst_actsGuidejson.acts = [] as IAct[]

    Object.assign( _dst_actsGuidejson.identity, _src_actsGuideJson.identity)

    _dst_actsGuidejson.identity.name = actsGuideName
    _src_actsGuideJson.acts.forEach(act => {
      const _dst_act = { actid: act.actid, act: act.act } as IAct
      _dst_act.zones = [] as IZone[]

      act.zones.forEach(zone => {
        const _dst_zone = {
          name: zone.name,
          image: zone.image,
          altimage: zone.altimage,
          note: zone.note,
        } as IZone
        _dst_act.zones.push(_dst_zone)
      })
      _dst_actsGuidejson.acts.push(_dst_act)
    })

    fs.writeFileSync(_actsGuide_file, JSON.stringify(_dst_actsGuidejson, null, 2))

    if (this._AppStore.get("OpenDirOnDuplicate") === true) shell.openPath(path.join(dst, actsGuideName))
    if (this._AppStore.get("OpenEditorOnDuplicate") === true) shell.openPath(_actsGuide_file)
    this.LoadJsonActsGuidesIdentities()
    this.loadCurActsGuideFromJson(actsGuideName)
    this.makeMenus()
  }

  getLocalActsGuidesDir(): string {
    return path.join(getLocalCustomPath(), "actsguides")
  }

  makeMenus(): void {
    this._Menu = Menu.buildFromTemplate([
      {
        label: "Fichier",
        submenu: [
          {
            label: "Recharger tous les fichiers (conf/guides)",
            click: () => {
              this.reloadAll()
            },
          },
          {
            label: "Fermer",
            click: () => {
              this.hide()
            },
          },
          {
            label: "Quitter",
            click: () => {
              app.quit()
            },
          },
        ],
      },

      {
        label: "Sites",
        submenu: [
          {
            label: "PathOfExile",
            click: () => {
              shell.openExternal("https://www.pathofexile.com/")
            },
          },
          {
            label: "POE Wiki",
            click: () => {
              shell.openExternal("https://www.poewiki.net/")
            },
          },
          {
            label: "PathOfExile Trade",
            click: () => {
              shell.openExternal("https://www.pathofexile.com/trade/")
            },
          },
          {
            label: "Poe Trade",
            click: () => {
              shell.openExternal("https://poe.trade/")
            },
          },
        ],
      },
      {
        label: "helpers",
        submenu: [
          {
            label: "Wraeclast",
            click: () => {
              shell.openExternal("https://wraeclast.com/")
            },
          },
          {
            label: "PoeDb",
            click: () => {
              shell.openExternal("https://poedb.tw/")
            },
          },
          {
            type: "separator",
          },
          {
            label: "Ultimatum",
            click: () => {
              this.OpenLocalHelperFile("ultimatum")
            },
          },
          {
            label: "Heist",
            click: () => {
              this.OpenLocalHelperFile("heist")
            },
          },
          {
            label: "Delve",
            click: () => {
              this.OpenLocalHelperFile("delve")
            },
          },
          {
            label: "Vendor Recipes",
            click: () => {
              this.OpenLocalHelperFile("vendorRecipes")
            },
          },
        ],
      },
      {
        label: "Guides",
        submenu: [
          {
            label: "Recharger toutes les données",
            click: () => {
              this.InitJsonData()
              this.makeMenus()
            },
          },
          {
            label: "Dupliquer le guide de classe actuel",
            click: () => {
              this.duplicateCurClassGuide()
            },
          },
          {
            label: "Dupliquer le guide d'acts actuel",
            click: () => {
              this.duplicateCurActsGuide()
            },
          },
          {
            type: "separator",
          },
          {
            label: "Guides de classes",
            id: "classGuide",
            submenu: [],
          },
          {
            label: "Guides d'Acts",
            id: "actsGuide",
            submenu: [],
          },
          {
            label: "site du Template actuel",
            id: "templateUrl",
            enabled: false,
          },
        ],
      },
    ])

    this._ActsGuidesIdentities.forEach(_identity => {
      const _menu = new MenuItem({
        label: _identity.name,
        click: () => {
          console.log("loading class Guide : ", _identity.name)
          this.changeCurActsGuide(_identity.name)
        },
      })
      this._Menu.getMenuItemById("actsGuide").submenu.append(_menu)
    })

    if (this._CurClassGuide.identity.url) {
      this._Menu.getMenuItemById("templateUrl").click = () => {
        shell.openExternal(this._CurClassGuide.identity.url)
      }
      this._Menu.getMenuItemById("templateUrl").enabled = true
    }

    this._ClassesGuidesIdentities.forEach(_identity => {
      //TODO: electronjs bug ?
      let _menu = this._Menu.getMenuItemById("classG_" + _identity.class)
      // let _menu = this._Menu.getMenuItemById("templates").submenu.getMenuItemById("guide_" + _identity.class)

      if (!_menu) {
        _menu = new MenuItem({
          label: _identity.class,
          id: "classG_" + _identity.class,
          submenu: [],
        })
      }
      _menu.submenu.append(
        new MenuItem({
          label: _identity.name,
          id: "classG_" + _identity.class + "_" + _identity.name,
          click: () => {
            console.log("loading class Guide : ", _identity.name)
            this.changeCurClassGuide(_identity.name)
          },
        })
      )
      this._Menu.getMenuItemById("classGuide").submenu.append(_menu)
    })
    this._Window.setMenu(this._Menu)
  }

  changeCurClassGuide(name: string): void {
    this.loadCurClassGuideFromJson(name)
    this._Window.webContents.send("levelingRenderer", ["classGuide", this._CurClassGuide])
    this._AppStore.set("curClassGuide", name)
  }
  changeCurActsGuide(name: string): void {
    this.loadCurActsGuideFromJson(name)
    this._Window.webContents.send("levelingRenderer", ["ActsGuide", this._CurClassGuide])
    this._AppStore.set("curActsGuide", name)
  }
}
