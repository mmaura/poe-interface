import path from 'path'
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
}