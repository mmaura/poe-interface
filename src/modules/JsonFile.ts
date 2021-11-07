import { app } from 'electron'

import fs from 'fs'
import path from 'path'

export class JsonFile <Type> {
    private _FileName: string
    private _JsonObject: Type

    constructor(filename: string) {
        this._FileName = filename
    }


    async save(): Promise<boolean> {
        fs.writeFileSync(this._FileName, JSON.stringify(this._JsonObject, null, 2))
        return true
    }

    load(): void {
        try {
            const data = fs.readFileSync(this._FileName)
            this._JsonObject = JSON.parse(data.toLocaleString())
            // return this._JsonObject
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