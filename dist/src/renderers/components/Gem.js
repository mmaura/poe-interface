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
exports.__esModule = true;
exports.Gem = exports.ZoneGem = void 0;
var react_1 = __importStar(require("react"));
var utils_1 = require("../../modules/utils");
//import { findGem } from "../modules/utils";
function ZoneGem(props) {
    var initialGems = props.initialGems;
    //const curGems = props.s;
    var curPlayer = props.curPlayer;
    var curAct = props.curAct;
    console.log("ZoneGem");
    //console.log(props.curGears.gems2buy);
    if (props.curGears != undefined) {
        if (props.curGears.gems2buy != undefined) {
            return (react_1["default"].createElement("div", null,
                react_1["default"].createElement("h2", null, "Liste des courses"),
                props.curGears.gems2buy.map(function (e) {
                    var _gem = (0, utils_1.findGem)(initialGems, e);
                    return (react_1["default"].createElement(Gem, { initialGem: initialGems, curPlayer: curPlayer, curAct: curAct, gem: _gem }));
                })));
        }
    }
    return react_1["default"].createElement("h2", null, "Liste des courses vide");
}
exports.ZoneGem = ZoneGem;
function Gem(props) {
    var curGem = props.gem;
    var curPlayer = props.curPlayer;
    var curAct = props.curAct;
    /**   if no character selected or if allclasses checked
     *    then show for all classes
     */
    //       if (curPlayer.characterClass === "")
    var _a = (0, react_1.useState)(false), showAllActs = _a[0], setshowAllActs = _a[1];
    var _b = (0, react_1.useState)(false), showAllClasses = _b[0], setshowAllClasses = _b[1];
    var curBuy = curGem.buy.filter(function (e) {
        return ((e.available_to.includes(curPlayer.characterClass) || showAllClasses) &&
            (e.act === curAct.actid || showAllActs));
    });
    console.log("*** In Gem ***");
    console.log(curGem);
    console.log(curPlayer.characterClass);
    console.log(curBuy);
    function gemClick(e, gemName) {
        e.preventDefault();
        window.myAPI.openExternal("https://www.poewiki.net/wiki/" + gemName);
    }
    if (curGem) {
        return (react_1["default"].createElement("div", { className: "grid grid-cols-10 gap-2 items-center" },
            react_1["default"].createElement("img", { className: "w-socket h-socket", src: "resources/images/gems/" + curGem.name + ".png" }),
            react_1["default"].createElement("a", { className: "col-span-3", href: "#", onClick: function (e) {
                    gemClick(e, curGem.name);
                } }, curGem.name),
            react_1["default"].createElement("div", { className: "col-span-6 flex flex-col" }, curBuy.length > 1 ? (curBuy.map(function (_buy, index) {
                return (react_1["default"].createElement("p", { key: index },
                    react_1["default"].createElement("span", { className: "text-poe-3" }, _buy.npc),
                    "\u00A0",
                    react_1["default"].createElement("span", { className: "text-poe-50" }, _buy.quest_name),
                    "\u00A0",
                    react_1["default"].createElement("span", { className: "text-poe-3" }, _buy.town),
                    react_1["default"].createElement("span", { className: "text-poe-50" },
                        "Classes: ",
                        _buy.available_to),
                    "\u00A0",
                    react_1["default"].createElement("span", { className: "text-poe-50" },
                        "Act: ",
                        _buy.act),
                    "\u00A0"));
            })) : (react_1["default"].createElement("p", null,
                react_1["default"].createElement("span", null, " Not aiviable for your class at this act, "),
                react_1["default"].createElement("span", { className: "text-poe-50" }, "Ask a friend."))))));
    }
    return react_1["default"].createElement("div", null);
}
exports.Gem = Gem;
//# sourceMappingURL=Gem.js.map