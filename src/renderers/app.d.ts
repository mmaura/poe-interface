
export interface poe_interfaceAPI {
  cleanup: (channel: string) => void
  send: (channel: string, ...arg: any[]) => Promise<any>
  sendSync: (channel: string, ...arg: any[]) => Promise<any>
  receive: (channel: string, func: (event: any, ...arg: any[]) => void) => void
  openExternal: (url: string) => void
  openWiki: (page: string) => void
}

declare global {
  interface Window {
    poe_interface_API: poe_interfaceAPI
  }

  export interface GearSocketRef {
    actId: number, gearName: string, gemIndex: number
  }

  type IAppPlayer = {
    name: string
    level: number
    characterClass: string
    characterAscendancy?: string
    currentZoneName: string
    currentZoneAct: number
  }

  /****************************/
  export interface IActsGuide {
    identity: ActGuideIdentity
    acts: IActsGuideAct[]
  }

  export interface IActsGuideAct {
    act?: string
    actid: number
    zones: IActsGuideZone[]
  }

  export interface IActsGuideZone {
    hastrial?: boolean
    image?: string[]
    note: string
    level?: number
    name: string
    haspassive?: boolean
    questRewardsSkills?: boolean
    altimage?: string
    quest?: string
    hasRecipe?: boolean
    hasWaypoint?: boolean
    recipe?: Recipe
  }

  /****************************/
  export interface IClassesAscendancies {
    classe?: string
    ascendancy?: string[]
  }

  /***************************/
  export interface GuidesIdentity {
    name: string
    lang: string
    game_version: number
    filename?: string
    webAssetPath?: string
    sysAssetPath?: string
    readonly?: boolean
    class?: string
    url?: string
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface ActGuideIdentity extends GuidesIdentity { }

  export interface ClassGuideIdentity extends GuidesIdentity {
    // class: stringGuideIdentity
    class: string
  }

  /***************************/
  export interface IClassesGuide {
    identity: ClassGuideIdentity
    acts: IClassesGuideAct[]
  }

  export interface IClassesGuideAct {
    actId: number
    notes?: string
    gears: IClassesGuideGear[]
    treeimage?: string
  }

  export interface IClassesGuideGear {
    name: string
    notes?: string
    gem_info: IClassesGuideGemInfo[]
    gems?: IGems[]
  }

  export interface IClassesGuideGemInfo {
    name: string
    note?: string
  }

  /***************************/
  // used for load from file
  export interface IGem {
    name: string
    alternative_quality: AlternativeQuality[]
    required_level: number
    currency_amount: number
    currency: string
    vendor_rewards: Reward[]
    quest_rewards: Reward[]
    is_socket: boolean
    notes?: string
    image?: string
    isAlternateQuality?: boolean
  }

  export enum AlternativeQuality {
    Anomalous = "Anomalous",
    Divergent = "Divergent",
    Phantasmal = "Phantasmal",
  }

  export interface Reward {
    quest: string
    act: number
    classes: string[]
    npc?: string
  }
  //for use in app
  export interface IGemList {
    name: string
    label: string
    required_level: number
    currency_amount: number
    currency: string
    image: string
    key?: string
    is_alternateQuality: boolean
    is_advanced: boolean
    is_active: boolean
    is_socket?: boolean
    is_support?: boolean
    notes?: string
    is_new?: boolean
    vendor_rewards?: Reward[]
    quest_rewards?: Reward[]
  }

  /***************************/
  export interface IRichText {
    name: string
    keywords: string[]
    style: string
    order: number
  }

  /***************************/
  export interface IActsZonesSkel {
    identity: GuidesIdentity
    acts: IActsZonesSkelAct[]
  }

  export interface IActsZonesSkelAct {
    act: string
    actid: number
    zones: IActsZonesSkelZone[]
  }

  export interface IActsZonesSkelZone {
    hasRecipe?: boolean
    haspassive?: boolean
    hastrial?: boolean
    level: number
    name: string
    quest?: string
    questRewardsSkills: boolean
    image?: string[]
    recipe?: Recipe
    hasWaypoint?: boolean
  }

  export interface Recipe {
    mods?: string[]
    tooltip?: string
  }
}






