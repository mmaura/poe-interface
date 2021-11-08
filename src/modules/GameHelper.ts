import path from 'path'
import fs from 'fs'
import { shell } from 'electron'
import { getAbsCustomPath, getAssetPath } from './functions'

export class GameHelpers {
    Files: string[]
    Subdirectory: string

    constructor() {
        this.Subdirectory = "helpers"
    }

    Init(): void {
        this.Files = [] as string[]
        if (!fs.existsSync(this.getAbsCustomPath())) {
            fs.mkdirSync(this.getAbsCustomPath(), { recursive: true })
            fs.readdirSync(path.join(getAssetPath(), "helpers"), { withFileTypes: true })
                .forEach(item => {
                    if (item.isFile) {
                        fs.copyFileSync(
                            path.join(getAssetPath(), "helpers", item.name),
                            path.join(this.getAbsCustomPath(), item.name)
                        )
                    }
                })
        }
        fs.readdirSync(this.getAbsCustomPath(), { withFileTypes: true }).forEach(item => {
            this.Files.push(path.basename(item.name, path.extname(item.name)))
        })
    }

    getAbsCustomPath(): string {
        return path.join(getAbsCustomPath(), this.Subdirectory)
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