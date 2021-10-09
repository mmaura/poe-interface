import {app, dialog, ipcMain, session } from 'electron'
import fs from 'fs'
import path from 'path'
import Store from 'electron-store'
import PathOfExileLog from 'poe-log-monitor'
import * as AppMainWindowM from './modules/MainWindow'
import * as AppTrayM from './modules/AppTray'
import { getAreaList } from './modules/Data'
import InitData from '../resources/data/data.json'


const schema = {
	poe_log_path: {
		type: 'string',
		default: 'C:/Program Files (x86)/Grinding Gear Games/Path of Exile/logs/Client.txt',
	},
} as const;

const AppStore  = new Store({ schema });

app.whenReady().then(() => {
  let POE_AREA = <plm_area> { name: "na", type: "area", info: "non chargée"};
  let POE_CONN = <plm_conn> { latency: "na", server: "non connecté"};
  const POE_PLAYER = <player> { name: "na", level: -1, characterClass: "na", currentZoneName: "Your nightmare lies ahead.", currentZoneAct: 1};

  // pour servir les images pour le renderer
  // session.defaultSession.protocol.registerFileProtocol('static', (request, callback) => {
  //   const fileUrl = request.url.replace('static://', '');
  //   const filePath = path.join(app.getAppPath(), '.webpack/renderer', fileUrl);
  //   callback(filePath);
  // });

  console.log('We are ready to go !');

  ipcMain.handle('app', (event, arg) => {
    //console.log('player : ' + arg)
    let response : any = { status: 'bad request' };
    
    if (arg === 'getInitData') {
      response = {POE_AREA, POE_PLAYER, POE_CONN, InitData};
      //console.log(POE_PLAYER)
    }
      return response
  })

  
  // ipcMain.on('player', (event, arg)=> {
  //   console.log('player : ' + arg)
  //   let response : any = { status: 'bad request' };
  //   if (arg === 'get') {
  //     response = { status: 'Ok', player: player}
  //   }
  //   console.log('response: ')
  //   console.log (response)
  //   event.reply('player', response)
  // })

  //Poe Log File
  let poe_log_path = AppStore.get('poe_log_path', '') as string
  console.log(poe_log_path)
  if (!fs.existsSync(poe_log_path)){
    dialog.showOpenDialog({ 
      filters: [    { name: 'poe log file', extensions: ['txt', 'log'] },],
      title: 'Please choose PathOfExile log file', 
      properties: ['openFile', 'showHiddenFiles'], 
      defaultPath: '/mnt/games/SteamLibrary/steamapps/common/Path of Exile/logs/'}).then(result => {
        // console.log(result.canceled)
        // console.log(result.filePaths)
        if (result.canceled == false) { 
          poe_log_path = result.filePaths[0]
          AppStore.set('poe_log_path', poe_log_path)
        }
      }).catch(err => {
        console.log(err)
      })
  }

  const poeLog : PathOfExileLog = new PathOfExileLog({ logfile: poe_log_path, interval: 500});

  poeLog.on('login', (data) => {
    POE_CONN = data
    //console.log("Logged in. Gateway: " + data.server + ", Latency: " + data.latency);

    AppMainWindow.webContents.send('conn', POE_CONN)
  });

  poeLog.on('level', (data) => {
    POE_PLAYER.name = data.name
    POE_PLAYER.characterClass = data.characterClass
    POE_PLAYER.level = data.level

    AppMainWindow.webContents.send('player', POE_PLAYER)
  });

  poeLog.on('area', (area) => {
    if (area.type === 'area'){
      POE_PLAYER.currentZoneName = area.name
      POE_PLAYER.currentZoneAct = area.info.act
      POE_AREA = area
    }

    AppMainWindow.webContents.send('player', POE_PLAYER)
    AppMainWindow.webContents.send('curArea', POE_AREA)
  })

  const AppMainWindow = AppMainWindowM.create();

  // setInterval(()=>{
  //   AppMainWindow.webContents.send('player', POE_PLAYER)
  // }, 1000);

  // AppMainWindow.on('ready-to-show', () => {
  //   console.log("ready to show")
  //   const AppTray = AppTrayM.create(AppMainWindow)
  // })

  // poeLog.start()
  // poeLog.parseLog()

  const AppTray = AppTrayM.create(AppMainWindow)


  // console.log("*******************")
  // console.log(getAreaList())
})


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