export interface myAPI {
  hello: () => Promise<void>;
  getInitData: () => Promise<any>;
  send: (channel: string, ...arg: any) => void;
  receive: (channel: string, func: (event: any, ...arg: any) => void) => void;
}

declare global {
  interface IReactAppInit {
    MyPlayer: IAppPlayer;
    MyConn: pln_conn;
    DefaultZonesData: IZoneData;
    DefaultGearsData: IGearData;
  }
  type IAppPlayer = {
    name: string;
    level: number;
    characterClass: string;
    currentZoneName: string;
    currentZoneAct: number;
  };
  type IAppZone = {
    hastrial: boolean;
    image: string[];
    note: string;
    level: number;
    name: string;
    haspassive: bool;
    questRewardsSkills: bool;
    altimage: string;
    quest: string;
    hasRecipe: bool;
    gears?: {
      note?: string;
      gears?: {
        note?: string;
        sockets?: "r" | "g" | "b"[];
      }[];
    };
  };
  type IAppAct = {
    act: string;
    actid: number;
    zones: IAppZone[];
  };

  interface IZoneData {
    acts: IAppAct[];
  }

  interface IGear {
    type: "socket" | "gem";
    color?: "b" | "r" | "g" | "w";
    gem?: string;
  }

  interface IAppGear {
    actid: number;
    zonename: string;
    note?: string;
    gears: IGear[][];
  }

  interface IGearData {
    gears: IAppGear[];
  }

  interface Window {
    myAPI: myAPI;
  }
}
