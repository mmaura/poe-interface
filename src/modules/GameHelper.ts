import path from 'path'
import fs from 'fs'
import { shell } from 'electron'
import { DataLoader } from './DataLoader'

export class GameHelpers extends DataLoader{
    Files: string[]

    constructor() {
        super("helpers")
    }

    Init(): void {
        this.Files = [] as string[]
        if (fs.existsSync(this.getAbsCustomPath())) {
            fs.readdirSync(this.getAbsCustomPath(), { withFileTypes: true })
                .forEach(f => {
                    if (f.isFile() && path.extname(f.name) === ".png") {
                        this.Files.push(path.join(this.getAbsCustomPath(),f.name))
                    }
                })
        }

        fs.readdirSync(this.getAbsCustomPath(), { withFileTypes: true }).forEach(item => {
            this.Files.push(path.basename(item.name, path.extname(item.name)))
        })
    }


    OpenHelperFile(file: string): void {
        const exts = ["png", "jpg"]
        let filename = path.join(this.getAbsCustomPath(), file)

        for (const ext of exts) {
            console.log(filename + "." + ext)
            if (fs.existsSync(filename + "." + ext)) {
                filename = filename + "." + ext
                break
            }
        }
        shell.openPath(filename)
    }
}