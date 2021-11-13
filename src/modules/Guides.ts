import path from 'path'
import fs, { constants } from 'fs'
import { debugMsg, errorMsg } from './functions'
import { JsonFile } from './JsonFile'
import { DataLoader } from './DataLoader'

interface GuideType {
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
    async Init(defaultGuideFilename?: string): Promise<any> {
        this.Identities = [] as GuideIdentity[]

        Promise.all([
            this.populateIdentities(this.getAbsPackagedPath(), this.getPackagedWebBaseName(), true),
            this.populateIdentities(this.getAbsCustomPath(), this.getCustomWebBaseName())
                .catch(e => {
                    debugMsg(`Info on loading custom guides.\n\t${e}`)
                    this.Warning.push(`Info on loading custom guides.\n\t${e}`)
                }),
        ]).then(() => {
            this.setCurGuide(defaultGuideFilename)
        })

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

    async setCurGuide(guideName?: string): Promise<void> {
        const curIdent = this.getIdentityByFilename(guideName)
        const json = new JsonFile<T>(curIdent.filename)
        json.load()
        this.CurGuide = json.getObject()
        this.CurGuide.identity = curIdent

        this.parseCurGuide()
        this.emit("GuideChange", this.CurGuide)
    }

    SaveIdentity(identity: GuideIdentity): void {
        if (identity.class) {
            this.CurGuide.identity.class = identity.class
        }
        if (identity.url) {
            this.CurGuide.identity.url = identity.url
        }
        if (this.CurGuide.identity.name !== identity.name) {
            this.CurGuide.identity.name = identity.name
            this.RenameGuideFolder(identity.name, this.CurGuide.identity.filename)
        }
        this.CurGuide.identity.lang = identity.lang
        this.CurGuide.identity.game_version = identity.game_version
        this.saveCurGuide()
    }

    RenameGuideFolder(newName: string, filename: string): void {
        const oldName = filename.split(path.sep)[filename.split(path.sep).length - 2]
        fs.renameSync(path.join(this.getAbsCustomPath(), oldName), path.normalize(path.join(this.getAbsCustomPath(), newName)))
    }

    /**
     * Record guide.json file after deleting unwanted keys.
     * Make a reload of guides
     */
    async saveCurGuide(): Promise<void> {
        try {
            const json = new JsonFile<T>(this.CurGuide.identity.filename)
            const tmp = JSON.parse(JSON.stringify(this.CurGuide)) as T
            delete tmp.identity.filename
            delete tmp.identity.readonly
            delete tmp.identity.sysAssetPath
            delete tmp.identity.webAssetPath

            json.setObject(tmp)
            json.save()
        }
        catch (e) {

        }
        finally {
            this.Init(this.CurGuide.identity.filename)
        }
    }

    /**
     * populate Identities with the Guides.
     */
    private async populateIdentities(dirPath: string, webPath: string, readOnly?: boolean) {
        const files = this.GuideFromSubPath(dirPath)
        if (files) {
            const json = new JsonFile<T>(files)
            try {
                json.load()
                const object = json.getObject()
                if ((readOnly) && (readOnly === true)) object.identity.readonly = true
                object.identity.filename = files
                object.identity.webAssetPath = this.getWebPath(webPath, files)
                object.identity.sysAssetPath = path.dirname(files)
                this.Identities.push(object.identity)
            }
            catch (e) {
                errorMsg(`Error on affecting packaged identity : for file ${files}\n\t${e}`)
                this.Warning.push(`Error on affecting packaged identity : for file ${files}\n\t${e}`)
            }
        }
        else {
            debugMsg('No packaged guide found !!')
            this.Warning.push('No packaged guide found !!')
        }
    }

    /**
     * 
     * @param filename name(optional) of the new guide
     * @returns true or throw error
     */
    async DuplicateGuide(filename?: string): Promise<string> {
        try {
            if (!filename) filename = this.CurGuide.identity.filename

            const srcIdent = this.getIdentityByFilename(filename)
            const dstPath = path.join(this.getAbsCustomPath(), Date.now().toString())

            const newFilename = path.join(dstPath, path.basename(srcIdent.filename))
            this._recursiveCopyFileSync(srcIdent.sysAssetPath, dstPath)

            const json = new JsonFile<T>(newFilename)
            json.load()
            const guide = json.getObject()
            guide.identity.name = `${srcIdent.name}_copy`
            json.setObject(guide)
            json.save()

            return newFilename
        }
        catch (e) {
            errorMsg(e)
        }
    }

    /**
     * copy recursively a directory
     * @param src 
     * @param dst 
     */
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
}
