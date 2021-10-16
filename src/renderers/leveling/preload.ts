import { ipcRenderer, contextBridge, shell } from "electron";

contextBridge.exposeInMainWorld("myAPI", {
  hello: () => {
    ipcRenderer.send("hello", "toto");
  },
  getInitData: async () => {
    const all = await ipcRenderer.invoke("levelingWindow", "getInitData");
    return all;
  },
  send: (channel: any, data: any) => {
    ipcRenderer.invoke(channel, data).catch((e) => console.log(e));
  },
  receive: (channel: any, func: any) => {
    ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
  },
  openExternal: (url: string) => {
    shell.openExternal(url);
  },
});
