"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var react_1 = __importStar(require("react"));
var ReactDOM = __importStar(require("react-dom"));
require("./main_window.css");
var Player_1 = __importDefault(require("./components/Player"));
var LevelingGuide_1 = require("./components/LevelingGuide");
var Gears_1 = require("./components/Gears");
var Gem_1 = require("./components/Gem");
var utils_1 = require("../modules/utils");
function App(props) {
    console.log(props.AppData);
    var initialActs = props.AppData.InitialData.acts;
    // const initialClasses = props.AppData.InitialData.classes as IAppClasses[];
    var initialGems = props.AppData.InitialData.gems;
    var defaultGuide = props.AppData.DefaultGuide.gears;
    //console.log(props)
    var _a = (0, react_1.useState)(props.AppData.MyPlayer), curPlayer = _a[0], setcurPlayer = _a[1];
    var _b = (0, react_1.useState)(function () {
        return (0, utils_1.getCurAct)(initialActs, 1);
    }), curAct = _b[0], setcurAct = _b[1];
    var _c = (0, react_1.useState)(function () {
        return (0, utils_1.getCurZone)(curAct, "");
    }), curZone = _c[0], setcurZone = _c[1];
    var _d = (0, react_1.useState)(function () {
        return (0, utils_1.getZoneGear)(defaultGuide, 1, curZone.name);
    }), curGear = _d[0], setcurGear = _d[1];
    /*********************************
     * Events
     */
    function onActChange(e) {
        console.log("APP: onActChange");
        setcurAct((0, utils_1.getCurAct)(initialActs, Number(e.target.value)));
    }
    function onZoneChange(e) {
        console.log("APP: onActChange");
        setcurZone((0, utils_1.getCurZone)(curAct, e.target.value));
    }
    /**********************************
     * Effects
     */
    (0, react_1.useEffect)(function () {
        console.log("APP: useEffect(curActID)");
        console.log(curZone);
        console.log(curAct);
        setcurZone((0, utils_1.getCurZone)(curAct, ""));
        return function () {
            ("");
        };
    }, [curAct]);
    (0, react_1.useEffect)(function () {
        console.log("APP: useEffect(curZone)");
        setcurGear((0, utils_1.getZoneGear)(defaultGuide, curAct.actid, curZone.name));
        return function () {
            ("");
        };
    }, [curZone]);
    /**********************************
     * IPC
     */
    window.myAPI.receive("player", function (e, arg) {
        setcurPlayer(arg);
        console.log("receive player:");
        console.log(arg);
    });
    window.myAPI.receive("playerArea", function (e, arg) {
        console.log("received playerArea");
        console.log(arg);
        var _curAct = (0, utils_1.getCurAct)(initialActs, arg.currentZoneAct);
        setcurAct(_curAct);
        setcurZone((0, utils_1.getCurZone)(_curAct, arg.currentZoneName));
    });
    return (react_1["default"].createElement("div", { className: "p-4" },
        react_1["default"].createElement("div", { className: "flex flex-row flex-nowrap pb-0" },
            react_1["default"].createElement("div", { className: "flex-grow-0" },
                react_1["default"].createElement(Player_1["default"], { curPlayer: curPlayer }),
                react_1["default"].createElement("h1", null, curAct.act + " : " + curZone.name)),
            react_1["default"].createElement("div", { className: "flex-grow" },
                react_1["default"].createElement(LevelingGuide_1.LevelingGuide, { acts: initialActs, onActChange: onActChange, onZoneChange: onZoneChange, curAct: curAct, curZone: curZone, curPlayer: curPlayer }))),
        react_1["default"].createElement("div", { className: "grid grid-cols-6 gap-2" },
            react_1["default"].createElement("div", { className: "col-span-5" },
                react_1["default"].createElement(LevelingGuide_1.ZoneMap, { curZone: curZone, curAct: curAct })),
            react_1["default"].createElement("div", { className: "row-span-2" },
                react_1["default"].createElement(LevelingGuide_1.ZoneTips, null)),
            react_1["default"].createElement("div", { className: "col-span-3" },
                react_1["default"].createElement(LevelingGuide_1.ZoneNotes, { curZone: curZone, curAct: curAct })),
            react_1["default"].createElement("div", { className: "col-span-2" },
                react_1["default"].createElement(Gears_1.ZoneGears, { curGears: curGear })),
            react_1["default"].createElement("div", { className: "container col-span-3" },
                react_1["default"].createElement(Gem_1.ZoneGem, { initialGems: initialGems, curGears: curGear, curPlayer: curPlayer, curAct: curAct })),
            react_1["default"].createElement("div", { className: "container col-span-3" },
                react_1["default"].createElement("h2", null, "Progression du personnage")))));
}
window.myAPI.getInitData().then(function (result) {
    ReactDOM.render(react_1["default"].createElement(App, { AppData: result }), document.getElementById("root"));
});
//# sourceMappingURL=main_window.js.map