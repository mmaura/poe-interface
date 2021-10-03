export interface myAPI {
    hello: () => Promise<void>,
    player_get: () => Promise <{level: number, zone: string, name: string }>,
}
  
declare global {
    interface Window {
        myAPI: myAPI
    }
}

// export interface IProps {
// }

