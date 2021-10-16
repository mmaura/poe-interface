import {
  app,
  Tray,
  shell,
  Menu,
  BrowserWindow,
  MenuItem,
  Notification,
} from "electron";
import * as LevelingGuideWindow from "./LevelingWindow";
import { ConfigWindow } from "./ConfigWindow";

import PathOfExileLog from "poe-log-monitor";
import Store from "electron-store";

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

app.whenReady().then(() => {
  AppTray = new Tray("resources/images/ExaltedOrb.png");
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
  });

  configWindow = new ConfigWindow(AppStore);

  if (configWindow.getPoeLogPath() === "") {
    configWindow.show();
  } else {
    PoeLog = new PathOfExileLog({
      logfile: configWindow.getPoeLogPath(),
      interval: 500,
    });

    PoeLog.start();
    PoeLog.parseLog();
  }

  console.log("**** MAIN APP ****");
  console.log(configWindow.getPoeLogPath());

  PoeLog.on("parsingComplete", (data) => {
    TrayMenu.getMenuItemById("levelingID").enabled = true;
    TrayMenu.getMenuItemById("levelingID").toolTip = "";
    AppTray.setContextMenu(TrayMenu);

    new Notification({
      title: "poe-interface",
      body: "Fichier Log de Path Of Exile chargé.",
      timeoutType: "default",
      urgency: "low",
      icon: "resources/images/ExaltedOrb.png"

    }).show();
  });
  //const AppTray = AppTrayM.create(AppMainWindow);

  // pour servir les images pour le renderer
  // session.defaultSession.protocol.registerFileProtocol('static', (request, callback) => {
  //   const fileUrl = request.url.replace('static://', '');
  //   const filePath = path.join(app.getAppPath(), '.webpack/renderer', fileUrl);
  //   callback(filePath);
  // });
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}
app.on("before-quit", (e) => {
  configWindow.setCanClose(true);
  configWindow.close();
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
        levelingGuideWindow = LevelingGuideWindow.create(PoeLog);
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
