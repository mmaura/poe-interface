import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld(
    'myAPI',
    {
        hello: () => {ipcRenderer.send('hello', "toto")},
        player_get: () => {
            ipcRenderer.sendSync('player', 'get')
        }
    }
)
