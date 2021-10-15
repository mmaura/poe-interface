import { app, Tray, shell, Menu, BrowserWindow } from "electron";
import * as LevelingGuideWindow from './modules/LevelingGuideWindow'
//import * as AppTrayM from "./modules/AppTray";

let levelingGuideWindow : BrowserWindow
let AppTray : Tray

app.whenReady().then(() => {
 
  AppTray = new Tray('resources/images/ExaltedOrb.png');
  AppTray.setToolTip('POE Interface');
  AppTray.setContextMenu(TrayMenu)

  levelingGuideWindow = LevelingGuideWindow.create();
  //const AppTray = AppTrayM.create(AppMainWindow);



  // pour servir les images pour le renderer
  // session.defaultSession.protocol.registerFileProtocol('static', (request, callback) => {
  //   const fileUrl = request.url.replace('static://', '');
  //   const filePath = path.join(app.getAppPath(), '.webpack/renderer', fileUrl);
  //   callback(filePath);
  // });


});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
   app.quit();
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
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
const TrayMenu : Menu = Menu.buildFromTemplate([
  {
      label: 'MainWindow',
      click: () => {
        levelingGuideWindow.show();
      }

  },
  {
      label: 'site PathOfExile',
      click: () => {
          shell.openExternal('https://www.pathofexile.com/');
      }
  },
  {
      label: '-',
      type: 'separator'
  },
  {
      label: 'Quitter',
      click: () => {
          app.quit();
      }
  }
]);
