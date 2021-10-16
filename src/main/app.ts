import { app, Tray, shell, Menu, BrowserWindow } from "electron";
import * as LevelingGuideWindow from "./LevelingWindow";
import { ConfigWindow } from "./ConfigWindow";

import PathOfExileLog from "poe-log-monitor";

let levelingGuideWindow: BrowserWindow;
let configWindow: ConfigWindow;

let AppTray: Tray;
let PoeLog: PathOfExileLog;

app.whenReady().then(() => {
  AppTray = new Tray("resources/images/ExaltedOrb.png");
  AppTray.setToolTip("POE Interface");
  AppTray.setContextMenu(TrayMenu);

  configWindow = new ConfigWindow();

  if (configWindow.getPoeLogPath() === "") configWindow.show();

  //   // let poe_log_path = AppStore.get("poe_log_path", "") as string;
  // //let poe_log_path = configWindow.getAppStore().get("poe_log_path", "") as string
  // console.log(poe_log_path);
  // if (!fs.existsSync(poe_log_path)) {
  //   dialog
  //     .showOpenDialog({
  //       filters: [{ name: "poe log file", extensions: ["txt", "log"] }],
  //       title: "Please choose PathOfExile log file",
  //       properties: ["openFile", "showHiddenFiles"],
  //       defaultPath:
  //         "C:/Program Files (x86)/Grinding Gear Games/Path of Exile/logs/",
  //     })
  //     .then((result) => {
  //       // console.log(result.canceled)
  //       // console.log(result.filePaths)
  //       if (result.canceled === false) {
  //         poe_log_path = result.filePaths[0];
  //         AppStore.set("poe_log_path", poe_log_path);
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // }

  console.log("**** MAIN APP ****")
  console.log(configWindow.getPoeLogPath())

  PoeLog = new PathOfExileLog({
    logfile: configWindow.getPoeLogPath(),
    interval: 500,
  });

  levelingGuideWindow = LevelingGuideWindow.create(PoeLog);

  PoeLog.start();
  PoeLog.parseLog();


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

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

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
    label: "Leveling",
    click: () => {
      if (levelingGuideWindow === undefined)
        levelingGuideWindow = LevelingGuideWindow.create(PoeLog);
      else levelingGuideWindow.show();
    },
  },
  {
    label: "site PathOfExile",
    click: () => {
      shell.openExternal("https://www.pathofexile.com/");
    },
  },
  {
    label: "-",
    type: "separator",
  },
  {
    label: "Quitter",
    click: () => {
      app.quit();
    },
  },
]);
