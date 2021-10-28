import { app, Tray, shell, Menu, Notification, nativeImage, session } from "electron"

import PathOfExileLog from "poe-log-monitor"
import Store from "electron-store"
import path from "path"
import os from "os"

import { ConfigWindow } from "./main/ConfigWindow"
import { LevelingWindow } from "./main/LevelingWindow"

import { getAssetPath } from "./modules/functions"

const reactDevToolsPath = path.join(
  os.homedir(),
  ".config/google-chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.20.1_0"
)

let levelingGuideWindow: LevelingWindow
let configWindow: ConfigWindow

let AppTray: Tray
let PoeLog: PathOfExileLog

const schema = {
  poe_log_path: {
    type: "string",
  },
} as const

const AppStore = new Store({ schema: schema })

const AssetPath = getAssetPath()
const AppIcon = nativeImage.createFromPath(`${AssetPath}/AppIcon.png`)
// console.log("AssetPath : \t %s", AssetPath)
// console.log("icon: \t\t %s", `${AssetPath}/AppIcon.png`)
// console.log("__dirname: \t%s", __dirname)

app.whenReady().then(async () => {
  session.defaultSession.loadExtension(reactDevToolsPath)

  console.log("AppPackaged: %o ", app.isPackaged)

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
  AppTray = new Tray(AppIcon)

  AppTray.setToolTip("POE Interface")
  AppTray.setContextMenu(TrayMenu)

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

      levelingGuideWindow.setPoeLog(PoeLog)

      PoeLog.start()
      PoeLog.parseLog()
      PoeLog.on("parsingComplete", PoeLogParseComplete)
    }
  }

  configWindow = new ConfigWindow(AppStore, AppIcon)
  levelingGuideWindow = new LevelingWindow(AppIcon, LevelingWindowMenu)

  if (configWindow.getPoeLogPath() === null) {
    configWindow.show()
  } else {
    CreatePoeLog(configWindow.getPoeLogPath())
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

const LevelingWindowMenu: Menu = Menu.buildFromTemplate([
  {
    label: "links",
    submenu: [
      {
        label: "Site PathOfExile",
        click: () => {
          shell.openExternal("https://www.pathofexile.com/")
        },
      },
      {
        label: "Site POE Wiki",
        click: () => {
          shell.openExternal("https://www.poewiki.net/")
        },
      },
      {
        label: "Site PathOfExile Trade",
        click: () => {
          shell.openExternal("https://www.pathofexile.com/")
        },
      },
      {
        label: "Site PathOfExile Trade",
        click: () => {
          shell.openExternal("https://www.pathofexile.com/trade/")
        },
      },
      {
        label: "Site Poe Trade",
        click: () => {
          shell.openExternal("https://poe.trade/")
        },
      },
      {
        type: "separator",
      },
      {
        label: "Site du Template",
        id: "templateUrl",
        enabled: false,
      },
    ],
  },
  {
    label: "helpers",
    submenu: [
      {
        label: "Wraeclast",
        click: () => {
          shell.openExternal("https://wraeclast.com/")
        },
      },
      {
        label: "PoeDb",
        click: () => {
          shell.openExternal("https://poedb.tw/")
        },
      },
      {
        type: "separator",
      },
      {
        label: "Ultimatum",
        click: () => {
          levelingGuideWindow.OpenLocalHelperFile("ultimatum")
        },
      },
      {
        label: "Heist",
        click: () => {
          levelingGuideWindow.OpenLocalHelperFile("heist")
        },
      },
      {
        label: "Delve",
        click: () => {
          levelingGuideWindow.OpenLocalHelperFile("delve")
        },
      },
      {
        label: "Vendor Recipes",
        click: () => {
          levelingGuideWindow.OpenLocalHelperFile("vendorRecipes")
        },
      },
    ],
  },

  {
    label: "Fichier",
    submenu: [
      {
        label: "Recharger tous les fichiers (conf/guides)",
        click: () => {
          levelingGuideWindow.ReloadAll()
        },
      },
      {
        label: "Configuration",
        click: () => {
          configWindow.show()
        },
      },
      {
        label: "Fermer",
        click: () => {
          levelingGuideWindow.hide()
        },
      },
      {
        label: "Quitter",
        click: () => {
          app.quit()
        },
      },
    ],
  },
])
