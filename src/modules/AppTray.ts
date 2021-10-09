import { Tray, BrowserWindow, Menu, shell, app } from "electron";

export function create( appMainWindow: BrowserWindow):Tray{

    const TrayMenu : Menu = Menu.buildFromTemplate([
      {
          label: 'MainWindow',
          click: () => {
            appMainWindow.show();
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
    
    const AppTray : Tray = new Tray('resources/images/ExaltedOrb.png');
    AppTray.setToolTip('POE Interface');
    AppTray.setContextMenu(TrayMenu)

    return AppTray
}