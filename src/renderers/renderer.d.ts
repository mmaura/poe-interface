export interface myAPI {
    hello: () => Promise<void>,
    getData: () => Promise <any>,
    send: (channel: string, ...arg: any) => void;
    receive: (channel: string, func: (event: any, ...arg: any) => void) => void;
}
  
declare global {
    type player = {name: string, level: number, characterClass: string, currentZoneName: string, currentZoneAct: number}
    type levelTip = {'levelMin': number, 'levelMax': number, description: string}
    type gem = {src: URL, name: string}

    interface Window {
        myAPI: myAPI
    }
}

