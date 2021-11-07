import { BrowserWindow, ipcMain, NativeImage, IpcMainInvokeEvent, app, Menu, shell, MenuItem, dialog, Rectangle } from "electron"
import path from "path"
import fs from "fs"

import Store from "electron-store"
import PathOfExileLog from "poe-log-monitor"
import merge from 'lodash.merge'

import { getLocalCustomPath, getAssetPath, extractActsBaseGuide, debugMsg, extractActsCustomGuide, } from "../modules/functions"

import { ClassesGuides } from "../modules/ClassesGuides"
import { JsonFile } from "../modules/JsonFile"
import { ActsGuides } from "../modules/ActsGuides"

declare const LEVELING_WINDOW_WEBPACK_ENTRY: string
declare const LEVELING_WINDOW_PRELOAD_WEBPACK_ENTRY: never

export class LevelingWindow {
  protected _Window: BrowserWindow
  protected _Menu: Menu
  protected _Icon: NativeImage

  private _AppStore: Store

  private _CanClose = false
  private _PoeLog: PathOfExileLog
  private _LogLoaded: boolean

  private _HelperFiles: string[]

  private ClassGuides: ClassesGuides
  private ActsGuides: ActsGuides
  private RichTextJson: JsonFile<IRichText[]>
  private ClassesJson: JsonFile<IClasses[]>
  private Zones: JsonFile<IActsGuide>

  private _MyPlayer: IAppPlayer
  private _MyConn: plm_conn

