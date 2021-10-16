export interface levelingAPI {
  hello: () => Promise<void>;
  getInitData: () => Promise<any>;
  send: (channel: string, ...arg: any) => void;
  receive: (channel: string, func: (event: any, ...arg: any) => void) => void;
  openExternal: (url: string) => void;
}

declare global {
  interface IInitialData {
    classes: IAppClasses[];
    acts: IAppAct[];
    gems: IAppGems[];
  }

  interface IReactAppInit {
    MyPlayer: IAppPlayer;
    MyConn: pln_conn;
    InitialData: IInitialData;
    DefaultGuide: IGuideData;
  }

  interface IAppAct {
    act: string;
    actid: number;
    zones: IAppZone[];
  }

  interface IZoneData {
    acts: IAppAct[];
  }

  type IAppPlayer = {
    name: string;
    level: number;
    characterClass: string;
    characterAscendancy: string;
    currentZoneName: string;
    currentZoneAct: number;
  };

  type IAppZone = {
    hastrial: boolean;
    image: string[];
    note: string;
    level: number;
    name: string;
    haspassive: boolean;
    questRewardsSkills: boolean;
    altimage: string;
    quest: string;
    hasRecipe: boolean;
    gears?: {
      note?: string;
      gears?: {
        note?: string;
        sockets?: "r" | "g" | "b"[];
      }[];
    };
  };

  interface IGear {
    type: "socket" | "gem";
    color?: "b" | "r" | "g" | "w";
    gem?: string;
  }

  interface IAppGear {
    zones: {
      actid: number;
      zonename: string;
    }[];
    note?: string;
    gears: IGear[][];
    gems2buy?: string[];
  }

  interface IGuideData {
    gears: IAppGear[];
  }

  interface Window {
    levelingAPI: levelingAPI;
  }

  interface IBuy {
    npc: string;
    act: number;
    town: string;
    available_to: [
      | "Marauder"
      | "Witch"
      | "Scion"
      | "Ranger"
      | "Duelist"
      | "Shadow"
      | "Templar"
      | string
    ];
    quest_name: string;
  }
  interface IAppGems {
    reward: string;
    required_lvl: number;
    color: string;
    isReward: boolean;
    isSupport: boolean;
    buy: IBuy[];
    name: string;
    isVaal: boolean;
    gemTags: string[];
    iconPath: string;
    isActive: boolean;
  }
  interface IGemsData {
    "": IAppGems;
  }
  interface IAppClasses {
    classe: string;
    ascendancy: string[];
  }
  interface IDefaultClassesData {
    "": IAppClasses[];
  }
}
