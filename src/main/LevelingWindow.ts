import { BrowserWindow, ipcMain, NativeImage, IpcMainInvokeEvent, app } from "electron"
import PathOfExileLog from "poe-log-monitor"

import { getCharacterClass } from "../renderers/modules/functions"
import { loadJsonAct, loadJsonGuide, loadJsonRichText } from "../modules/functions"

declare const LEVELING_WINDOW_WEBPACK_ENTRY: string
declare const LEVELING_WINDOW_PRELOAD_WEBPACK_ENTRY: never

export class LevelingWindow {
	protected _Window: BrowserWindow

	private _CanClose = false
	private _PoeLog: PathOfExileLog
	private _LogLoaded: boolean

	private _GuideJson: IGuide
	private _RichTextJson: IRichText[]
	private _ActJson: IAppAct[]

	private _MyPlayer: IAppPlayer
	private _MyConn: plm_conn

	constructor(AppIcon: NativeImage) {
		this._MyPlayer = <IAppPlayer>{}
		this._MyConn = <plm_conn>{}

		this._GuideJson = loadJsonGuide()
		this._ActJson = loadJsonAct()
		this._RichTextJson = loadJsonRichText(this._ActJson)

		this._Window = new BrowserWindow({
			width: 1370,
			height: 1200,
			icon: AppIcon,
			title: "Leveling Guide",
			show: false,
			webPreferences: {
				nodeIntegration: false,
				contextIsolation: true,
				//worldSafeExecuteJavaScript: true,
				preload: LEVELING_WINDOW_PRELOAD_WEBPACK_ENTRY,
			},
		})
		this._Window.setMenu(null)
		this._Window.loadURL(LEVELING_WINDOW_WEBPACK_ENTRY)

		//if(process.env.NODE_ENV === 'dev') this._Window.webContents.openDevTools()
		if (!app.isPackaged) this._Window.webContents.openDevTools({ mode: "detach" })

		/************************
		 * Window Events
		 */
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
		ipcMain.handle("Init", (event: IpcMainInvokeEvent, ...arg) => {
			console.log("****** ipcMain handle Init: %o", arg)
					
			return [this._RichTextJson, this._GuideJson, this._ActJson, this._MyPlayer]
		})
		ipcMain.handle("richText", (event: IpcMainInvokeEvent, ...arg) => {
			console.log("******ipcMain handle richText: %o", arg)
			switch (arg[0] as string) {
				case "reload":
					this._RichTextJson = loadJsonRichText(this._ActJson)
					break
			}
			return this._RichTextJson
		})

		// ipcMain.handle("player", (event: IpcMainInvokeEvent, ...arg) => {
		// 	console.log("******ipcMain handle player: %o", arg)
		// 	return this._MyPlayer
		// })
		// ipcMain.handle("AllActs", (event: IpcMainInvokeEvent, ...arg) => {
		// 	console.log("******ipcMain handle player: %o", arg)
		// 	return this._ActJson
		// })

		ipcMain.handle("guide", (event: IpcMainInvokeEvent, ...arg) => {
			console.log("ipcMain handle guide: %o", arg)

			switch (arg[0] as string) {
				case "reload":
					console.log("reload")
					this._GuideJson = loadJsonGuide()
					break
			}
			event.returnValue = this._GuideJson
			return this._GuideJson
		})
	}

	/**********************************
	 * POE LOG
	 */
	setPoeLog(poeLog: PathOfExileLog): void {
		this._PoeLog = poeLog
		this._LogLoaded = false

		/**********************************
		 * Poe Log Events
		 */
		this._PoeLog.on("parsingComplete", () => {
			this._LogLoaded = true

			console.log("send parsing complete")

			this._Window.webContents.send("player", this._MyPlayer)
			this._Window.webContents.send("conn", this._MyConn)
		})

		this._PoeLog.on("login", (data) => {
			this._MyConn = data
			if (this._LogLoaded === true) this._Window.webContents.send("conn", this._MyConn)
		})

		this._PoeLog.on("level", (data) => {
			this._MyPlayer.name = data.name
			this._MyPlayer.characterClass = getCharacterClass(data.characterClass)
			this._MyPlayer.characterAscendancy = data.characterClass
			this._MyPlayer.level = data.level

			if (this._LogLoaded === true) {
				console.log("send player")
				this._Window.webContents.send("player", this._MyPlayer)
			}
		})

		this._PoeLog.on("area", (area) => {
			if (area.type === "area") {
				this._MyPlayer.currentZoneName = area.name
				this._MyPlayer.currentZoneAct = area.info[0].act

				if (this._LogLoaded === true) {
					console.log("send area")
					this._Window.webContents.send("playerArea", this._MyPlayer)
				}
			}
		})
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
}
