import { BrowserWindow, dialog, ipcMain, NativeImage, app, IpcMainInvokeEvent } from "electron"

import { MyLogger } from "../modules/functions"

import Store from "electron-store"
import fs from "fs"

declare const CONFIG_WINDOW_WEBPACK_ENTRY: string
declare const CONFIG_WINDOW_PRELOAD_WEBPACK_ENTRY: never

export class ConfigWindow {
  private _PoeLogPath = ""
  protected _Window: BrowserWindow

  private _CanClose = false
  private _AppStore: Store

  constructor (appStore: Store, AppIcon: NativeImage) {
    this._Window = new BrowserWindow({
      width: 600,
      height: 400,
      icon: AppIcon,
      title: "Configuration",
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        //worldSafeExecuteJavaScript: true,
        preload: CONFIG_WINDOW_PRELOAD_WEBPACK_ENTRY,
      },
    })

    this._AppStore = appStore
    this._PoeLogPath = this._AppStore.get("poe_log_path", "") as string

    this._Window.loadURL(CONFIG_WINDOW_WEBPACK_ENTRY)
    if (!app.isPackaged) {
      this._Window.webContents.openDevTools({ mode: "detach" })
    }
    this._Window.setMenu(null)

    /**********************************
     * Window Events
     */

    this._Window.on("show", () => {
      if (!this._PoeLogPath) this.ShowPoeLogDialog()
    })

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
    ipcMain.handle("configRenderer", (event: IpcMainInvokeEvent, ...arg) => {
      MyLogger.log('info', `ipcMain handle 'levelingRenderer': ${arg}`)

      switch (arg[0]) {
        case "Init":
          MyLogger.log('info', `Message: Init`)
          return [
            "Init",
            this.getPoeLogPath(),
          ]
          break
        case "showPoeLogPathDialog":
          MyLogger.log('info', `Select Poe Path`)
          this.ShowPoeLogDialog(arg[1])
          break

      }
    })



    //   ipcMain.handle("configWindow", (event, arg: any) => {
    //     let response = {}

    //     switch (arg.func) {
    //       case "getInitData":
    //         response = {
    //           poeLogPath: this.getPoeLogPath(),
    //         }
    //         break
    //     }
    //     return response
    //   })
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


  getConfigValue(configValue: string): unknown {
    return this._AppStore.get(configValue)
  }

  getConfigValueDefault(configValue: string, defaultValue: string): unknown {
    return this._AppStore.get(configValue, defaultValue)
  }

  getPoeLogPath(): string {
    if (fs.existsSync(this._PoeLogPath)) {
      return this._PoeLogPath
    }
    return ""
  }

  setPoeLogPath(path: string): void {
    this._PoeLogPath = path
    this._AppStore.set("poe_log_path", this._PoeLogPath)
  }


  ShowPoeLogDialog(curPath?: string): void {
    if (!curPath) curPath = this.getPoeLogPath()

    dialog
      .showOpenDialog({
        filters: [{ name: "poe log file", extensions: ["txt", "log"] }],
        title: "Please choose PathOfExile log file",
        properties: ["openFile", "showHiddenFiles"],
        defaultPath: curPath,
      })
      .then(result => {
        if (result.canceled === false) {
          this.setPoeLogPath(result.filePaths[0])
          // this._Window.webContents.send("poeLogPath", result.filePaths[0])
          this._Window.webContents.send("configRenderer", ["poeLogPath", result.filePaths[0]])


        }
      })
      .catch(err => {

        MyLogger.log(err)
      })
  }
}
