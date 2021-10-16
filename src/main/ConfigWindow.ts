import { BrowserWindow, dialog, ipcMain } from "electron";
import Store from "electron-store";
import fs from "fs";

declare const CONFIG_WINDOW_WEBPACK_ENTRY: string;
declare const CONFIG_WINDOW_PRELOAD_WEBPACK_ENTRY: never;

export class ConfigWindow {
  private _PoeLogPath: string;
  protected _Window: BrowserWindow;

  private _CanClose = false;
  private _AppStore: Store;

  constructor(appStore: any) {
    this._Window = new BrowserWindow({
      width: 1080,
      height: 1200,
      icon: "resources/images/ExaltedOrb.png",
      title: "Configuration",
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        //worldSafeExecuteJavaScript: true,
        preload: CONFIG_WINDOW_PRELOAD_WEBPACK_ENTRY,
      },
    });

    this._AppStore = appStore;

    console.log("create config window");

    this._PoeLogPath = this._AppStore.get("poe_log_path", "") as string;

    this._Window.loadURL(CONFIG_WINDOW_WEBPACK_ENTRY);
    this._Window.webContents.openDevTools();
    this._Window.setMenu(null)

    this._Window.on("close", (e) => {
      if (this._CanClose === false) {
        this._Window.hide();
        e.preventDefault();
      }
    });

    this._Window.on("closed", () => {
      this._Window = null;
    });

    /**********************************
     * IPC
     */
    ipcMain.handle("configWindow", (event, arg: ISendParam) => {
      let response: any = { status: "bad request" };

      switch (arg.func) {
        case "getInitData":
          response = {
            poeLogPath: this.getPoeLogPath(),
          };
          break;
        case "showPoeLogPathDialog":
          // return value never good since showOpenDialogSync
          // return this.ShowPoeLogDialog(arg.var[0]);
          this.ShowPoeLogDialog(arg.var[0]);
          break;
      }
      return response;
    });
  }

  getConfigValue(configValue: string): unknown {
    return this._AppStore.get(configValue);
  }

  getConfigValueDefault(configValue: string, defaultValue: string): unknown {
    return this._AppStore.get(configValue, defaultValue);
  }

  getPoeLogPath(): string {
    if (fs.existsSync(this._PoeLogPath)) {
      return this._PoeLogPath;
    }
    return "";
  }

  setPoeLogPath(path: string): void {
    this._PoeLogPath = path;
    this._AppStore.set("poe_log_path", this._PoeLogPath);
  }

  setCanClose(state: boolean): void {
    this._CanClose = state;
  }

  close(): void {
    this._CanClose = true;
    this._Window.close();
  }

  show(): void {
    this._Window.show();
  }

  ShowPoeLogDialogSync(curPath: string): string {
    //showOpenDialogSync was broken in electron
    const _poeLogPath = dialog.showOpenDialogSync(this._Window, {
      filters: [{ name: "poe log file", extensions: ["txt", "log"] }],
      title: "Please choose PathOfExile log file",
      properties: ["openFile", "showHiddenFiles"],
      defaultPath:
        "C:/Program Files (x86)/Grinding Gear Games/Path of Exile/logs/",
    });
    return _poeLogPath ? _poeLogPath[0] : curPath;
  }

  ShowPoeLogDialog(curPath: string): void {
    dialog
      .showOpenDialog({
        filters: [{ name: "poe log file", extensions: ["txt", "log"] }],
        title: "Please choose PathOfExile log file",
        properties: ["openFile", "showHiddenFiles"],
        defaultPath: curPath,
      })
      .then((result) => {
        if (result.canceled === false) {
          this.setPoeLogPath(result.filePaths[0]);
          this._Window.webContents.send("poeLogPath", result.filePaths[0]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
