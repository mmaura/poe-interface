import { ipcRenderer, contextBridge, shell, dialog } from "electron";

contextBridge.exposeInMainWorld("configAPI", {
  send: (channel: any, data: any) => {
    ipcRenderer.invoke(channel, data).catch((e) => console.log(e));
  },
  sendSync: async (channel: any, data: any) => {
    const all = ipcRenderer.invoke(channel, data).catch((e) => {
      console.log(e);
    });
    return all;
  },
  receive: (channel: any, func: any) => {
    ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
  },
  openExternal: (url: string) => {
    shell.openExternal(url);
  },
});
