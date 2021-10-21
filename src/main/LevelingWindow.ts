import { BrowserWindow, ipcMain, NativeImage } from "electron";
import PathOfExileLog from "poe-log-monitor";

import { getCharacterClass } from "../renderers/modules/functions";

declare const LEVELING_WINDOW_WEBPACK_ENTRY: string;
declare const LEVELING_WINDOW_PRELOAD_WEBPACK_ENTRY: never;

export class LevelingWindow {
  protected _Window: BrowserWindow;

  private _CanClose = false;
  private _PoeLog: PathOfExileLog;
  private _LogLoaded: boolean;

  private _MyPlayer: IAppPlayer;
  private _MyConn: plm_conn;

  constructor(AppIcon: NativeImage) {
    this._MyPlayer = <IAppPlayer>{};
    this._MyConn = <plm_conn>{};

    this._Window = new BrowserWindow({
      width: 1080,
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
    });
    this._Window.setMenu(null);
    this._Window.loadURL(LEVELING_WINDOW_WEBPACK_ENTRY);
    this._Window.webContents.openDevTools();

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
    // ipcMain.handle("levelingWindow", (event, arg) => {
    //   let response = {};

    //   if (arg === "getInitData") {
    //     response = {
    //       MyPlayer: this._MyPlayer,
    //       MyConn: this._MyConn,
    //     } as IReactAppInit;
    //   }
    //   return response;
    // });
    ipcMain.handle("cloneGuide", (event, arg) => {
      console.log("clonage du guide demandé");
    });
  }

  /**********************************
   * POE LOG
   */
  setPoeLog(poeLog: PathOfExileLog): void {
    this._PoeLog = poeLog;
    this._LogLoaded = false;

    /**********************************
     * Poe Log Events
     */
    this._PoeLog.on("parsingComplete", () => {
      console.log("parsing complete");

      this._LogLoaded = true;

      this._Window.webContents.send("player", this._MyPlayer);
      this._Window.webContents.send("conn", this._MyConn);
      this._Window.webContents.send("playerArea", this._MyPlayer);
    });

    this._PoeLog.on("login", (data) => {
      this._MyConn = data;
      if (this._LogLoaded === true)
        this._Window.webContents.send("conn", this._MyConn);
    });

    this._PoeLog.on("level", (data) => {
      this._MyPlayer.name = data.name;
      this._MyPlayer.characterClass = getCharacterClass(data.characterClass);
      this._MyPlayer.characterAscendancy = data.characterClass;
      this._MyPlayer.level = data.level;

      if (this._LogLoaded === true) {
        this._Window.webContents.send("player", this._MyPlayer);
      }
    });

    this._PoeLog.on("area", (area) => {
      if (area.type === "area") {
        this._MyPlayer.currentZoneName = area.name;
        this._MyPlayer.currentZoneAct = area.info[0].act;

        if (this._LogLoaded === true)
          this._Window.webContents.send("playerArea", this._MyPlayer);
      }
    });
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
}
