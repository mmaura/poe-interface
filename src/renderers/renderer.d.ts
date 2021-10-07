export interface myAPI {
    hello: () => Promise<void>,
    player_get: () => Promise <player>,
}
  
declare global {
    type player = {level: number, zone: string, name: string }
    type gem = {src: URL, name: string}
    interface Window {
        myAPI: myAPI
    }
}

