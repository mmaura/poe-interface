import {
  app,
  Tray,
  shell,
  Menu,
  BrowserWindow,
  Notification,
  nativeImage,
  session,
} from "electron";

import PathOfExileLog from "poe-log-monitor";
import Store from "electron-store";
import path from "path"
import * as LevelingGuideWindow from "./main/LevelingWindow";
import { ConfigWindow } from "./main/ConfigWindow";

import { getAssetPath } from "./modules/utils";

let levelingGuideWindow: BrowserWindow;
let configWindow: ConfigWindow;

let AppTray: Tray;
let PoeLog: PathOfExileLog;

const schema = {
  poe_log_path: {
    type: "string",
    default:
      "C:/Program Files (x86)/Grinding Gear Games/Path of Exile/logs/Client.txt",
  },
} as const;

const AppStore = new Store({ schema: schema });

const AssetPath = getAssetPath()
const AppIcon = nativeImage.createFromPath(`${AssetPath}/AppIcon.png`);
console.log("AssetPath : \t %s", AssetPath);
console.log("icon: \t\t %s", `${AssetPath}/AppIcon.png`)
console.log("__dirname: \t%s" ,__dirname);

app.whenReady().then(() => {
  //console.log(AssetPath);
  //console.log(__dirname);
  
  //const  _AppIcon_ = `${AssetPath}/AppIcon.png`;
  
  //const AppIcon = nativeImage.createFromPath("./resources/images/ExaltedOrb.png")
  //console.log(_AppIcon_);
  
  // // pour servir les images pour le renderer
  // session.defaultSession.protocol.registerFileProtocol(
  //   "static",
  //   (request, callback) => {
  //     const fileUrl = request.url.replace("static://", "");
  //     const filePath = path.join(
  //       app.getAppPath(),
  //       ".webpack/renderer/assets",
  //       fileUrl
  //     );
  //     console.log(filePath)
  //     callback(filePath);
  //   }
  // );

  AppTray = new Tray(AppIcon);

  AppTray.setToolTip("POE Interface");
  AppTray.setContextMenu(TrayMenu);

  AppStore.onDidChange("poe_log_path", (newValue, oldValue) => {
    PoeLog = null;

    PoeLog = new PathOfExileLog({
      logfile: newValue,
      interval: 500,
    });

    PoeLog.start();
    PoeLog.parseLog();
    PoeLog.on("parsingComplete", PoeLogParseComplete);
  });

  configWindow = new ConfigWindow(AppStore, AppIcon);

  if (configWindow.getPoeLogPath() === "") {
    configWindow.show();
  } else {
    PoeLog = new PathOfExileLog({
      logfile: configWindow.getPoeLogPath(),
      interval: 500,
    });

    PoeLog.start();
    PoeLog.parseLog();
    PoeLog.on("parsingComplete", PoeLogParseComplete);
    levelingGuideWindow = LevelingGuideWindow.create(PoeLog, AppIcon);
    levelingGuideWindow.show();
  }

  console.log("**** MAIN APP ****");
  console.log(configWindow.getPoeLogPath());

  function PoeLogParseComplete() {
    TrayMenu.getMenuItemById("levelingID").enabled = true;
    TrayMenu.getMenuItemById("levelingID").toolTip = "";
    AppTray.setContextMenu(TrayMenu);

    new Notification({
      title: "poe-interface",
      body: "Fichier Log de Path Of Exile chargé.",
      timeoutType: "default",
      urgency: "low",
      icon: AppIcon,
    }).show();
  }
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

app.on("before-quit", (e) => {
  if (configWindow) {
    configWindow.setCanClose(true);
    configWindow.close();
  }
  //levelingGuideWindow.setClose(true)
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") {
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
const TrayMenu: Menu = Menu.buildFromTemplate([
  {
    label: "Configuration",
    click: () => {
      configWindow.show();
    },
  },
  {
    id: "levelingID",
    label: "Leveling",
    click: () => {
      if (levelingGuideWindow) levelingGuideWindow.show();
      else {
        levelingGuideWindow = LevelingGuideWindow.create(PoeLog, AppIcon);
        levelingGuideWindow.show();
      }
    },
    enabled: false,
    toolTip: "Configure Client.txt via Configuration first.",
  },
  {
    type: "separator",
  },
  {
    label: "site PathOfExile",
    click: () => {
      shell.openExternal("https://www.pathofexile.com/");
    },
  },
  {
    type: "separator",
  },
  {
    label: "Quitter",
    click: () => {
      app.quit();
    },
  },
]);
