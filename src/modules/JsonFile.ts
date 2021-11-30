import { app } from 'electron'

import fs from 'fs'
import path from 'path'
import { MyLogger } from './functions'

export class JsonFile<Type> {
  private _FileName: string
  protected _JsonObject: Type

  constructor(filename: string) {
    this._FileName = filename
  }

  async save(): Promise<void> {
    // fs.copyFileSync(this._FileName, `${path.dirname(this._FileName)}${path.sep}${path.basename(this._FileName,path.extname(this._FileName))}${Date()}${path.extname(this._FileName)}`)
    // fs.writeFileSync(this._FileName, JSON.stringify(this._JsonObject, null, 2))
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

  setObject(object: Type): boolean {
    this._JsonObject = object
    return true
  }

  getFileName(): string {
    return this._FileName
  }
}