import path from 'path'
import { MenuItem, shell } from 'electron'
import { DataLoader } from './DataLoader'
import { debugMsg } from './functions'


interface HelperFile {
    name: string;
    filename: string;
    webpath: string;
}

export class GameHelpers extends DataLoader {
    Files: HelperFile[]

    constructor() {
        super("helpers")
        this.Files = [] as HelperFile[]
    }

    async Init(): Promise<void> {
        await Promise.all([
            this.Populate(this.getAbsPackagedPath(), this.getPackagedWebBaseName()),
            this.Populate(this.getAbsCustomPath(), this.getCustomWebBaseName()),
        ])
    }

    async Populate(dirPath: string, webPath: string): Promise<void> {
        this.FilesFromPath(dirPath, [".png", ".jpg", ".txt"]).forEach(f =>
            this.Files.push({ filename: f, webpath: this.MakeWebPath(webPath, f), name: path.basename(f, path.extname(f)) }))
    }

    AppendMenu(menuHelpers: MenuItem): void {
        if (this.Files !== undefined) this.Files.forEach(f => {
            menuHelpers.submenu.append(
                new MenuItem({
                    label: `${f.name}`,
                    click: () => {
                        debugMsg(`loading helper file :  ${f.filename}`)
                        shell.openPath(f.filename)
                    },
                })
            )
        })
    }
}