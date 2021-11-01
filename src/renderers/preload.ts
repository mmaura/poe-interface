import { ipcRenderer, contextBridge, shell } from "electron"

contextBridge.exposeInMainWorld("poe_interfaceAPI", {
  // getInitData: async () => {
  //   const all = await ipcRenderer.invoke("levelingWindow", "getInitData");
  //   return all;
  // },
  cleanup: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  },
  send: async (channel: string, ...args: any[]) => {
    return ipcRenderer
      .invoke(channel, ...args)
      .catch((e) => console.log(e))
      .then((e) => console.log("ipcRender send : %s %o \nreturn: %o ", channel, args, e))
  },
  sendSync: async (channel: string, ...args: any[]) => {
    return await ipcRenderer
      .invoke(channel, ...args)
      .catch((e) => console.log(e))
      .then((e) => {
        console.log("ipcRender sendSync : %s %o \nreturn: %o ", channel, args, e)
        return e as any
      })
  },
  receive: async (channel: string, func: any) => {
    ipcRenderer.on(channel, (e, ...args) => {
      console.log("ipcRender receive : %s %o \nreturn: %o ", channel, args, e)
      func(e, ...args)
      return e
    })
  },
  openExternal: async (url: string) => {
    shell.openExternal(url)
  },
  openWiki: async (page: string) => {
    shell.openExternal("https://www.poewiki.net/wiki/" + page)
  },
})
