export interface myAPI {
  hello: () => Promise<void>;
  getInitData: () => Promise<any>;
  send: (channel: string, ...arg: any) => void;
  receive: (channel: string, func: (event: any, ...arg: any) => void) => void;
}

declare global {
  type player = {
    name: string;
    level: number;
    characterClass: string;
    currentZoneName: string;
    currentZoneAct: number;
  };
  type levelTip = { levelMin: number; levelMax: number; description: string };
  type InitZone = {
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
  };
  type InitAct = {
    act: string;
    actid: number;
    zones: InitZone[];
  };

  interface InitData {
    acts: InitAct[];
  }

  // interface AppData {
  //     InitData:{
  //         acts: InitAct[],
  //         POE_PLAYER: player
  //     }
  // }

  interface Window {
    myAPI: myAPI;
  }
}
