import { app, BrowserWindow, ipcMain, NativeImage } from "electron";
import PathOfExileLog from "poe-log-monitor";

import { getCharacterClass } from "../renderers/modules/functions";

declare const LEVELING_WINDOW_WEBPACK_ENTRY: string;
declare const LEVELING_WINDOW_PRELOAD_WEBPACK_ENTRY: never;

export function create(
  poeLog: PathOfExileLog,
  AppIcon: NativeImage
): BrowserWindow {

  let _CanClose = false
  
  console.log("create leveling windows");

  getCharacterClass;
  let LogLoaded = false;
  let MyConn = <plm_conn>{ latency: "na", server: "non connecté" };

  const MyPlayer = <IAppPlayer>{
    name: "",
    level: 0,
    characterClass: "",
    characterAscendancy: "",
    currentZoneName: "",
    currentZoneAct: 1,
  };

  let LevelingGuideWindow = new BrowserWindow({
    width: 1080,
    height: 1200,
    icon: AppIcon,
    title: "POE Interface",
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      //worldSafeExecuteJavaScript: true,
      preload: LEVELING_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  LevelingGuideWindow.setMenu(null);
  LevelingGuideWindow.loadURL(LEVELING_WINDOW_WEBPACK_ENTRY);
  LevelingGuideWindow.webContents.openDevTools();

  /**********************************
   * IPC
   */
  ipcMain.handle("levelingWindow", (event, arg) => {
    let response: any = { status: "bad request" };

    if (arg === "getInitData") {
      response = {
        MyPlayer: MyPlayer,
        MyConn: MyConn,
        // InitialData: InitialData,
        // DefaultGuide: DefaultGuide,
      } as IReactAppInit;
    }
    return response;
  });

  LevelingGuideWindow.on("closed", () => {
    LevelingGuideWindow = null;
    app.quit();
  });

  /**********************************
   * Poe Log Events
   */
  poeLog.on("parsingComplete", (data) => {
    LogLoaded = true;
    LevelingGuideWindow.webContents.send("player", MyPlayer);
    LevelingGuideWindow.webContents.send("conn", MyConn);
    LevelingGuideWindow.webContents.send("playerArea", MyPlayer);
  });

  poeLog.on("login", (data) => {
    MyConn = data;
    if (LogLoaded === true)
      LevelingGuideWindow.webContents.send("conn", MyConn);
  });

  poeLog.on("level", (data) => {
    MyPlayer.name = data.name;
    MyPlayer.characterClass = getCharacterClass(data.characterClass);
    MyPlayer.characterAscendancy = data.characterClass;
    MyPlayer.level = data.level;

    console.log(MyPlayer)

    if (LogLoaded === true)
      LevelingGuideWindow.webContents.send("player", MyPlayer);
  });

  poeLog.on("area", (area) => {
    if (area.type === "area") {
      MyPlayer.currentZoneName = area.name;
      MyPlayer.currentZoneAct = area.info[0].act;

      if (LogLoaded === true)
        LevelingGuideWindow.webContents.send("playerArea", MyPlayer);
    }
  });

  function setCanClose(state: boolean): void {
    _CanClose = state;
  }
  return LevelingGuideWindow;
}
