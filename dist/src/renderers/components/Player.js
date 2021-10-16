"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var react_1 = __importDefault(require("react"));
function Player(props) {
    console.log("inPlayer");
    console.log(props);
    var player = props.curPlayer;
    return (react_1["default"].createElement("div", { className: "inventory" }, player ? (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("div", { className: "absolute" },
            react_1["default"].createElement("div", { className: "" + player.characterClass.toLowerCase() }),
            react_1["default"].createElement("div", { className: "inventory-text top-inventory-line1" }, player.name),
            react_1["default"].createElement("div", { className: "inventory-text top-inventory-line2" },
                "Level ",
                player.level,
                " ",
                player.characterClass)))) : (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("p", null, "En attente de connection")))));
}
exports["default"] = Player;
//# sourceMappingURL=Player.js.map