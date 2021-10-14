import { app, dialog, ipcMain, session } from "electron";
import fs from "fs";
//import path from 'path'
import Store from "electron-store";
import PathOfExileLog from "poe-log-monitor";
import * as AppMainWindowM from "./modules/MainWindow";
import * as AppTrayM from "./modules/AppTray";
//import { getAreaList } from './modules/Data'
import DefaultZonesData from "../resources/data/data.json";
import DefaultGearsData from "../resources/data/gears.json";
import DefaultGemsData from "../resources/data/gems.json";
import DefaultClassData from "../resources/data/class.json"
import { getCharacterClass } from "./modules/utils";

const schema = {
  poe_log_path: {
    type: "string",
    default:
      "C:/Program Files (x86)/Grinding Gear Games/Path of Exile/logs/Client.txt",
  },
} as const;

const AppStore = new Store({ schema });

app.whenReady().then(() => {
  let LogLoaded = false;

  const AppMainWindow = AppMainWindowM.create();

  //let PoeArea = <plm_area>{ name: "na", type: "area", info: "non chargée" };
  let MyConn = <plm_conn>{ latency: "na", server: "non connecté" };
  const MyPlayer = <IAppPlayer>{
    name: "na",
    level: -1,
    characterClass: "na",
    characterAscendancy: "na",
    currentZoneName: "Your nightmare lies ahead.",
    currentZoneAct: 1,
  };

  // pour servir les images pour le renderer
  // session.defaultSession.protocol.registerFileProtocol('static', (request, callback) => {
  //   const fileUrl = request.url.replace('static://', '');
  //   const filePath = path.join(app.getAppPath(), '.webpack/renderer', fileUrl);
  //   callback(filePath);
  // });

  ipcMain.handle("app", (event, arg) => {
    //console.log('player : ' + arg)
    let response: any = { status: "bad request" };

    if (arg === "getInitData") {
      response = {
        MyPlayer: MyPlayer,
        MyConn: MyConn,
        DefaultZonesData: DefaultZonesData,
        DefaultGearsData: DefaultGearsData,
        DefaultGemsData: DefaultGemsData,
      };
      //console.log(POE_PLAYER)
    }
    return response;
  });

  //Poe Log File
  let poe_log_path = AppStore.get("poe_log_path", "") as string;
  console.log(poe_log_path);
  if (!fs.existsSync(poe_log_path)) {
    dialog
      .showOpenDialog({
        filters: [{ name: "poe log file", extensions: ["txt", "log"] }],
        title: "Please choose PathOfExile log file",
        properties: ["openFile", "showHiddenFiles"],
        defaultPath:
          "C:/Program Files (x86)/Grinding Gear Games/Path of Exile/logs/",
      })
      .then((result) => {
        // console.log(result.canceled)
        // console.log(result.filePaths)
        if (result.canceled === false) {
          poe_log_path = result.filePaths[0];
          AppStore.set("poe_log_path", poe_log_path);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  console.log("eeeee")

  const poeLog: PathOfExileLog = new PathOfExileLog({
    logfile: poe_log_path,
    interval: 500,
  });
  poeLog.start();
  poeLog.parseLog();

  poeLog.on("parsingComplete", (data) => {
    LogLoaded = true;
  });

  poeLog.on("login", (data) => {
    MyConn = data;
    //console.log("Logged in. Gateway: " + data.server + ", Latency: " + data.latency);

    if (LogLoaded === true) AppMainWindow.webContents.send("conn", MyConn);
  });

  poeLog.on("level", (data) => {
    MyPlayer.name = data.name;
    MyPlayer.characterClass = getCharacterClass(DefaultClassData, data.characterClass)
    MyPlayer.characterAscendancy = data.characterClass;
    MyPlayer.level = data.level;

    if (LogLoaded === true) AppMainWindow.webContents.send("player", MyPlayer);
  });

  poeLog.on("area", (area) => {
    if (area.type === "area") {
      console.log("plm onarea");
      console.log(area);

      MyPlayer.currentZoneName = area.name;
      MyPlayer.currentZoneAct = area.info[0].act;

      if (LogLoaded === true)
        AppMainWindow.webContents.send("playerArea", MyPlayer);
    }
  });

  //const AppMainWindow = AppMainWindowM.create();
  const AppTray = AppTrayM.create(AppMainWindow);

  // console.log("*******************")
  // console.log(getAreaList())
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
//    app.quit();
// }

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// app.on('activate', () => {
//   // On OS X it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow();
//   }
// });

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
