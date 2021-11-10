import path from 'path'
import fs from 'fs'
import { MenuItem, shell } from 'electron'
import { DataLoader } from './DataLoader'
import { debugMsg } from './functions'

interface HelperFile {
    filename: string;
    webpath: string;
}

export class GameHelpers extends DataLoader {
    Files: HelperFile[]

    constructor() {
        super("helpers")
    }

    async Init(): Promise<void> {
        await Promise.all([
            this.Populate(this.getAbsPackagedPath(), this.getPackagedWebBaseName()),
            this.Populate(this.getAbsCustomPath(), this.getCustomWebBaseName())
        ])
    }

    async Populate(dirPath: string, webPath: string): Promise<void> {
        await this.FilesFromPath(dirPath, [".png", ".jpg", "txt"]).then(f =>
            f.forEach(_f =>
                this.Files.push({ filename: _f, webpath: this.MakeWebPath(webPath, _f) })))
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

    AppendMenu(menuHelpers: MenuItem): void {
        if (this.Files !== undefined) this.Files.forEach(f => {
            menuHelpers.submenu.append(
                new MenuItem({
                    label: `${f}`,
                    click: () => {
                        debugMsg(`loading helper file :  ${f.filename}`)
                        shell.openPath(f.filename)
                    },
                })
            )
        })
    }
}