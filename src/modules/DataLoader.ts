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
     * @returns array of json guide filename (string)
     */
    protected GuideFromSubPath(dir: string): string[] {
        const guideFile = [] as string[]
        for (const sdir of fs.readdirSync(dir, { withFileTypes: true })) {
            if (sdir.isDirectory()) {
                const ret = this.GuideFromPath(path.join(dir, sdir.name))
                if (guideFile !== undefined) guideFile.push(...ret)
            }
        }
        return guideFile
    }

    /**
     * 
     * @param dir path where to search
     * @returns absolute guide path with filename
     */
    protected GuideFromPath(dir: string): string[] {
        const guideFiles = [] as string[]
        for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
            // if ((f.isFile()) && (f.name === "guide.json")) {
            if (f.isFile()) {
                guideFiles.push(path.join(dir, f.name))
            }
        }
        return guideFiles
    }

    /**
     * 
     * @param dir path where to search
     * @param exts extension files to match
     * @returns array of files path with filename
     */
    protected FilesFromPath(dir: string, exts: string[]): string[] {
        const _files = [] as string[]

        fs.readdirSync(dir, { withFileTypes: true }).forEach(f => {
            if ((f.isFile()) && (exts.includes(path.extname(f.name)))) {
                _files.push(path.join(dir, f.name))
            }
        })
        return _files
    }

    /**
     * Append relative path to webpath
     * @param webPath 
     * @param filename 
     * @returns complete url to file
     */
    getWebPath(webPath: string, filename: string): string {
        return `${webPath}/${filename.split(path.sep)[filename.split(path.sep).length - 2]}`
    }
}