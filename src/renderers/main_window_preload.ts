import { ipcRenderer, contextBridge } from "electron";

console.log("***** main_window_preload.ts")


contextBridge.exposeInMainWorld(
    'myAPI',
    {
        hello: () => {ipcRenderer.send('hello', "toto")},
        // player_get: () => {
        //     ipcRenderer.send('player', 'get')
        // }
        player_get: async () => {  
            const player = await ipcRenderer.invoke('player', 'get')
            console.log('player_get')
            console.log(player)
            return player
        }
    }
)

// ipcRenderer.on('player', (event, arg) => {
//     player = arg.player
//     console.log(player) // prints "pong"
// })