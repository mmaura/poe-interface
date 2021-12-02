import fs from 'fs'
import { MyLogger } from './functions'

export class JsonFile<Type> {
  private _FileName: string
  protected _JsonObject: Type

  constructor (filename: string) {
    this._FileName = filename
  }

  async save(): Promise<void> {
    await fs.promises.writeFile(this._FileName, JSON.stringify(this._JsonObject, null, 2))
  }

  async Init(): Promise<void> {
    await fs.promises.readFile(this._FileName)
      .then((data) => {
        this._JsonObject = JSON.parse(data.toLocaleString())
      })
      .catch((err) => {
        MyLogger.log('error', `Init JsonFile unable to open file: ${this._FileName}`)
        MyLogger.log('error', `${err.message}`)
      })
  }

  getObject(): Type {
    return this._JsonObject
  }

  setObject(object: Type): Type {
    this._JsonObject = object
    return this._JsonObject
  }

  getFileName(): string {
    return this._FileName
  }
}