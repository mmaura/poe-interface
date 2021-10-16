import { BrowserWindow, dialog, ipcMain } from "electron";
import Store, { Schema } from "electron-store";
import fs from "fs";

declare const CONFIG_WINDOW_WEBPACK_ENTRY: string;
declare const CONFIG_WINDOW_PRELOAD_WEBPACK_ENTRY: never;

const schema = {
    poe_log_path: {
      type: "string",
      default:
        "C:/Program Files (x86)/Grinding Gear Games/Path of Exile/logs/Client.txt",
    },
  } as const;

const AppStore = new Store({schema: schema})

export class ConfigWindow{
    protected _poeLogPath : string
    protected window : BrowserWindow
    //_AppStore : Store
  
    // schema = {
    //     poe_log_path: {
    //       type: "string",
    //       default:
    //         "C:/Program Files (x86)/Grinding Gear Games/Path of Exile/logs/Client.txt",
    //     },
    //   } as const;

    constructor(){
        this.window = new BrowserWindow({
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
        })

        //AppStore = new Store({schema: schema});

        this._poeLogPath = AppStore.get("poe_log_path", "") as string
        this.window.loadURL(CONFIG_WINDOW_WEBPACK_ENTRY)
        this.window.webContents.openDevTools()
    }

    getConfigValue(configValue: string ) : unknown{
        return AppStore.get(configValue)
    }

    getConfigValueDefault(configValue: string, defaultValue : string ) : unknown{
        return AppStore.get(configValue, defaultValue)
    }

    getPoeLogPath() : string {
        if (fs.existsSync(this._poeLogPath )) {
            return this._poeLogPath 
        }
        return ""
    }

    show():void{
        this.window.show()
    }

    // getWindow():BrowserWindow{
    //     return this.window
    // }
}
