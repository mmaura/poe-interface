import { app, Tray, shell, Menu, Notification, nativeImage, protocol, ipcMain } from "electron"

import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'
import PathOfExileLog from "poe-log-monitor"
import Store from "electron-store"
import path from "path"
import fs from "fs"

import { ConfigWindow } from "./main/ConfigWindow"
import { LevelingWindow } from "./main/LevelingWindow"

import { getAbsPackagedPath, getLocalCustomPath, MyLogger } from "./modules/functions"


let levelingGuideWindow: LevelingWindow
let configWindow: ConfigWindow

let AppTray: Tray
let PoeLog: PathOfExileLog

const AppStore = new Store()
const AppIcon = nativeImage.createFromPath(path.join(getAbsPackagedPath(), "AppIcon.png"))

protocol.registerSchemesAsPrivileged([
  { scheme: "userdata", privileges: { bypassCSP: true, standard: true, secure: true } },
])

app.whenReady().then(async () => {
  AppTray = new Tray(AppIcon)
  AppTray.setToolTip("POE Interface")
  AppTray.setContextMenu(TrayMenu)

  if (!app.isPackaged) {
    try {
      installExtension(REACT_DEVELOPER_TOOLS)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err))
    }
    catch (e) {
      MyLogger.log('info', 'Unable to load React chrome extension')
    }
  }

  protocol.registerFileProtocol("userdata", (request, callback) => {
    const url = request.url.slice(9)
    callback({ path: decodeURI(path.normalize(`${getLocalCustomPath()}/${url}`)) })
  })

  levelingGuideWindow = new LevelingWindow(AppStore, AppIcon)
  levelingGuideWindow.Init()

  configWindow = new ConfigWindow(AppStore, AppIcon)

  ipcMain.on("showConfigWindow", () => {
    configWindow.show()
  })

  AppStore.onDidChange("poe_log_path", newValue => {
    CreatePoeLog(newValue as string)
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

      levelingGuideWindow.setPoeLog(PoeLog)
      if (!levelingGuideWindow._Window.isVisible()) levelingGuideWindow.show()
    }
  }

  if (!fs.existsSync(configWindow.getPoeLogPath()))
    configWindow.show()
  else
    CreatePoeLog(configWindow.getPoeLogPath())


  function PoeLogParseComplete() {
    TrayMenu.getMenuItemById("levelingID").enabled = true
    TrayMenu.getMenuItemById("levelingID").toolTip = ""
    AppTray.setContextMenu(TrayMenu)

    new Notification({
      title: "poe-interface",
      body: "POE Log file loaded.",
      timeoutType: "default",
      urgency: "low",
      icon: AppIcon,
    }).show()
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
