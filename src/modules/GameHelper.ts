import path from 'path'
import { MenuItem, shell } from 'electron'
import { DataLoader } from './DataLoader'
import { MyLogger } from './functions'


interface HelperFile {
    name: string;
    filename: string;
    webpath: string;
}

export class GameHelpers extends DataLoader {
    Files: HelperFile[]

    constructor() {
        super("helpers")
    }

    async Init(): Promise<void> {
      delete this.Files
      this.Files = [] as HelperFile[]

      await Promise.all([
            this.Populate(this.getAbsPackagedPath(), this.getPackagedWebBaseName()),
            this.Populate(this.getAbsCustomPath(), this.getCustomWebBaseName())
                .catch(e => {
                    MyLogger.log('info', `No custom helpers in ${this.getAbsCustomPath()}`)
                    MyLogger.log('info', `${e}`)
                }),
        ])
    }

    async Populate(dirPath: string, webPath: string): Promise<void> {
        const Files = this.FilesFromPath(dirPath, [".png", ".jpg", ".txt"])
        if (Files) Files.forEach(f =>
            this.Files.push({ filename: f, webpath: this.getWebPath(webPath, f), name: path.basename(f, path.extname(f)) }))
        else
            MyLogger.log('info', `No Helper file found in ${dirPath}`)
    }

    AppendMenu(menuHelpers: MenuItem): void {
        if (this.Files !== undefined) this.Files.forEach(f => {
            menuHelpers.submenu.append(
                new MenuItem({
                    label: `${f.name}`,
                    click: () => {
                        shell.openPath(f.filename)
                    },
                })
            )
        })
    }
}