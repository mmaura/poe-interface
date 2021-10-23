import { BrowserWindow, dialog, ipcMain, NativeImage } from "electron"

import { DlAllGemImg } from "../modules/functions"

import Store from "electron-store"
import fs from "fs"

declare const CONFIG_WINDOW_WEBPACK_ENTRY: string
declare const CONFIG_WINDOW_PRELOAD_WEBPACK_ENTRY: never

export class ConfigWindow {
	private _PoeLogPath = ""
	protected _Window: BrowserWindow

	private _CanClose = false
	private _AppStore: Store

	constructor(appStore: any, AppIcon: NativeImage) {
		this._Window = new BrowserWindow({
			width: 600,
			height: 400,
			icon: AppIcon,
			title: "Configuration",
			show: false,
			webPreferences: {
				nodeIntegration: false,
				contextIsolation: true,
				//worldSafeExecuteJavaScript: true,
				preload: CONFIG_WINDOW_PRELOAD_WEBPACK_ENTRY,
			},
		})

		this._AppStore = appStore
		this._PoeLogPath = this._AppStore.get("poe_log_path", "") as string

		this._Window.loadURL(CONFIG_WINDOW_WEBPACK_ENTRY)
		//this._Window.webContents.openDevTools()
		this._Window.setMenu(null)

		DlAllGemImg(this._Window)

		/**********************************
		 * Window Events
		 */

    this._Window.on('ready-to-show', () => {
      if(!this._PoeLogPath)
        this.ShowPoeLogDialog()
    })

		this._Window.on("close", (e) => {
			if (this._CanClose === false) {
				this._Window.hide()
				e.preventDefault()
			}
		})

		this._Window.on("closed", () => {
			this._Window = null
		})

		/**********************************
		 * IPC
		 */
		ipcMain.handle("configWindow", (event, arg: ISendParam) => {
			let response = {}

			switch (arg.func) {
				case "getInitData":
					response = {
						poeLogPath: this.getPoeLogPath(),
					}
					break
				case "showPoeLogPathDialog":
					this.ShowPoeLogDialog(arg.var[0])
					break
			}
			return response
		})
	}

	getConfigValue(configValue: string): unknown {
		return this._AppStore.get(configValue)
	}

	getConfigValueDefault(configValue: string, defaultValue: string): unknown {
		return this._AppStore.get(configValue, defaultValue)
	}

	getPoeLogPath(): string {
		if (fs.existsSync(this._PoeLogPath)) {
			return this._PoeLogPath
		}
		return ""
	}

	setPoeLogPath(path: string): void {
		this._PoeLogPath = path
		this._AppStore.set("poe_log_path", this._PoeLogPath)
	}

	setCanClose(state: boolean): void {
		this._CanClose = state
	}

	close(): void {
		this._CanClose = true
		this._Window.close()
	}

	show(): void {
		this._Window.show()
	}

	ShowPoeLogDialog(curPath?: string): void {
		
    if (!curPath) curPath = this.getPoeLogPath()
		
    dialog
			.showOpenDialog({
				filters: [{ name: "poe log file", extensions: ["txt", "log"] }],
				title: "Please choose PathOfExile log file",
				properties: ["openFile", "showHiddenFiles"],
				defaultPath: curPath,
			})
			.then((result) => {
				if (result.canceled === false) {
					this.setPoeLogPath(result.filePaths[0])
					this._Window.webContents.send("poeLogPath", result.filePaths[0])
				}
			})
			.catch((err) => {
				console.log(err)
			})
	}
}
