import { BrowserWindow, ipcMain, NativeImage, IpcMainInvokeEvent, app, Menu, shell, MenuItem, dialog, Rectangle, OpenDialogReturnValue } from "electron"
// import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer'

import path from "path"
import fs from "fs"

import Store from "electron-store"
import PathOfExileLog from "poe-log-monitor"
import merge from 'lodash.merge'

import { getAssetPath, extractActsBaseGuide, extractActsCustomGuide, getAbsCustomPath, } from "../modules/functions"

import { ClassesGuides } from "../modules/ClassesGuides"
import { JsonFile } from "../modules/JsonFile"
import { ActsGuides } from "../modules/ActsGuides"
import { GameHelpers } from "../modules/GameHelper"

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

  private ClassGuides: ClassesGuides
  private ActsGuides: ActsGuides
  private RichTextJson: JsonFile<IRichText[]>
  private PlayersClasses: JsonFile<IPlayerClasses[]>
  private Zones: JsonFile<IActsGuide>
  private GameHelpers: GameHelpers

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
    this.PlayersClasses = new JsonFile(path.join(getAssetPath(), "data", "classes.json"))
    this.Zones = new JsonFile(path.join(getAssetPath(), "data", "zones.json"))
    this.GameHelpers = new GameHelpers()

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

    this.LoadData().finally(() => {
      this.makeMenus()

      this._Window.loadURL(LEVELING_WINDOW_WEBPACK_ENTRY)
      if (!app.isPackaged) {
        this._Window.webContents.openDevTools({ mode: "detach" })
        // // Install extensions
        // installExtension(REACT_DEVELOPER_TOOLS)
        //   .then(name => console.log(`Added Extension:  ${name}`))
        //   .catch(err => console.log('An error occurred: ', err));
        // installExtension(REDUX_DEVTOOLS)
        //   .then(name => console.log(`Added Extension:  ${name}`))
        //   .catch(err => console.log('An error occurred: ', err));
      }
      this._Window.setBounds(this._AppStore.get("levelingWinBounds", { x: 1, y: 1, width: 1400, height: 980 }) as Rectangle)
    })
    // .catch(e => {
    //   dialog.showMessageBox(null, { title: "Error", message: `unable to load data.\n${e}`, icon: AppIcon })
    // })

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
            this.PlayersClasses.getObject()
          ]

        case "saveCurActGuide": switch (arg[1]) {
          case "zoneNote":
            this.ActsGuides.SaveZoneNote(arg[2], arg[3], arg[4])
            break
          case "NavigationNote":
            this.ActsGuides.SaveNavigationNote(arg[2], arg[3], arg[4])
            break
          case "identity":
            this.ActsGuides.SaveIdentity(arg[2])
            this.makeMenus()
            break
        }
          break
        case "saveClassGuide": switch (arg[1]) {
          case "skilltree":
            console.log(`Choose skilltree ${arg[2]}`)
            console.log(this.ClassGuides.getTreeImagePath(arg[2]))
            this.loadImage(`Choose skilltree for act ${arg[2]}`, this.ClassGuides.getTreeImagePath(arg[2])).then((result) => {
              if (!result.canceled) {
                this.ClassGuides.setTreeImagePath(result.filePaths[0], arg[2])
                this._Window.webContents.send("levelingRenderer", ["classGuide", this.ClassGuides.getCurGuide()])
              }
              console.log(result)
            })
            break
        }
          break
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


    /************************
     * Guides Events
     */
    this.ClassGuides.on("GuideChange", (guide => {
      this._Window.webContents.send("levelingRenderer", ["classGuide", guide])
      this._AppStore.set("curClassGuide", guide.identity.filename)
      this.makeMenus()
    }))

    this.ClassGuides.on("Log", ((msg, level) => {
      // LogMessage(msg, level)
    }))

    this.ActsGuides.on("GuideChange", (guide => {
      const MergedActGuide = {} as IActsGuide
      merge(MergedActGuide, this.Zones.getObject(), guide)

      this._Window.webContents.send("levelingRenderer", ["actsGuide", MergedActGuide])
      this._AppStore.set("curActsGuide", guide.identity.filename)
      this.makeMenus()
    }))

    this.ActsGuides.on("Log", ((msg, level) => {
      // LogMessage(msg, level)
    }))
  }

  async loadImage(title: string, defaultPath: string): Promise<OpenDialogReturnValue> {
    return dialog.showOpenDialog(this._Window, {
      defaultPath: defaultPath,
      title: title,
      filters: [{ name: 'Images', extensions: ['jpg', 'png'] }],
      properties: ['openFile',]
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
    const _character = this.PlayersClasses.getObject().find((e: IPlayerClasses) => {
      if (e.classe === characterClass || e.ascendancy.includes(characterClass)) return true
    })
    return _character.classe
  }

  OpenCustomDir(): void {
    if (!fs.existsSync(getAbsCustomPath())) fs.mkdirSync(getAbsCustomPath(), { recursive: true })
    shell.openPath(getAbsCustomPath())
  }

  private async LoadData() {
    await Promise.all([
      this.ClassGuides.Init(this._AppStore.get("curClassGuide", "default") as string),
      this.ActsGuides.Init(this._AppStore.get("curActsGuide", "default") as string),
      this.RichTextJson.load(),
      this.PlayersClasses.load(),
      this.Zones.load(),
      this.GameHelpers.Init(),
    ])
  }

  makeMenus(): void {
    this._Menu = Menu.buildFromTemplate([
      {
        label: "File",
        submenu: [
          {
            label: "Open Custom directory",
            click: () => {
              this.OpenCustomDir()
            },
          },
          {
            label: "Reload all data",
            click: () => {
              const MergedActGuide = {} as IActsGuide
              merge(MergedActGuide, this.Zones.getObject(), this.ActsGuides.getCurGuide())

              this.LoadData().then(() => this._Window.webContents.send("levelingRenderer", ["All",
                MergedActGuide,
                this.RichTextJson.getObject(),
                this.ClassGuides.getCurGuide(),
                this.PlayersClasses.getObject()
              ]))
            },
          },

          { type: "separator" },
          { role: "hide" },
          { role: 'quit' },
        ],
      },
      {
        label: "Class guides",
        id: "classGuide",
        submenu: [],
      },
      {
        label: "acts guides",
        id: "actsGuide",
        submenu: [
          {
            label: "Duplicate current guide",
            click: () => {
              this.ActsGuides.DuplicateCurGuide().then(guide => {
                this.ActsGuides.setCurGuide(guide)
                this.LoadData()
              })
            },
          },
          { type: "separator" },

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
          { type: "separator" },
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
    ])

    this.GameHelpers.AppendMenu(this._Menu.getMenuItemById("helpers"))
    this.ActsGuides.AppendMenu(this._Menu.getMenuItemById("actsGuide"))
    this.ClassGuides.AppendMenu(this._Menu.getMenuItemById("classGuide"), this.PlayersClasses.getObject())

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
          }, {
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
