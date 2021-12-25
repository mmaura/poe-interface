import { BrowserWindow, ipcMain, NativeImage, IpcMainInvokeEvent, app, Menu, shell, MenuItem, dialog, Rectangle, OpenDialogReturnValue } from "electron"

import path from "path"
import fs from "fs"

import Store from "electron-store"
import PathOfExileLog from "poe-log-monitor"

import { getAbsPackagedPath, extractActsBaseGuide, extractActsCustomGuide, getAbsCustomPath, MyLogger } from "../modules/functions"

import { ClassesGuides } from "../modules/ClassesGuides"
import { JsonFile } from "../modules/JsonFile"
import { ActsGuides } from "../modules/ActsGuides"
import { GameHelpers } from "../modules/GameHelper"

declare const LEVELING_WINDOW_WEBPACK_ENTRY: string
declare const LEVELING_WINDOW_PRELOAD_WEBPACK_ENTRY: never

export class LevelingWindow {
  public _Window: BrowserWindow
  protected _Menu: Menu
  protected _Icon: NativeImage

  private _AppStore: Store

  private _CanClose = false
  private _PoeLog: PathOfExileLog
  private _PoeLogLoaded: boolean

  private ClassGuides: ClassesGuides
  private ActsGuides: ActsGuides
  private RichTextJson: JsonFile<IRichText[]>
  private PlayersClasses: JsonFile<IClassesAscendancies[]>
  private ActsZonesSkeleton: JsonFile<IActsZonesSkel>
  private GameHelpers: GameHelpers

  private _MyPlayer: IAppPlayer
  private _MyConn: plm_conn

  constructor (appStore: Store, AppIcon: NativeImage) {
    this._AppStore = appStore
    this._Icon = AppIcon

    this._MyPlayer = <IAppPlayer>{ name: "", characterClass: "", level: 1, characterAscendancy: "", currentZoneAct: 1, currentZoneName: "" }
    this._MyConn = <plm_conn>{}

    this.ClassGuides = new ClassesGuides()
    this.ActsGuides = new ActsGuides()

    this.RichTextJson = new JsonFile(path.join(getAbsPackagedPath(), "data", "richtext.json"))
    this.PlayersClasses = new JsonFile(path.join(getAbsPackagedPath(), "data", "classes.json"))
    this.ActsZonesSkeleton = new JsonFile(path.join(getAbsPackagedPath(), "data", "zones.json"))
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
  }

