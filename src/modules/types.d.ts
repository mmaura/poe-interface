declare module "poe-log-monitor" {
    type options = {logfile?: string, interval?: number}
    class PathOfExileLog {
        constructor(options)
        pause(): void
        start(): void
        parseLog(): void
        on(event: 'instanceServer', listener: (instanceServer: ClientRequest) => void): this;
        on(event: 'area', listener: (instanceServer: ClientRequest) => void): this;
    }
    
    
    //(prameters?: options) : PathOfExileLog
//    function PathOfExileLog (prameters: any) : PathOfExileLog
    export = PathOfExileLog;
}



  