"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.ConfigWindow = void 0;
var electron_1 = require("electron");
var electron_store_1 = __importDefault(require("electron-store"));
var fs_1 = __importDefault(require("fs"));
var schema = {
    poe_log_path: {
        type: "string",
        "default": "C:/Program Files (x86)/Grinding Gear Games/Path of Exile/logs/Client.txt"
    }
};
var AppStore = new electron_store_1["default"]({ schema: schema });
var ConfigWindow = /** @class */ (function (_super) {
    __extends(ConfigWindow, _super);
    //_AppStore : Store
    // schema = {
    //     poe_log_path: {
    //       type: "string",
    //       default:
    //         "C:/Program Files (x86)/Grinding Gear Games/Path of Exile/logs/Client.txt",
    //     },
    //   } as const;
    function ConfigWindow() {
        var _this = _super.call(this, {
            width: 1080,
            height: 1200,
            icon: "resources/images/ExaltedOrb.png",
            title: "Configuration",
            show: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                //worldSafeExecuteJavaScript: true,
                preload: CONFIG_WINDOW_PRELOAD_WEBPACK_ENTRY
            }
        }) || this;
        //AppStore = new Store({schema: schema});
        _this._poeLogPath = AppStore.get("poe_log_path", "");
        _this.loadURL(CONFIG_WINDOW_WEBPACK_ENTRY);
        _this.webContents.openDevTools();
        return _this;
    }
    ConfigWindow.prototype.getConfigValue = function (configValue) {
        return AppStore.get(configValue);
    };
    ConfigWindow.prototype.getConfigValueDefault = function (configValue, defaultValue) {
        return AppStore.get(configValue, defaultValue);
    };
    ConfigWindow.prototype.getPoeLogPath = function () {
        if (fs_1["default"].existsSync(this._poeLogPath)) {
            return this._poeLogPath;
        }
        return "";
    };
    return ConfigWindow;
}(electron_1.BrowserWindow));
exports.ConfigWindow = ConfigWindow;
//# sourceMappingURL=ConfigWindow.js.map