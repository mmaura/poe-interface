import path from 'path'
import fs from 'fs'
import { getAbsPackagedPath, getAbsCustomPath, getPackagedWebBaseName, getCustomWebBaseName } from './functions'

export class DataLoader {
    protected subDirectory: string

    constructor(subdir: string) {
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
    protected async FilesFromSubPath(dir: string, exts: string[]): Promise<string[]> {
        const _files = [] as string[]

        fs.readdirSync(dir, { withFileTypes: true }).forEach(sdir => {
            // const dir2 = path.join(dir, sdir.name)
            if (sdir.isDirectory()) this.FilesFromPath(path.join(dir, sdir.name), exts).then(f => { _files.push(...f) })
            // fs.readdirSync(dir2, { withFileTypes: true }).forEach(f => {
            //     const file = path.join(dir2, f.name)
            //     if ((f.isFile()) && (exts.includes(path.extname(f.name)))) {
            //         _files.push(file)
            //     }
            // })
        })
        return _files
    }

    protected async FilesFromPath(dir: string, exts: string[]): Promise<string[]> {
        const _files = [] as string[]

        fs.readdirSync(dir, { withFileTypes: true }).forEach(f => {
            const file = path.join(dir, f.name)
            if ((f.isFile()) && (exts.includes(path.extname(f.name)))) {
                _files.push(file)
            }
        })
        return _files
    }

    MakeWebPath(webPath: string, filename: string): string {
        return `${webPath}/${filename.split(path.sep)[filename.split(path.sep).length - 2]}`
    }
}