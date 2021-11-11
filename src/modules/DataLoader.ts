import path from 'path'
import fs from 'fs'
import { getAbsPackagedPath, getAbsCustomPath, getPackagedWebBaseName, getCustomWebBaseName } from './functions'
import { EventEmitter } from 'events';

export class DataLoader extends EventEmitter {
    protected subDirectory: string

    constructor(subdir: string) {
        super()
        this.subDirectory = subdir
    }

    /**
     * 
     * @returns the base absolute path of the packaged assets files
     */
    protected getAbsPackagedPath(): string {
        return path.join(getAbsPackagedPath(), this.subDirectory)
    }

    /**
     * 
     * @returns the web base path of the packaged assets files
     */
    protected getPackagedWebBaseName(): string {
        return [getPackagedWebBaseName(), this.subDirectory].join('/')
    }

    /**
     * 
     * @returns the base absolute path of the custom assets files
     */
    protected getAbsCustomPath(): string {
        return path.join(getAbsCustomPath(), this.subDirectory)
    }

    /**
     * 
     * @returns the web base path of the custom assets files
     */
    protected getCustomWebBaseName(): string {
        return [getCustomWebBaseName(), this.subDirectory].join('/')
    }

    /**
     * 
     * @param dir the directory to parse to find Guides
     * @param exts array of extension to return with the dot
     * @returns array of json guide filename (string)
     */
    protected FilesFromSubPath(dir: string, exts: string[]): string[] {
        const _files = [] as string[]

        fs.readdirSync(dir, { withFileTypes: true }).forEach(sdir => {
            if (sdir.isDirectory()) _files.push(...this.FilesFromPath(path.join(dir, sdir.name), exts))
        })
        return _files
    }

    protected FilesFromPath(dir: string, exts: string[]): string[] {
        const _files = [] as string[]

        fs.readdirSync(dir, { withFileTypes: true }).forEach(f => {
            if ((f.isFile()) && (exts.includes(path.extname(f.name)))) {
                _files.push(path.join(dir, f.name))
            }
        })
        return _files
    }

    getWebPath(webPath: string, filename: string): string {
        return `${webPath}/${filename.split(path.sep)[filename.split(path.sep).length - 2]}`
    }
}