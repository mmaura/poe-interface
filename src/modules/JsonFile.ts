import { app } from 'electron'

import fs from 'fs'
import path from 'path'

export class JsonFile <Type> {
    private _FileName: string
    private _JsonObject: Type

    constructor(filename: string) {
        this._FileName = filename
    }


    save(): void {
        // fs.copyFileSync(this._FileName, `${path.dirname(this._FileName)}${path.sep}${path.basename(this._FileName,path.extname(this._FileName))}${Date()}${path.extname(this._FileName)}`)
        fs.writeFileSync(this._FileName, JSON.stringify(this._JsonObject, null, 2))
    }

    load(): void {
        try {
            const data = fs.readFileSync(this._FileName)
            this._JsonObject = JSON.parse(data.toLocaleString())
        } catch (err: any) {
            throw new Error(`unable to open file: ${this._FileName}.\n\n ${err.message}`);
        }
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