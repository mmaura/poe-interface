export interface configAPI {
  getInitData: () => Promise<any>;
  sendSync: (channel: string, ...arg: any) => Promise<any>;
  send: (channel: string, ...arg: any) => void;
  receive: (channel: string, func: (event: any, ...arg: any) => void) => void;
  openExternal: (url: string) => void;
  ShowPoeLogDialog: (poeLogPath: string) => string;
}

declare global {
  interface Window {
    configAPI: configAPI;
  }

  interface ISendParam {
    func: "showPoeLogPathDialog" | "getInitData" | string;
    var: string[];
  }
}
