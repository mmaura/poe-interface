export interface myAPI {
    hello: () => Promise<void>,
    player_get: () => {level: number, zone: string, name: string },
}
  
declare global {
    interface Window {
        myAPI: myAPI
    }
}