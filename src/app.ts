import { app, Tray, shell, Menu, Notification, nativeImage, session, protocol } from "electron"

import PathOfExileLog from "poe-log-monitor"
import Store from "electron-store"
import path from "path"
import os from "os"
import fs from "fs"

import { ConfigWindow } from "./main/ConfigWindow"
import { LevelingWindow } from "./main/LevelingWindow"

import { getAssetPath, getLocalCustomPath, MyLogger } from "./modules/functions"

const reactDevToolsPath = path.join(
  os.homedir(),
  ".config/google-chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.20.1_0"
)

let levelingGuideWindow: LevelingWindow
let configWindow: ConfigWindow

let AppTray: Tray
let PoeLog: PathOfExileLog

const AppStore = new Store()
const AppIcon = nativeImage.createFromPath(path.join(getAssetPath(), "AppIcon.png"))

protocol.registerSchemesAsPrivileged([
  { scheme: "userdata", privileges: { bypassCSP: true, standard: true, secure: true } },
])

app.whenReady().then(async () => {
  if (!app.isPackaged) {
    try {
      session.defaultSession.loadExtension(reactDevToolsPath)
    }
    catch(e){
      MyLogger.log('info', 'Unable to load React chrome extension')
    }
  }

  protocol.registerFileProtocol("userdata", (request, callback) => {
    const url = request.url.substr(9)
    console.log(decodeURI(path.normalize(`${getLocalCustomPath()}/${url}`)))
    callback({ path: decodeURI(path.normalize(`${getLocalCustomPath()}/${url}`)) })
  })

  AppTray = new Tray(AppIcon)
  AppTray.setToolTip("POE Interface")
  AppTray.setContextMenu(TrayMenu)

  AppStore.onDidChange("poe_log_path", newValue => {
    CreatePoeLog(newValue as string)
    if (!levelingGuideWindow) levelingGuideWindow = new LevelingWindow(AppStore, AppIcon)
    levelingGuideWindow.setPoeLog(PoeLog)
    levelingGuideWindow.show()
  })

  function CreatePoeLog(logPath: string) {
    PoeLog = null

    if (logPath) {
      PoeLog = new PathOfExileLog({
        logfile: logPath,
        interval: 500,
      })

      PoeLog.start()
      PoeLog.parseLog()
      PoeLog.on("parsingComplete", PoeLogParseComplete)
    }
  }

  configWindow = new ConfigWindow(AppStore, AppIcon)

  if (!fs.existsSync(configWindow.getPoeLogPath())) {
    configWindow.show()
  } else {
    CreatePoeLog(configWindow.getPoeLogPath())
    levelingGuideWindow = new LevelingWindow(AppStore, AppIcon)
    levelingGuideWindow.setPoeLog(PoeLog)
    levelingGuideWindow.show()
  }

  function PoeLogParseComplete() {
    TrayMenu.getMenuItemById("levelingID").enabled = true
    TrayMenu.getMenuItemById("levelingID").toolTip = ""
    AppTray.setContextMenu(TrayMenu)

    new Notification({
      title: "poe-interface",
      body: "Fichier Log de Path Of Exile chargé.",
      timeoutType: "default",
      urgency: "low",
      icon: AppIcon,
    }).show()

    if (!levelingGuideWindow) levelingGuideWindow = new LevelingWindow(AppStore, AppIcon)
    levelingGuideWindow.show()
  }
})

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit()
}

app.on("before-quit", () => {
  if (configWindow) {
    configWindow.setCanClose(true)
    configWindow.close()
  }
  if (levelingGuideWindow) {
    levelingGuideWindow.setCanClose(true)
    levelingGuideWindow.close()
  }
})

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
      configWindow.show()
    },
  },
  {
    id: "levelingID",
    label: "Leveling",
    click: () => {
      levelingGuideWindow.show()
    },
    // enabled: false,
    toolTip: "Configure Client.txt via Configuration first.",
  },
  {
    type: "separator",
  },
  {
    label: "site poe-interface",
    click: () => {
      shell.openExternal("https://github.com/mmaura/poe-interface")
    },
  },
  {
    type: "separator",
  },
  {
    label: "Quitter",
    click: () => {
      app.quit()
    },
  },
])
