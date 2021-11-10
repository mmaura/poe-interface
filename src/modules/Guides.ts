import path from 'path'
import fs, { constants } from 'fs'
import { debugMsg, errorMsg } from './functions'
import { JsonFile } from './JsonFile'
import { DataLoader } from './DataLoader'

export interface GuideType {
    identity: GuideIdentity;
}

export abstract class Guides<T extends GuideType> extends DataLoader {
    protected Identities = [] as GuideIdentity[]
    protected CurGuide: T

    abstract parseCurGuide(): void

    public Warning: string[]


    constructor(subdir: string) {
        super(subdir)
        this.Warning = ["Guide constructed."]
    }

    /**
     * 
     * @param defaultGuideName the guide name to load
     */
    async Init(): Promise<any> {
        this.Identities = [] as GuideIdentity[]

        await Promise.all([
            this.populateIdentities(this.getAbsPackagedPath(), this.getPackagedWebBaseName()),
            this.populateIdentities(this.getAbsCustomPath(), this.getCustomWebBaseName())
                .catch(e => {
                    debugMsg(`Error on loading custom guides.\n\t${e}`)
                    this.Warning.push(`Error on loading custom guides.\n\t${e}`)
                }),
        ])
    }

    getIdentities(): GuideIdentity[] {
        return this.Identities
    }

    public getGuideLabel(filename: string): string {
        const ident = this.getIdentityByFilename(filename)
        return `${ident.game_version} - ${ident.lang} - ${ident.name}`
    }


    getIdentityByFilename(filename?: string): GuideIdentity {
        let curIdent = {} as GuideIdentity

        if (filename) curIdent = this.Identities.find(ident => ident.filename === filename)
        if (curIdent === undefined) curIdent = this.Identities.find(ident =>
            ident.name === "default" && ident.lang === 'en')
        if (curIdent === undefined) curIdent = this.Identities[0]

        return curIdent
    }

    getCurGuide(): T {
        return this.CurGuide
    }

    public getCurGuideLabel(): string {
        return `${this.CurGuide.identity.game_version} - ${this.CurGuide.identity.lang} - ${this.CurGuide.identity.name}`
    }

    public getCurGuideID(): string {
        return `${this.CurGuide.identity.filename}`
    }

    async setCurGuide(guideName?: string): Promise<T> {
        const curIdent = this.getIdentityByFilename(guideName)
        const json = new JsonFile<T>(curIdent.filename)
        json.load()
        this.CurGuide = json.getObject()
        this.CurGuide.identity = curIdent

        this.parseCurGuide()
        return this.CurGuide
    }

    /**
     * populate Identities with the Guides.
     */
    private async populateIdentities(dirPath: string, webPath: string) {
        return await this.getFilesList(dirPath)
            .then(files => {
                if (files) files.forEach(f => {
                    const json = new JsonFile<T>(f)
                    try {
                        json.load()
                        const object = json.getObject()
                        object.identity.filename = f
                        object.identity.webAssetPath = `${webPath}/${f.split(path.sep)[f.split(path.sep).length - 2]}`
                        object.identity.sysAssetPath = path.dirname(f)
                        this.Identities.push(object.identity)
                    }
                    catch (e) {
                        errorMsg(`Error on affecting packaged identity : for file ${f}\n\t${e}`)
                        this.Warning.push(`Error on affecting packaged identity : for file ${f}\n\t${e}`)
                    }
                })
                else {
                    debugMsg('No packaged guide found !!')
                    this.Warning.push('No packaged guide found !!')
                }
            })
    }

    /**
     * 
     * @param name name(optional) of the new guide
     * @returns true or throw error
     */
    async DuplicateCurGuide(name?: string): Promise<boolean> {
        try {
            let classGuideName = ""
            if (name) classGuideName = name
            else classGuideName = Date.now().toString()

            const dstPath = path.join(this.getAbsCustomPath(), classGuideName)

            this._recursiveCopyFileSync(this.getCurGuide().identity.sysAssetPath, dstPath)

            const json = new JsonFile<T>(path.join(dstPath, "guide.json"))
            json.load()
            const guide = json.getObject()
            guide.identity.name = classGuideName
            json.setObject(guide)
            await json.save()

            return true
        }
        catch (e) {
            errorMsg(e)
            return false
        }
    }

    private _recursiveCopyFileSync(src: string, dst: string): void {
        debugMsg(`mkdir ${dst}`)
        fs.mkdirSync(dst, { recursive: true })

        fs.readdirSync(src, { withFileTypes: true }).forEach(item => {
            if (item.isDirectory()) this._recursiveCopyFileSync(path.join(src, item.name), path.join(dst, item.name))

            if (item.isFile()) {
                fs.copyFileSync(path.join(src, item.name), path.join(dst, item.name), constants.COPYFILE_EXCL)
                debugMsg(`cp ${path.join(src, item.name)} ${path.join(dst, item.name)} `)
            }
        })
    }

    /**
     * 
     * @returns array of json guide filename for a directory (string)
     */
    private async getFilesList(dirPath: string): Promise<string[]> {
        return await this._getDirFileList(dirPath)
    }

    /**
     * 
     * @param dir the directory to parse to find Guides
     * @returns array of json guide filename (string)
     */
    private async _getDirFileList(dir: string): Promise<string[]> {
        const _files = [] as string[]

        debugMsg(`1 dir = ${dir} `)
        fs.readdirSync(dir, { withFileTypes: true }).forEach(sdir => {
            const dir2 = path.join(dir, sdir.name)
            debugMsg(`2 dir = ${dir2} `)
            if (sdir.isDirectory())
                fs.readdirSync(dir2, { withFileTypes: true }).forEach(f => {
                    const file = path.join(dir2, f.name)
                    if ((f.isFile()) && (path.extname(f.name) === '.json')) {
                        debugMsg(`push:  ** ${file} ** `)
                        _files.push(file)
                    }
                })
        })
        return _files
    }
}