  constructor(appStore: Store, AppIcon: NativeImage) {
    this._AppStore = appStore
    this._Icon = AppIcon

    this._MyPlayer = <IAppPlayer>{}
    this._MyConn = <plm_conn>{}

    this.ClassGuides = new ClassesGuides()
    this.ActsGuides = new ActsGuides()
    this.RichTextJson = new JsonFile(path.join(getAssetPath(), "data", "richtext.json"))
    this.ClassesJson = new JsonFile(path.join(getAssetPath(), "data", "classes.json"))
    this.Zones = new JsonFile(path.join(getAssetPath(), "data", "zones.json"))

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
      }
    })

    this.LoadData().then(() => {
      this.makeMenus()

      this._Window.loadURL(LEVELING_WINDOW_WEBPACK_ENTRY)
      if (!app.isPackaged) this._Window.webContents.openDevTools({ mode: "detach" })

      this._Window.setBounds(this._AppStore.get("levelingWinBounds", { x: 1, y: 1, width: 1400, height: 980 }) as Rectangle)
    }).catch(e => {
      dialog.showMessageBox(null, { title: "Error", message: `unable to load data.\n${e}`, icon: AppIcon })
    })

    /**********************************
     * IPC
     */
    ipcMain.handle("levelingRenderer", (event: IpcMainInvokeEvent, ...arg) => {
      const MergedActGuide = {} as IActsGuide
      console.log("****** ipcMain handle 'levelingRenderer': %o", arg)

      switch (arg[0]) {
        case "Init":
          console.log("Init")
          merge(MergedActGuide, this.Zones.getObject(), this.ActsGuides.getCurGuide())
          return [
            "Init",
            MergedActGuide,
            this.RichTextJson.getObject(),
            this.ClassGuides.getCurGuide(),
            this._MyPlayer,
            MergedActGuide.acts[0].actid,
            MergedActGuide.acts[0].zones[0].name,
          ]

        case "save": switch (arg[1]) {
          case "zoneNotes":
            console.log("save note.")
            this.ActsGuidesSaveZoneNote(arg[2], arg[3])
            break
        }
      }
    })

    /************************
     * Window Events
     */
    this._Window.on("close", e => {
      if (this._CanClose === false) {
        this._Window.hide()
        e.preventDefault()
      }
      this._AppStore.set("levelingWinBounds", this._Window.getBounds())
    })

    this._Window.on("closed", () => {
      this._Window = null
    })
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
    const _character = this.ClassesJson.getObject().find((e: IClasses) => {
      if (e.classe === characterClass || e.ascendancy.includes(characterClass)) return true
    })
    return _character.classe
  }

  OpenCustomDir(): void {
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
      fs.readdirSync(path.join(getAssetPath(), "helpers"), { withFileTypes: true })
        .forEach(item => {
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

  private async LoadData() {
    this.InitHelpers()

    await Promise.all([
      this.ClassGuides.Init(this._AppStore.get("curClassGuide", "default") as string),
      this.ActsGuides.Init(this._AppStore.get("curActsGuide", "default") as string),
      this.RichTextJson.load(),
      this.ClassesJson.load(),
      this.Zones.load(),
    ]).catch(err => {
      const msg = `Error On LoadData\n${err}\n${this.ClassGuides.Warning.join('\n')}\n${this.ActsGuides.Warning.join('\n')}`
      debugMsg(msg)
      dialog.showMessageBox(null, {
        message: `Error on loading class guides.`,
        detail: msg,
        title: "Error",
        type: "warning",
      })
    })
  }

  ActsGuidesSaveZoneNote(zone: { zoneName: string, actId: number }, note: string): void {
    // const curloadJson(this._CurActsGuide.identity.filename)
    console.log('')
  }

  getLocalHelpersDir(): string {
    return path.join(getLocalCustomPath(), "helpers")
  }

  changeCurClassGuide(filename: string): void {
    this._Window.webContents.send("levelingRenderer", ["classGuide", this.ClassGuides.setCurGuide(filename)])
    this._AppStore.set("curClassGuide", filename)
  }

  changeCurActsGuide(filename: string): void {
    this._Window.webContents.send("levelingRenderer", ["actsGuide", this.ActsGuides.setCurGuide(filename)])
    this._AppStore.set("curActsGuide", filename)
  }

  makeMenus(): void {
    this._Menu = Menu.buildFromTemplate([
      {
        label: "Fichier",
        submenu: [
          {
            label: "OpenCustom directory",
            click: () => {
              this.OpenCustomDir()
            },
          },
          {
            type: "separator",
          },
          {
            label: "Hide",
            click: () => {
              this.hide()
            },
          },
          {
            label: "Quit application",
            click: () => {
              app.quit()
            },
          },
        ],
      },

      {
        label: "Web sites",
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
        ],
      },
      {
        label: "Guides",
        submenu: [
          {
            label: "Reload all data",
            click: () => {
              this.LoadData()
            },
          },
          {
            label: "Duplicate the current class guide",
            click: () => {
              this.ClassGuides.DuplicateCurGuide()
              this.LoadData()
            },
          },
          {
            label: "Duplicate the current acts guide",
            click: () => {
              this.ActsGuides.DuplicateCurGuide()
              this.LoadData()
            },
          },
          {
            type: "separator",
          },
          {
            label: "class guides",
            id: "classGuide",
            submenu: [],
          },
          {
            label: "acts guides",
            id: "actsGuide",
            submenu: [],
          },
          {
            label: "Current class guide web site",
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

    this.ActsGuides.getIdentities().forEach(_identity => {
      const _menu = new MenuItem({
        label: this.ActsGuides.getGuideLabel(_identity.filename),
        icon: _identity.filename === this.ActsGuides.getCurGuideID() ? this._Icon : undefined,

        id: `${_identity.filename}`,
        click: () => {
          console.log(`loading acts Guide :${this.ActsGuides.getGuideLabel(_identity.filename)} \n ${_identity.filename}`)
          this.changeCurActsGuide(_identity.filename)
        },
      })
      this._Menu.getMenuItemById("actsGuide").submenu.append(_menu)
    })


    if (this.ClassGuides.getCurGuide().identity.url) {
      this._Menu.getMenuItemById("templateUrl").click = () => {
        shell.openExternal(this.ClassGuides.getCurGuide().identity.url)
      }
      this._Menu.getMenuItemById("templateUrl").enabled = true
    }

    this.ClassGuides.getIdentities().forEach(_identity => {
      let must_append = false
      let _menu = this._Menu.getMenuItemById("classesG_" + _identity.class)

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
          label: this.ClassGuides.getGuideLabel(_identity.filename),
          icon: _identity.filename === this.ClassGuides.getCurGuideID() ? this._Icon : undefined,
          id: `${_identity.filename}`,
          click: () => {
            console.log(`loading class Guide :${this.ClassGuides.getGuideLabel(_identity.filename)} \n ${_identity.filename}`)
            this.changeCurClassGuide(_identity.filename)
          },
        })
      )
      if (must_append === true) this._Menu.getMenuItemById("classGuide").submenu.append(_menu)
    })

    if (app.isPackaged === false) {
      const _menu = new MenuItem(
        {
          type: "submenu",
          label: "Dev Menu",
          submenu: [{
            label: `extract actBaseGuide`,
            click: () => {
              console.log("extract guide")
              extractActsBaseGuide()
            }
          },{
            label: `extract actCustomGuide`,
            click: () => {
              console.log("extract guide")
              extractActsCustomGuide()
            }
          }]
        })
      this._Menu.append(_menu)
    }
    this._Window.setMenu(this._Menu)
  }
}
