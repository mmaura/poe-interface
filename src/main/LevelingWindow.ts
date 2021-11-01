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
  Rectangle,
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

  private _HelperFiles: string[]

  private _CurClassGuide: IClassesGuide
  private _ClassesGuidesIdentities: ClassGuideIdentity[]
  private _RichTextJson: IRichText[]
  private _CurActsGuide: IActsGuide
  private _ActsGuidesIdentities: ActGuideIdentity[]
  private _ClassesJson: IClasses[]

  private _MyPlayer: IAppPlayer
  private _MyConn: plm_conn

  constructor(appStore: Store, AppIcon: NativeImage) {
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
    this._Window.setBounds(
      this._AppStore.get("levelingWinBounds", { x: 1, y: 1, width: 1400, height: 980 }) as Rectangle
    )

    this.InitJsonData()
    this.InitHelpers()
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
      // console.log("bounds: ",this._Window.getBounds())
      this._AppStore.set("levelingWinBounds", this._Window.getBounds())
    })

    this._Window.on("closed", () => {
      this._Window = null
    })

    /**********************************
     * IPC
     */
    ipcMain.handle("levelingRenderer", (event: IpcMainInvokeEvent, ...arg) => {
      console.log("****** ipcMain handle 'levelingRenderer': %o", arg)

      switch (arg[0]) {
        case "Init":
          console.log("Init")
          return [
            "Init",
            this._CurActsGuide,
            this._RichTextJson,
            this._CurClassGuide,
            this._MyPlayer,
            this._CurActsGuide.acts[0].actid,
            this._CurActsGuide.acts[0].zones[0].name,
          ]

        case "save":
          switch(arg[1]){
            case "zoneNotes":
              //arg[2]{ zoneName: 'The Twilight Strand', actId: 6 }
        
              this.ActsGuidesSaveZoneNote(arg[2], arg[3])
          }
          console.log("save note.")
      }
    })
    // ipcMain.handle("richText", (event: IpcMainInvokeEvent, ...arg) => {
    //   console.log("******ipcMain handle richText: %o", arg)
    //   switch (arg[0] as string) {
    //     case "reload":
    //       this._RichTextJson = loadJsonRichText(this._CurActsGuide)
    //       break
    //   }
    //   return this._RichTextJson
    // })

    // ipcMain.handle("player", (event: IpcMainInvokeEvent, ...arg) => {
    // 	console.log("******ipcMain handle player: %o", arg)
    // 	return this._MyPlayer
    // })
    // ipcMain.handle("AllActs", (event: IpcMainInvokeEvent, ...arg) => {
    // 	console.log("******ipcMain handle player: %o", arg)
    // 	return this._ActJson
    // })

    // ipcMain.handle("guide", (event: IpcMainInvokeEvent, ...arg) => {
    //   console.log("ipcMain handle guide: %o", arg)

    //   switch (arg[0] as string) {
    //     case "reload":
    //       console.log("reload:", this._CurClassGuide.identity.filename)
    //       this.loadCurClassGuideFromJson()
    //       break
    //   }
    //   event.returnValue = this._CurClassGuide
    //   return this._CurClassGuide
    // })
  }

  /**********************************
   * POE LOG
   */
  setPoeLog(poeLog: PathOfExileLog): void {
    if (poeLog !== null) {
      this._PoeLog = poeLog
      this._LogLoaded = false

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

          let _area = area.info.find(info => Math.abs(info.level - this._MyPlayer.level) < 20)
          if (!_area) _area = area.info[0]

          this._MyPlayer.currentZoneAct = _area.act

          if (this._LogLoaded === true) {
            console.log("area change : ", area)
            this._Window.webContents.send("levelingRenderer", ["playerArea", this._MyPlayer])
            this._Window.show()
          }
        }
      })
    }
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

  OpenLocalHelpersDir(): void {
    shell.openPath(this.getLocalHelpersDir())
  }

  OpenHelperFile(file: string): void {
    const exts = ["png", "jpg"]
    let filename = path.join(this.getLocalHelpersDir(), file)

    for (const ext of exts) {
      console.log(filename + "." + ext)
      if (fs.existsSync(filename + "." + ext)) {
        filename = filename + "." + ext
        break
      }
    }

    shell.openPath(filename)
  }

  private InitHelpers(): void {
    this._HelperFiles = [] as string[]
    if (!fs.existsSync(this.getLocalHelpersDir())) {
      fs.mkdirSync(this.getLocalHelpersDir(), { recursive: true })
      fs.readdirSync(path.join(getAssetPath(), "helpers"), { withFileTypes: true }).forEach(item => {
        if (item.isFile) {
          fs.copyFileSync(
            path.join(getAssetPath(), "helpers", item.name),
            path.join(this.getLocalHelpersDir(), item.name)
          )
        }
      })
    }

    fs.readdirSync(this.getLocalHelpersDir(), { withFileTypes: true }).forEach(item => {
      this._HelperFiles.push(path.basename(item.name, path.extname(item.name)))
    })
  }

  private InitJsonData(): void {
    this.InitHelpers()

    this.LoadJsonClassesGuidesIdentities()
    this.loadCurClassGuideFromJson(this._AppStore.get("curClassGuide", "default") as string)

    this.LoadJsonActsGuidesIdentities()
    this.loadCurActsGuideFromJson(this._AppStore.get("curActsGuide", "default") as string)

    this._ClassesJson = loadJsonClasses()

    this._RichTextJson = loadJsonRichText(this._CurActsGuide)
  }

  reloadAll(): void {
    this.InitHelpers()

    this._ClassesJson = loadJsonClasses()

    this.LoadJsonClassesGuidesIdentities()
    this.loadCurClassGuideFromJson()

    this.LoadJsonActsGuidesIdentities()
    this.loadCurActsGuideFromJson()

    this._RichTextJson = loadJsonRichText(this._CurActsGuide)

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

    if (!_ident) _ident = this._ClassesGuidesIdentities.find(identity => identity.name === "default")

    this._CurClassGuide = loadJson(_ident.filename) as IClassesGuide
    this._CurClassGuide = Object.assign(this._CurClassGuide, { identity: _ident })
    console.log(this._CurClassGuide)

    if (this._CurClassGuide.acts) {
      this._CurClassGuide.acts.forEach(act => {
        if (fs.existsSync(path.join(_ident.sysAssetPath, "tree-" + act.act + ".png")))
          act.treeimage = _ident.webAssetPath + "tree-" + act.act + ".png"
        else if (fs.existsSync(path.join(_ident.sysAssetPath, "tree-" + act.act + ".jpg")))
          act.treeimage = _ident.webAssetPath + "tree-" + act.act + ".jpg"
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
    console.log("ActGuide trouvé : ", filename)

    const customGuideDir = path.join(getLocalCustomPath(), "actsguides")
    if (!fs.existsSync(customGuideDir)) {
      fs.mkdirSync(customGuideDir, { recursive: true })
    } else {
      fs.readdirSync(customGuideDir).forEach(dir => {
        filename = path.join(customGuideDir, dir, "guide.json")
        if (fs.existsSync(filename)) {
          console.log("ActGuide trouvé : ", filename)
          guide = loadJson(filename) as IActsGuide
          if (guide) {
            guide.identity.filename = filename
            guide.identity.webAssetPath = "userdata://actsguides/" + dir + "/"
            guide.identity.sysAssetPath = path.join(path.join(customGuideDir, dir))
            this._ActsGuidesIdentities.push(guide.identity)
          }
        }
      })
    }
  }

  loadCurActsGuideFromJson(actsGuideName?: string): void {
    console.log("Chargement du ActsGuide", actsGuideName)

    const InfoMessages = [] as string[]
    if (actsGuideName === undefined) actsGuideName = this._CurActsGuide.identity.name

    let _default_ident = this._ActsGuidesIdentities.find(identity => identity.name === actsGuideName)

    if (!_default_ident)
      _default_ident = this._ActsGuidesIdentities.find(identity => identity.name === "default")

    const _defaultActGuide = loadJson(_default_ident.filename) as IActsGuide
    Object.assign(_defaultActGuide, { identity: _default_ident })

    if (actsGuideName !== "default") {
      let _ident = this._ActsGuidesIdentities.find(identity => identity.name === actsGuideName)

      if (!_ident) _ident = this._ActsGuidesIdentities[0]
      const _tmpActsGuide = loadJson(_ident.filename) as IActsGuide
      Object.assign(_tmpActsGuide, { identity: _ident })

      _defaultActGuide.acts.forEach(_act => {
        _act.zones.forEach(_zone => {
          const _tmp_zone = _tmpActsGuide.acts
            .find(__act => __act.actid === _act.actid)
            .zones.find(__zone => __zone.name === _zone.name)

          _tmp_zone.name !== undefined
            ? (_zone.altimage = _tmp_zone.altimage)
            : InfoMessages.push(
                `Le champ 'altimage' est manquant dans la zone  ${_zone.name} de l'act ${_act.act}`
              )
          _tmp_zone.image !== undefined
            ? (_zone.image = _tmp_zone.image)
            : InfoMessages.push(
                `Le champ 'image' est manquant dans la zone  ${_zone.name} de l'act ${_act.act}`
              )
          _tmp_zone.note !== undefined
            ? (_zone.note = _tmp_zone.note)
            : InfoMessages.push(
                `Le champ 'note' est manquant dans la zone  ${_zone.name} de l'act ${_act.act}`
              )
        })
      })

      if (InfoMessages.length > 0)
        dialog.showMessageBox(null, {
          message: `Au moins un élément de l'ActsGuide "${actsGuideName}" n'a pas été chargé correctement.`,
          detail: InfoMessages.join("\n"),
          title: "Avertissement au chargement de l'ActsGuide",
          type: "warning",
        })
    }
    console.log("this._CurActsGuide :", _defaultActGuide)
    this._CurActsGuide = _defaultActGuide
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
              fs.copyFileSync(
                path.join(_ident.sysAssetPath, "zones", zItem.name, imgItem.name),
                path.join(dst, actsGuideName, "zones", zItem.name, imgItem.name)
              )
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

    Object.assign(_dst_actsGuidejson.identity, _src_actsGuideJson.identity)

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

  ActsGuidesSaveZoneNote(zone : {zoneName: string, actId: number}, note: string): void{
    // const curloadJson(this._CurActsGuide.identity.filename)
    console.log('')

  }

  getLocalActsGuidesDir(): string {
    return path.join(getLocalCustomPath(), "actsguides")
  }

  getLocalHelpersDir(): string {
    return path.join(getLocalCustomPath(), "helpers")
  }

  makeMenus(): void {
    this._Menu = Menu.buildFromTemplate([
      {
        label: "Fichier",
        submenu: [
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
        id: "helpers",
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
            label: "Ouvrir le dossier des helpers",
            click: () => {
              this.OpenLocalHelpersDir()
            },
          },
          {
            type: "separator",
          },
        ],
      },
      {
        label: "Guides",
        submenu: [
          {
            label: "Recharger toutes les données",
            click: () => {
              this.reloadAll()
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

    this._HelperFiles.forEach(helper => {
      this._Menu.getMenuItemById("helpers").submenu.append(
        new MenuItem({
          label: `${helper}`,
          click: () => {
            console.log("loading helper file : ", helper)
            this.OpenHelperFile(helper)
          },
        })
      )
    })

    this._ActsGuidesIdentities.forEach(_identity => {
      const _menu = new MenuItem({
        label: `${_identity.game_version} - ${_identity.name} `,
        click: () => {
          console.log("loading act Guide : ", _identity.name)
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
          label: `${_identity.game_version} - ${_identity.name} `,
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
    this._Window.webContents.send("levelingRenderer", ["actsGuide", this._CurActsGuide])
    this._AppStore.set("curActsGuide", name)
  }
}
