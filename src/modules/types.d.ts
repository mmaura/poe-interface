type plm_area = {name: string, type: 'area'|'vaal'|'map'|'master'|'labyrinth'|'unknown', info:any }
type plm_conn = {server: string, latency: string}


declare module "poe-log-monitor" {
    type options = {logfile?: string, interval?: number}
    
    class PathOfExileLog {
        constructor(options)
        pause(): void
        start(): void
        parseLog(): void
        on(event: 'instanceServer', listener: (instanceServer: ClientRequest) => void): this;
        on(event: 'area', listener: (instanceServer: plm_area) => void): this;
        on(event: 'login', listener: (instanceServer: plm_conn ) => void): this; 
        on(event: 'level', listener: (instanceServer: {name: string, characterClass: string, level: number}) => void): this;
    }
    
    
    //(prameters?: options) : PathOfExileLog
//    function PathOfExileLog (prameters: any) : PathOfExileLog
    export = PathOfExileLog;
}



  