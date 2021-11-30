import { getAbsPackagedPath, getPackagedWebBaseName, MyLogger } from "./functions";
import { JsonFile } from "./JsonFile";
import path from 'path'

export class Gems extends JsonFile<IGem[]>{
  private GemList: IGemList[]

  constructor() {
    super(path.join(getAbsPackagedPath(), "data", "gems.json"))
    this.GemList = []
  }

  async Init(): Promise<void> {
    return super.Init().then(() => {
      // this.getObject().sort()

      this.GenerateGemList().catch(() => {
        MyLogger.error("unable to generate gems list.")
      })
    }).catch(() => { MyLogger.error("unable to load gems.") })
  }

  async GenerateGemList(): Promise<void> {
    for (const g of this.getObject()) {
      this.GemList.push({
        name: g.name,
        image: `${getPackagedWebBaseName()}/images/gems/${g.name}.png`,
        required_level: g.required_level,
        currency: (g.currency)?`${getPackagedWebBaseName()}/images/currency/${g.currency}.png`:"",
        currency_amount: g.currency_amount,
        isAlternateQuality: false,
        value: g.name,
        is_socket: g.is_socket
      })
      for (const q of g.alternative_quality) {
        this.GemList.push({
          name: `${g.name} (${q})`,
          image: `${getPackagedWebBaseName()}/images/gems/${g.name}.png`,
          required_level: g.required_level,
          currency: ``,
          currency_amount: 0,
          isAlternateQuality: true,
          value: `${g.name} (${q})`,
          is_socket: g.is_socket
        })
      }
    }
  }

  Exist(gemName: string): boolean {
    gemName.trim()
    if (this.getObject().find(e => { return e.name === gemName })) return true
    return false
  }

  getByName(gemName: string): IGemList {
    gemName.trim()
    const gem = this.GemList.find(e => { return e.name === gemName })
    if (gem) {
      gem.image = `${getPackagedWebBaseName()}/images/gems/${gem.name}.png`
    }
    return gem
  }

  getGemsList(): IGemList[] {
    return this.GemList
  }
}