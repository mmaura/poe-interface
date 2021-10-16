"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.ZoneGears = void 0;
var react_1 = __importDefault(require("react"));
function ZoneGears(props) {
    var curGears = props.curGears;
    console.log("in Gears");
    console.log(curGears);
    if (props.curGears != undefined) {
        return (react_1["default"].createElement("div", { className: "container flex flex-col min-h-200px" },
            react_1["default"].createElement("h2", null, "Gears"),
            react_1["default"].createElement("p", null, curGears.note ? curGears.note : "&nbsp;"),
            react_1["default"].createElement("div", { className: "flex flex-row flex-wrap gap-2 items-start" }, curGears.gears.map(function (e, index) {
                return react_1["default"].createElement(Gear, { key: index, gears: e });
            }))));
    }
    else {
        return (react_1["default"].createElement("div", { className: "container flex flex-col min-h-200px" },
            react_1["default"].createElement("h2", null, "Gears"),
            react_1["default"].createElement("p", null, "Pas de comp\u00E9tences configur\u00E9es")));
    }
}
exports.ZoneGears = ZoneGears;
function Gear(props) {
    var gears = props.gears;
    return (react_1["default"].createElement("div", { className: "" + (gears.length == 3 ? "poe-item-3slots" : "poe-item-xslots") }, gears.map(function (e, index) {
        if (e.type === "socket")
            return react_1["default"].createElement("div", { className: "poe-" + e.color + "-socket", key: index });
        // else
        // return <Gem curGem={findGem(e.gem)}/>
    })));
}
//# sourceMappingURL=Gears.js.map