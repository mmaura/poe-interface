import { ipcRenderer, contextBridge, shell } from "electron";

contextBridge.exposeInMainWorld("levelingAPI", {
  // getInitData: async () => {
  //   const all = await ipcRenderer.invoke("levelingWindow", "getInitData");
  //   return all;
  // },
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
  openWiki: (page: string) => {
    shell.openExternal("https://www.poewiki.net/wiki/" + page);
  },
});
