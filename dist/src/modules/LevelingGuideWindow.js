"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.create = void 0;
var electron_1 = require("electron");
var utils_1 = require("./utils");
var acts_json_1 = __importDefault(require("../../resources/data/acts.json"));
var classes_json_1 = __importDefault(require("../../resources/data/classes.json"));
var guide_json_1 = __importDefault(require("../../resources/data/guide.json"));
var gems_json_1 = __importDefault(require("../../resources/data/gems.json"));
function create(poeLog) {
    var InitialData = {
        acts: acts_json_1["default"],
        classes: classes_json_1["default"],
        gems: gems_json_1["default"]
    };
    // let LevelingGuideWindow: BrowserWindow;
    var LogLoaded = false;
    var MyConn = { latency: "na", server: "non connecté" };
    var MyPlayer = {
        name: "",
        level: 0,
        characterClass: "",
        characterAscendancy: "",
        currentZoneName: "",
        currentZoneAct: 1
    };
    var LevelingGuideWindow = new electron_1.BrowserWindow({
        width: 1080,
        height: 1200,
        icon: "resources/images/ExaltedOrb.png",
        title: "POE Interface",
        show: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            //worldSafeExecuteJavaScript: true,
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
        }
    });
    // and load the index.html of the app.
    LevelingGuideWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    // Open the DevTools.
    LevelingGuideWindow.webContents.openDevTools();
    electron_1.ipcMain.handle("app", function (event, arg) {
        //console.log('player : ' + arg)
        var response = { status: "bad request" };
        if (arg === "getInitData") {
            response = {
                MyPlayer: MyPlayer,
                MyConn: MyConn,
                InitialData: InitialData,
                DefaultGuide: guide_json_1["default"]
            };
            //console.log(POE_PLAYER)
        }
        return response;
    });
    poeLog.on("parsingComplete", function (data) {
        LogLoaded = true;
    });
    poeLog.on("login", function (data) {
        MyConn = data;
        //console.log("Logged in. Gateway: " + data.server + ", Latency: " + data.latency);
        if (LogLoaded === true)
            LevelingGuideWindow.webContents.send("conn", MyConn);
    });
    poeLog.on("level", function (data) {
        MyPlayer.name = data.name;
        MyPlayer.characterClass = (0, utils_1.getCharacterClass)(InitialData.classes, data.characterClass);
        MyPlayer.characterAscendancy = data.characterClass;
        MyPlayer.level = data.level;
        if (LogLoaded === true)
            LevelingGuideWindow.webContents.send("player", MyPlayer);
    });
    poeLog.on("area", function (area) {
        if (area.type === "area") {
            // console.log("plm onarea");
            // console.log(area);
            MyPlayer.currentZoneName = area.name;
            MyPlayer.currentZoneAct = area.info[0].act;
            if (LogLoaded === true)
                LevelingGuideWindow.webContents.send("playerArea", MyPlayer);
        }
    });
    return LevelingGuideWindow;
}
exports.create = create;
//# sourceMappingURL=LevelingGuideWindow.js.map