import { ipcRenderer, contextBridge } from "electron"

contextBridge.exposeInMainWorld(
    'myAPI',
    {
        hello: () => {ipcRenderer.send('hello', "toto")},
        getData: async () => {  
            const all = await ipcRenderer.invoke('app', 'getData')
            console.log('getData')
            console.log(all)
            return all
        },
        send: (channel: any, data: any) => {
            ipcRenderer.invoke(channel, data).catch(e => console.log(e))
        },
        receive: (channel:any, func:any) => {
            ipcRenderer.on(channel, (event, ...args) => func(event, ...args))
        }
    }
);