  async Init(): Promise<void> {
    this.LoadData().finally(() => {
      MyLogger.info("All data loaded.")

      this.makeMenus()

      this._Window.loadURL(LEVELING_WINDOW_WEBPACK_ENTRY)
      if (!app.isPackaged) {
        this._Window.webContents.openDevTools({ mode: "detach" })
      }
      this._Window.setBounds(this._AppStore.get("levelingWinBounds", { x: 1, y: 1, width: 1400, height: 980 }) as Rectangle)

      /************************
        * Class Guides Events
        */
      this.ClassGuides.on('GuideContentChanged', (guide => {
        this._Window.webContents.send("levelingRenderer", ["ClassGuide", "GuideContentChanged", guide])
      }))

      this.ClassGuides.on("GuideIdentityChanged", (guide => {
        this._Window.webContents.send("levelingRenderer", ["ClassGuide", "GuideIdentityChanged", guide])
        this._AppStore.set("curClassGuide", guide.identity.filename)
        this.makeMenus()
      }))

      this.ClassGuides.on("ChangeSelectedGuide", (guide => {
        this._Window.webContents.send("levelingRenderer", ["ClassGuide", "ChangeSelectedGuide", guide])
        this._AppStore.set("curClassGuide", guide.identity.filename)
        this.makeMenus()
      }))

      /************************
       * Acts Guides Events
       */
      this.ActsGuides.on("GuideContentChanged", ((guide) => {
        this._Window.webContents.send("levelingRenderer", ["ActsGuide", "GuideContentChanged", guide])
      }))

      this.ActsGuides.on("GuideIdentityChanged", (guide => {
        this._Window.webContents.send("levelingRenderer", ["ActsGuide", "GuideIdentityChanged", guide])
        this._AppStore.set("curActsGuide", guide.identity.filename)
        this.makeMenus()
      }))

      this.ActsGuides.on("ChangeSelectedGuide", (guide => {
        this._Window.webContents.send("levelingRenderer", ["ActsGuide", "ChangeSelectedGuide", guide])
        this._AppStore.set("curActsGuide", guide.identity.filename)
        this.makeMenus()
      }))
    }).catch(e => {
      MyLogger.log('info', `Error during initialising and loading data : ${e}`)
    })

    /**********************************
     * IPC
     */
    ipcMain.handle("levelingRenderer", (event: IpcMainInvokeEvent, ...arg) => {
      MyLogger.log('info', `ipcMain handle 'levelingRenderer': ${arg}`)

      switch (arg[0]) {
        case "Init":
          MyLogger.log('info', `Message: Init`)
          return [
            "Init",
            this.ActsGuides.getGuide(),
            this.RichTextJson.getObject(),
            this.ClassGuides.getGuide(),
            this._MyPlayer,
            this.ActsGuides.getGuide().acts[0].actId,
            this.ActsGuides.getGuide().acts[0].zones[0].name,
            this.PlayersClasses.getObject(),
            this.ClassGuides.getGemsList(),
            this._PoeLogLoaded
          ]

        case "saveActGuide":
          MyLogger.log('info', `saveActGuide`)

          switch (arg[1]) {
            case "zoneNote":
              MyLogger.log('info', `zoneNote`)
              this.ActsGuides.SaveZoneNote(arg[2], arg[3], arg[4])
              return
              break
            case "navigationNote":
              MyLogger.log('info', `NavigationNote`)
              this.ActsGuides.SaveNavigationNote(arg[2], arg[3], arg[4])
              return
              break
            case "identity":
              MyLogger.log('info', `identity`)
              this.ActsGuides.saveNewIdentity(arg[2]).then(() => { this.makeMenus() })
              return
              break
          }
          return
          break
        case "saveClassGuide":
          MyLogger.log('info', `saveClassGuide`)

          switch (arg[1]) {
            case "skilltree":
              MyLogger.log('info', `Choose skilltree ${arg[2]}`)
              MyLogger.log('info', this.ClassGuides.getTreeImagePath(arg[2]))
              this.loadImage(`Choose skilltree for act ${arg[2]}`, this.ClassGuides.getTreeImagePath(arg[2])).then((result) => {
                if (!result.canceled) {
                  this.ClassGuides.setTreeImagePath(result.filePaths[0], arg[2])
                  this._Window.webContents.send("levelingRenderer", ["ClassGuide", "GuideContentChanged", this.ClassGuides.getGuide()])
                }
                MyLogger.log('info', result)
              })
              break
            case "identity":
              MyLogger.log('info', `saveClassGuide: identity(${arg[2]})`)
              this.ClassGuides.saveNewIdentity(arg[2]).then(() => { this.makeMenus() })

              break
            //group
            case "GearName":
              MyLogger.log('info', `saveClassGuide: GearName (id: ${arg[2]}, name: ${arg[3]})`)
              this.ClassGuides.setGearName(arg[2], arg[3])
              break
            case "GearNotes":
              MyLogger.log('info', `saveClassGuide: GearNotes (id: ${arg[2]}, notes: ${arg[3]}, actid: ${arg[4]})`)
              this.ClassGuides.setGearNotes(arg[2], arg[3], arg[4])
              break
            case "ActNotes":
              MyLogger.log('info', `saveClassGuide: ActNotes ( notes: ${arg[2]}, actid: ${arg[3]})`)
              this.ClassGuides.setActNotes(arg[3], arg[2])
              break
            case "addGear":
              MyLogger.log('info', `saveClassGuide: addGear ( actid: ${arg[2]})`)
              this.ClassGuides.addGear(arg[2])
              break
            case "delGear":
              MyLogger.log('info', `saveClassGuide: delGear (gearName: ${arg[2]}, actid: ${arg[3]})`)
              this.ClassGuides.delGear(arg[2], arg[3])
              break
            case "delGearInAllActs":
              MyLogger.log('info', `saveClassGuide: delGearInAllActs ( gearName: ${arg[2]})`)
              this.ClassGuides.delGearInAllActs(arg[2])
              break
            case "copyToNextAct":
              MyLogger.log('info', `saveClassGuide: copyToNextAct ( curactid: ${arg[2]})`)
              this.ClassGuides.copyToNextAct(arg[2]).then((resolve) => {
                this._MyPlayer.currentZoneAct = resolve.actId
                this._Window.webContents.send("levelingRenderer", ["playerAreaChange", this._MyPlayer])
              })
              break
            // gems
            case "addGearSlot":
              MyLogger.log('info', `saveClassGuide: addGearSlot ( gearId: ${arg[2]}, actid: ${arg[3]})`)
              this.ClassGuides.addGearSlot(arg[2], arg[3])
              break
            case "setGearGem": //curGemEdit:{ actId: 0, gearName: "", gemIndex: 0 }, newName
              MyLogger.log('info', `saveClassGuide: setGearGem ( curGemEdit: ${arg[2]}, actid: ${arg[3]})`)
              this.ClassGuides.setGearGem(arg[2], arg[3])
              break
            case "delGearGem": //curGemEdit:{ actId: 0, gearName: "", gemIndex: 0 }, newName
              MyLogger.log('info', `saveClassGuide: delGearGem ( curGemEdit: ${arg[2]})`)
              this.ClassGuides.delGearGem(arg[2])
              break
          }
          return
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
      this._PoeLogLoaded = false

      this._PoeLog.on("parsingComplete", () => {
        this._PoeLogLoaded = true
        this._Window.webContents.send("levelingRenderer", ["poeParseComplete", this._MyPlayer])
      })

      this._PoeLog.on("level", data => {
        this._MyPlayer.name = data.name
        this._MyPlayer.characterClass = this.getCharacterClass(data.characterClass)
        this._MyPlayer.characterAscendancy = data.characterClass
        this._MyPlayer.level = data.level

        if (this._PoeLogLoaded === true) {
          this._Window.webContents.send("levelingRenderer", ["playerLevelUp", this._MyPlayer])
        }
      })

      this._PoeLog.on("area", area => {
        let _area

        if (this._PoeLogLoaded) console.log("AREA CHANGE: %o", area)
        switch (area.type) {

          /*
          labs: 
            type: unknown
              'Estate Walkways'
              'Aspirant's Trial'
              'Sepulchre Halls'
              'Sanitorium Halls'
              'Mansion Atrium'
          hideouts:
            type unknown
              'Coral Hideout'

          */

          case "labyrinth":
            if (area.name === "Aspirants' Plaza") {
              this._MyPlayer.currentZoneName = area.name
              this._MyPlayer.currentZoneAct = 50 //Lab actid = 50
            }
            break

          case "area":
            this._MyPlayer.currentZoneName = area.name
            _area = area.info.find(info => Math.abs(info.level - this._MyPlayer.level) < 20)
            if (!_area) _area = area.info[0]
            this._MyPlayer.currentZoneAct = _area.act
            break
        }

        if (this._PoeLogLoaded === true) {
          this._Window.webContents.send("levelingRenderer", ["playerAreaChange", this._MyPlayer])
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
    const _character = this.PlayersClasses.getObject().find((e: IClassesAscendancies) => {
      if (e.classe === characterClass || e.ascendancy.includes(characterClass)) return true
    })
    return _character.classe
  }

  OpenCustomDir(): void {
    if (!fs.existsSync(getAbsCustomPath())) fs.mkdirSync(getAbsCustomPath(), { recursive: true })
    shell.openPath(getAbsCustomPath())
  }


  private async LoadData(): Promise<void> {
    await this.ActsZonesSkeleton.Init().then(() => {

      this.ActsZonesSkeleton.getObject().acts.sort((a, b) => a.actId - b.actId)

      this.ActsGuides.setActsZonesSkeleton(this.ActsZonesSkeleton.getObject())
      this.ClassGuides.setActsZonesSkeleton(this.ActsZonesSkeleton.getObject())
    }).catch((e) => {
      MyLogger.error("Error when loading Skeleton Guides")
    })

    await Promise.all([
      this.ActsGuides.Init(this._AppStore.get("curActsGuide", "default") as string).catch((e) => {
        MyLogger.error("Error when loading Acts Guides")
      }),
      this.ClassGuides.Init(this._AppStore.get("curClassGuide", "default") as string).catch((e) => {
        MyLogger.error("Error when loading Classes Guides")
      }),
      this.RichTextJson.Init().catch((e) => {
        MyLogger.error("Error when loading Richtext Guides")
      }),
      this.PlayersClasses.Init().catch((e) => {
        MyLogger.error("Error when loading PlayerClasses Guides")
      }),
      this.GameHelpers.Init().catch((e) => {
        MyLogger.error("Error when loading GameHelpers Guides")
      }),
    ])
  }

  async makeMenus(): Promise<void> {
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
            label: "Show Configuration window",
            click: () => {
              ipcMain.emit("showConfigWindow")
            },
          },
          {
            label: "Reload all data",
            click: () => {
              this.LoadData().then(() => this._Window.webContents.send("levelingRenderer", ["All",
                this.ActsGuides.getGuide(),
                this.RichTextJson.getObject(),
                this.ClassGuides.getGuide(),
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
        submenu: [],
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
            label: "Path Of Exile - Official",
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
            label: "Path Of Exile - Trade",
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

    // this._Menu.append(new MenuItem(
    //   {
    //     type: "submenu",
    //     label: "Commands",
    //     submenu: [{
    //       label: `Prev zone`,
    //       accelerator: process.platform === 'darwin' ? 'numsub' : 'numsub',
    //       click: () => {
    //         this._Window.webContents.send("levelingRenderer", ["changeZone","prevZone"])
    //       }
    //     },
    //     {
    //       label: `Next zone`,
    //       accelerator: process.platform === 'darwin' ? 'numadd' : 'numadd',
    //       click: () => {
    //         this._Window.webContents.send("levelingRenderer", ["changeZone","nextZone"])
    //       }
    //     },
    //     {
    //       label: `Prev act`,
    //       accelerator: process.platform === 'darwin' ? 'Cmd+numsub' : 'Ctrl+numsub',
    //       click: () => {
    //         this._Window.webContents.send("levelingRenderer", ["changeZone","prevAct"])
    //       }
    //     },
    //     {
    //       label: `Prev act`,
    //       accelerator: process.platform === 'darwin' ? 'Cmd+numadd' : 'Ctrl+numadd',
    //       click: () => {
    //         this._Window.webContents.send("levelingRenderer", ["changeZone","nextAct"])
    //       }
    //     }
    //     ]
    //   }))

    if (app.isPackaged === false) {
      const _menu = new MenuItem(
        {
          type: "submenu",
          label: "Dev Menu",
          submenu: [{
            label: `extract actBaseGuide`,
            click: () => {
              extractActsBaseGuide()
            }
          },
          {
            label: `extract actCustomGuide`,
            click: () => {
              extractActsCustomGuide()
            }
          },
          ]
        })
      this._Menu.append(_menu)
    }
    this._Window.setMenu(this._Menu)
  }
}
