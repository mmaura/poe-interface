import { BrowserWindow, ipcMain } from "electron";
import PathOfExileLog from "poe-log-monitor";

import { getCharacterClass } from "../modules/utils";

import InitialAct from "../../resources/data/acts.json";
import InitialClasses from "../../resources/data/classes.json";
import DefaultGuide from "../../resources/data/guide.json";
import InitialGems from "../../resources/data/gems.json";

declare const LEVELING_WINDOW_WEBPACK_ENTRY: string;
declare const LEVELING_WINDOW_PRELOAD_WEBPACK_ENTRY: never;

export function create(poeLog: PathOfExileLog): BrowserWindow {
  const InitialData = {
    acts: InitialAct,
    classes: InitialClasses,
    gems: InitialGems,
  } as IInitialData;

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

  const LevelingGuideWindow = new BrowserWindow({
    width: 1080,
    height: 1200,
    icon: "resources/images/ExaltedOrb.png",
    title: "POE Interface",
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      //worldSafeExecuteJavaScript: true,
      preload: LEVELING_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  LevelingGuideWindow.loadURL(LEVELING_WINDOW_WEBPACK_ENTRY);
  LevelingGuideWindow.webContents.openDevTools();

  ipcMain.handle("levelingWindow", (event, arg) => {
    let response: any = { status: "bad request" };

    if (arg === "getInitData") {
      response = {
        MyPlayer: MyPlayer,
        MyConn: MyConn,
        InitialData: InitialData,
        DefaultGuide: DefaultGuide,
      } as IReactAppInit;
    }
    return response;
  });

  poeLog.on("parsingComplete", (data) => {
    LogLoaded = true;
  });

  poeLog.on("login", (data) => {
    MyConn = data;
    if (LogLoaded === true)
      LevelingGuideWindow.webContents.send("conn", MyConn);
  });

  poeLog.on("level", (data) => {
    MyPlayer.name = data.name;
    MyPlayer.characterClass = getCharacterClass(
      InitialData.classes,
      data.characterClass
    );
    MyPlayer.characterAscendancy = data.characterClass;
    MyPlayer.level = data.level;

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

  return LevelingGuideWindow;
}
