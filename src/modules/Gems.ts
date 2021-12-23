import { getAbsPackagedPath, getPackagedWebBaseName, MyLogger } from "./functions"
import { JsonFile } from "./JsonFile"
import path from 'path'

export class Gems extends JsonFile<IGem[]>{
  private GemList: IGemList[]

  constructor () {
    super(path.join(getAbsPackagedPath(), "data", "gems.json"))
    this.GemList = []
  }

  async Init(): Promise<void> {
    return super.Init().then(() => {
      this.getObject().sort((a, b) => {
        if (a.name < b.name) { return -1 }
        if (a.name > b.name) { return 1 }
        return 0
      }
      )

      this.GenerateGemList().catch((e) => {
        MyLogger.error("unable to generate gems list.")
        console.log(e)
      })
    }).catch(() => { MyLogger.error("unable to load gems.") })
  }

  async GenerateGemList(): Promise<void> {
    this.GemList = [] as IGemList[]

    for (const g of this.getObject()) {
      this.GemList.push({
        name: g.name,
        label: g.name,
        image: g.is_socket?`${getPackagedWebBaseName()}/images/sockets/${g.name}.png`:`${getPackagedWebBaseName()}/images/gems/${g.name}.png`,
        required_level: g.required_level,
        currency: (g.currency) ? `${getPackagedWebBaseName()}/images/currency/${g.currency}.png` : "",
        currency_amount: g.currency_amount,
        is_active: (! /.*Support/gi.test(g.name)) && !g.is_socket,
        is_alternateQuality: false,
        is_advanced: /Awakened.*/gi.test(g.name),
        is_support: /.*Support/gi.test(g.name),
        key: g.name.replace(" ", "_"),
        is_socket: g.is_socket,
        vendor_rewards: g.vendor_rewards && g.vendor_rewards.sort((a, b) => a.actId - b.actId) || [],
        quest_rewards: g.vendor_rewards && g.quest_rewards.sort((a, b) => a.actId - b.actId) || []
      })
      for (const q of g.alternative_quality) {
        this.GemList.push({
          name: g.name,
          label: `${g.name} (${q})`,
          image: `${getPackagedWebBaseName()}/images/gems/${g.name}.png`,
          required_level: g.required_level,
          currency: ``,
          currency_amount: 0,
          is_active: (! /.*Support/gi.test(g.name)) && !g.is_socket,
          is_alternateQuality: true,
          is_advanced: /Awakened.*/gi.test(g.name),
          is_support: /.*Support/gi.test(g.name),
          key: `${g.name}_${q}`.replace(" ", "_"),
          is_socket: g.is_socket,
          vendor_rewards: [],
          quest_rewards: []
        })
      }
    }
    MyLogger.info(`${this.GemList.length} generated gems.`)
  }

  Exist(gemName: string): boolean {
    gemName.trim()
    if (this.getObject().find(e => { return (e.name === gemName || e.name === `${gemName} Support` ) })) return true
    return false
  }

  getByName(gemName: string): IGemList {
    gemName.trim()
    const gem = this.GemList.find(e => { return (e.name === gemName || e.name === `${gemName} Support` ) })

    // if (gem) {
    //   gem.image = `${getPackagedWebBaseName()}/images/gems/${gem.name}.png`
    // }
    return gem
  }

  getGemsList(): IGemList[] {
    return this.GemList
  }
}