import path from 'path'
import fs, { constants } from 'fs'
import { Lang, MyLogger } from './functions'
import { JsonFile } from './JsonFile'
import { DataLoader } from './DataLoader'

interface GuideType {
    identity: GuideIdentity;
}

export abstract class Guides<T extends GuideType> extends DataLoader {
    protected Identities = [] as GuideIdentity[]
    protected CurGuide: T

    abstract parseCurGuide(): void

    constructor(subdir: string) {
        super(subdir)
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
                .catch((e) => {
                    MyLogger.log('info', `No custom guide in ${this.getAbsCustomPath()}`)
                    MyLogger.log('info', `${e}`)
                }),
        ]).finally(() => {
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

    /**
     * 
     * @param filename guide filename 
     * @returns if filename empty return 'default' identity in 'OsLocaleLang' if not found, return 'default' identity in 'en', 
     * if not found return the first identity
     */
    getIdentityByFilename(filename?: string): GuideIdentity {
        let curIdent = {} as GuideIdentity

        if (filename) curIdent = this.Identities.find(ident => ident.filename === filename)
        if (curIdent === undefined) curIdent = this.Identities.find(ident => ident.name === "default" && ident.lang === Lang)
        if (curIdent === undefined) curIdent = this.Identities.find(ident => ident.name === "default" && ident.lang === 'en')
        if (curIdent === undefined) curIdent = this.Identities[0]

        return curIdent
    }

    getCurGuide(): T {
        if (this.CurGuide) return this.CurGuide
        else return undefined
    }

    public getCurGuideLabel(): string {
        return `${this.CurGuide.identity.game_version} - ${this.CurGuide.identity.lang} - ${this.CurGuide.identity.name}`
    }

    public getCurGuideID(): string {
        if (this.CurGuide) return `${this.CurGuide.identity.filename}`
        else return undefined
    }

    async setCurGuide(guideName?: string): Promise<void> {
        const curIdent = this.getIdentityByFilename(guideName)
        const json = new JsonFile<T>(curIdent.filename)
        json.load()
        this.CurGuide = json.getObject()
        this.CurGuide.identity = curIdent

        this.parseCurGuide()
        this.emit("GuideChange", this.CurGuide)
        MyLogger.log('info', `set cur guide ${this.CurGuide.identity.filename}`)
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
            this.CurGuide.identity.filename = this.RenameGuideFolder(identity.name, this.CurGuide.identity.filename)
        }
        this.CurGuide.identity.lang = identity.lang
        this.CurGuide.identity.game_version = identity.game_version
        this.saveCurGuide()
    }

    RenameGuideFolder(newName: string, filename: string): string {
        const oldName = filename.split(path.sep)[filename.split(path.sep).length - 2]
        const guideName = filename.split(path.sep)[filename.split(path.sep).length - 1]
        const newPath = path.normalize(path.join(this.getAbsCustomPath(), newName))
        fs.renameSync(path.join(this.getAbsCustomPath(), oldName), newPath)
        return path.join(newPath, guideName)
    }

    /**
     * Record guide.json file after deleting unwanted keys.
     * And make a reload of guides
     */
    async saveCurGuide(): Promise<void> {
        try {
            MyLogger.log('info', `save ${this.CurGuide.identity.filename}`)

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
            MyLogger.log('error', `Error when saving custom guide in ${this.CurGuide.identity.filename}`)
        }
        this.Init(this.CurGuide.identity.filename)
    }

    /**
     * populate Identities with the Guides.
     */
    private async populateIdentities(dirPath: string, webPath: string, readOnly?: boolean) {
        const files = this.GuideFromSubPath(dirPath)
        if (files) {
            files.forEach(f => {
                const json = new JsonFile<T>(f)
                try {
                    json.load()
                    const object = json.getObject()
                    if ((readOnly) && (readOnly === true)) object.identity.readonly = true
                    else object.identity.readonly = false
                    object.identity.filename = f
                    object.identity.webAssetPath = this.getWebPath(webPath, f)
                    object.identity.sysAssetPath = path.dirname(f)
                    this.Identities.push(object.identity)
                }
                catch (e) {
                    MyLogger.log('error', `Error when loading custom guide in ${f}`)
                    MyLogger.log('error', `${e}`)
                }
            })
        }
        else {
            MyLogger.log('info', `No guide file found in ${dirPath}`)
        }
    }

    /**
     * 
     * @param filename name(optional) of the guide to duplicate (current guide if empty)
     * @returns true or throw error
     */
    async DuplicateGuide(filename?: string): Promise<string> {
        let dstPath = ""
        let suffix = ""
        try {
            if (!filename) filename = this.CurGuide.identity.filename
            const srcIdent = this.getIdentityByFilename(filename)

            suffix = `${srcIdent.name}_copy`
            dstPath = path.normalize(`${path.join(this.getAbsCustomPath(), suffix)}`)
            while (fs.existsSync(dstPath)) {
                suffix = `${suffix}_copy`
                dstPath = path.normalize(`${path.join(this.getAbsCustomPath(), suffix)}`)
            }

            const newFilename = path.join(dstPath, "guide.json")
            this._recursiveCopyFileSync(srcIdent.sysAssetPath, dstPath, path.basename(srcIdent.filename))

            const json = new JsonFile<T>(newFilename)
            json.load()
            const guide = json.getObject()
            guide.identity.name = `${suffix}`
            json.setObject(guide)
            json.save()

            return newFilename
        }
        catch (e) {
            MyLogger.log('error', `Error when duplicate custom guide in ${filename}`)
            MyLogger.log('error', `${e}`)
        }
    }

    /**
     * copy recursively a directory
     * @param src 
     * @param dst 
     * @param guideName the basename of the guide to copy
     */
    private _recursiveCopyFileSync(src: string, dst: string, guideName?: string): void {
        MyLogger.log('info', `mkdir ${dst}`)
        fs.mkdirSync(dst, { recursive: true })

        fs.readdirSync(src, { withFileTypes: true }).forEach(item => {
            if (item.isDirectory()) this._recursiveCopyFileSync(path.join(src, item.name), path.join(dst, item.name))

            if (item.isFile()) {
                if (!guideName) {
                    fs.copyFileSync(path.join(src, item.name), path.join(dst, item.name), constants.COPYFILE_EXCL)
                    MyLogger.log('info', `cp ${path.join(src, item.name)} ${path.join(dst, item.name)} `)
                }
                if ((guideName) && (item.name === guideName)) {
                    fs.copyFileSync(path.join(src, item.name), path.join(dst, "guide.json"), constants.COPYFILE_EXCL)
                    MyLogger.log('info', `cp ${path.join(src, item.name)} ${path.join(dst, item.name)} `)
                }
            }
        })
    }
}
