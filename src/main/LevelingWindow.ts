import { BrowserWindow, ipcMain, NativeImage, IpcMainInvokeEvent, app, Menu, shell } from "electron"
import PathOfExileLog from "poe-log-monitor"
import path from "path"
import fs from "fs"

import {
  loadJsonAct,
  loadJsonGuide,
  loadJsonRichText,
  loadJsonClasses,
  getAssetPath,
  getLocalAssetPath,
} from "../modules/functions"

declare const LEVELING_WINDOW_WEBPACK_ENTRY: string
declare const LEVELING_WINDOW_PRELOAD_WEBPACK_ENTRY: never

export class LevelingWindow {
  protected _Window: BrowserWindow
  protected _Menu: Menu

  private _CanClose = false
  private _PoeLog: PathOfExileLog
  private _LogLoaded: boolean

  private _GuideJson: IGuide
  private _RichTextJson: IRichText[]
  private _ActJson: IActs[]
  private _ClassesJson: IClasses[]

  private _MyPlayer: IAppPlayer
  private _MyConn: plm_conn

  constructor(AppIcon: NativeImage, windowMenu: Menu) {
    this._Menu = windowMenu

    this._MyPlayer = <IAppPlayer>{}
    this._MyConn = <plm_conn>{}

    this.LoadAll()
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
    this._Window.setMenu(this._Menu)
    this._Window.loadURL(LEVELING_WINDOW_WEBPACK_ENTRY)

    //if(process.env.NODE_ENV === 'dev') this._Window.webContents.openDevTools()
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
        this._ActJson,
        this._RichTextJson,
        this._GuideJson,
        this._MyPlayer,
        this._ActJson[0].actid,
        this._ActJson[0].zones[0].name,
      ]
    })
    ipcMain.handle("richText", (event: IpcMainInvokeEvent, ...arg) => {
      console.log("******ipcMain handle richText: %o", arg)
      switch (arg[0] as string) {
        case "reload":
          this._RichTextJson = loadJsonRichText(this._ActJson)
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
          console.log("reload")
          this._GuideJson = loadJsonGuide()
          break
      }
      event.returnValue = this._GuideJson
      return this._GuideJson
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
    // console.log(characterClass)
    // console.log(this._ClassesJson)
    const _character = this._ClassesJson.find(e => {
      if (e.classe === characterClass || e.ascendancy.includes(characterClass)) return true
    })
    return _character.classe
  }

  OpenLocalHelperFile(file: string): void {
    const exts = ["png", "jpg", "gif"]
    let filename = path.join(getLocalAssetPath(), "images", "memo", file)

    for (const ext of exts) {
      console.log(filename + "." + ext)
      if (fs.existsSync(filename + "." + ext)) {
        filename = filename + "." + ext
        break
      }
    }
    shell.openPath(filename)
  }

  private LoadAll(): void {
    this._GuideJson = loadJsonGuide()

    if (this._GuideJson.identity.url) {
      this._Menu.getMenuItemById("templateUrl").click = () => {
        shell.openExternal(this._GuideJson.identity.url)
      }
      this._Menu.getMenuItemById("templateUrl").enabled = true
    }

    this._ActJson = loadJsonAct()
    this._RichTextJson = loadJsonRichText(this._ActJson)
    this._ClassesJson = loadJsonClasses()
  }

  ReloadAll(): void {
    this.LoadAll()

    this._Window.webContents.send("levelingRenderer", [
      "All",
      this._ActJson,
      this._RichTextJson,
      this._GuideJson,
    ])
  }
}
