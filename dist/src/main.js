"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var electron_1 = require("electron");
var LevelingGuideWindow = __importStar(require("./modules/LevelingGuideWindow"));
var ConfigWindow_1 = require("./ConfigWindow");
var poe_log_monitor_1 = __importDefault(require("poe-log-monitor"));
var levelingGuideWindow;
var configWindow;
var AppTray;
var PoeLog;
electron_1.app.whenReady().then(function () {
    AppTray = new electron_1.Tray("resources/images/ExaltedOrb.png");
    AppTray.setToolTip("POE Interface");
    AppTray.setContextMenu(TrayMenu);
    configWindow = new ConfigWindow_1.ConfigWindow();
    if (configWindow.getPoeLogPath() === "")
        configWindow.show();
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
    console.log("**** MAIN APP ****");
    console.log(configWindow.getPoeLogPath());
    PoeLog = new poe_log_monitor_1["default"]({
        logfile: configWindow.getPoeLogPath(),
        interval: 500
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
    electron_1.app.quit();
}
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
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
var TrayMenu = electron_1.Menu.buildFromTemplate([
    {
        label: "Configuration",
        click: function () {
            configWindow.show();
        }
    },
    {
        label: "Leveling",
        click: function () {
            if (levelingGuideWindow === undefined)
                levelingGuideWindow = LevelingGuideWindow.create(PoeLog);
            else
                levelingGuideWindow.show();
        }
    },
    {
        label: "site PathOfExile",
        click: function () {
            electron_1.shell.openExternal("https://www.pathofexile.com/");
        }
    },
    {
        label: "-",
        type: "separator"
    },
    {
        label: "Quitter",
        click: function () {
            electron_1.app.quit();
        }
    },
]);
//# sourceMappingURL=main.js.map