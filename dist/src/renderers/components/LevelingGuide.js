"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.LevelTips = exports.ZoneTips = exports.ZoneMap = exports.ZoneNotes = exports.LevelingGuide = void 0;
var react_1 = __importDefault(require("react"));
var react_tooltip_1 = __importDefault(require("react-tooltip"));
function LevelingGuide(props) {
    var initActs = props.acts;
    var curZone = props.curZone;
    var curAct = props.curAct;
    var curPlayer = props.curPlayer;
    function handleActChange(e) {
        // console.log("onchange act")
        // setcurActID(Number(e.target.value));
        props.onActChange(e);
    }
    function handleZoneChange(e) {
        //setcurZoneID(e.target.value);
        props.onZoneChange(e);
    }
    return (react_1["default"].createElement("div", { className: "container" },
        react_1["default"].createElement("div", { className: "flex flex-row flex-nowrap px-5 py-2 space-x-2" },
            react_1["default"].createElement("select", { className: "lvlg-map-feature min-w-min", value: curAct.actid, onChange: handleActChange }, initActs.map(function (act) {
                return (react_1["default"].createElement("option", { key: act.actid, value: act.actid }, act.act));
            })),
            react_1["default"].createElement("select", { className: "lvlg-map-feature flex-grow", value: curZone.name, onChange: handleZoneChange }, curAct.zones.map(function (zone) {
                return (react_1["default"].createElement("option", { key: zone.level + "-" + zone.name, value: zone.name }, zone.name));
            })),
            react_1["default"].createElement("div", { className: "lvlg-map-feature enabled text-center align-middle text-4xl  font-bold \n                " + (curZone.level - curPlayer.level > 2
                    ? "text-yellow-500 border-yellow-500"
                    : "") + "\n                " + (curZone.level - curPlayer.level > 4
                    ? "text-red-500 border-red-500"
                    : "") + "\n                " + (curPlayer.level - curZone.level > 5 ? "disabled" : "") + "\n            " }, curZone.level),
            react_1["default"].createElement("div", { className: "lvlg-map-feature " + (curZone.hasRecipe ? "enabled" : "disabled") },
                " ",
                react_1["default"].createElement("img", { className: "w-full h-full", src: "resources/images/waypoint.png" }),
                " "),
            react_1["default"].createElement("div", { className: "lvlg-map-feature " + (curZone.hastrial ? "enabled" : "disabled") },
                " ",
                react_1["default"].createElement("img", { className: "w-full h-full", src: "resources/images/portal.png" }),
                " "),
            react_1["default"].createElement("div", { className: "lvlg-map-feature " + (curZone.hastrial ? "enabled" : "disabled") },
                " ",
                react_1["default"].createElement("img", { className: "w-full h-full", src: "resources/images/Offering_to_the_Goddess.png" }),
                " "),
            react_1["default"].createElement("div", { className: "lvlg-map-feature " + (curZone.haspassive ? "enabled" : "disabled") },
                " ",
                react_1["default"].createElement("img", { className: "w-full h-full", src: "resources/images/Book_of_Skill.png" }),
                " "))));
}
exports.LevelingGuide = LevelingGuide;
function ZoneNotes(props) {
    var curZone = props.curZone;
    var curAct = props.curAct;
    return (react_1["default"].createElement("div", { className: "container flex flex-col min-h-200px" },
        react_1["default"].createElement("h2", null, "Notes"),
        react_1["default"].createElement("p", null, curZone.note)));
}
exports.ZoneNotes = ZoneNotes;
function ZoneMap(props) {
    var curZone = props.curZone;
    var curAct = props.curAct;
    if (curZone.image[0] !== "none" && curZone.image.length > 0) {
        return (react_1["default"].createElement("div", { className: "container flex flex-col min-h-200px" },
            react_1["default"].createElement("div", { className: "" },
                react_1["default"].createElement("h2", null, "Navigation")),
            react_1["default"].createElement("div", { className: "flex flex-row flex-wrap" }, curZone.image.map(function (val) {
                var path = "resources/images/zones/" + curAct.act + "/" + val + ".png";
                return react_1["default"].createElement("img", { key: path, className: "", src: path });
            })),
            react_1["default"].createElement("div", { className: "" },
                react_1["default"].createElement("span", null, curZone.altimage !== "none" ? curZone.altimage : ""))));
    }
    else
        return (react_1["default"].createElement("div", { className: "container flex flex-col min-h-200px" },
            react_1["default"].createElement("div", { className: "" },
                react_1["default"].createElement("h2", null, "Navigation")),
            react_1["default"].createElement("div", { className: "" },
                react_1["default"].createElement("span", null, curZone.altimage !== "none" ? curZone.altimage : ""))));
}
exports.ZoneMap = ZoneMap;
function ZoneTips() {
    return (react_1["default"].createElement("div", { className: "flex flex-col" },
        react_1["default"].createElement("button", { id: "ZoneTips", className: "bg-poe-96 border-poe-4 p-2 shadow-xl rounded-lg h-10 overflow-hidden", "data-tip": "hello world", "data-effect": "solid", "data-place": "left" }, "Afficher les astuces"),
        react_1["default"].createElement(react_tooltip_1["default"], { "data-tip": "", "data-for": "zoneTips" },
            react_1["default"].createElement("h2", null, "Tips"),
            react_1["default"].createElement("ul", { className: "tips text-sm mt-2" },
                react_1["default"].createElement("li", null, "Logging out to the Character Selection screen and back in is a great way to go back to town for free (risky for the first hour of the league)"),
                react_1["default"].createElement("li", null, "You don't need to talk to NPCs to get quests"),
                react_1["default"].createElement("li", null, "One Man tag: Hit boss with everyone not in instance, port in, easy 1 man boss"),
                react_1["default"].createElement("li", null, "Flesh and stone blinds mobs"),
                react_1["default"].createElement("li", null, "Skitter bots slow mobs and shock(15%damage)"),
                react_1["default"].createElement("li", null, "Leaving Izaro lieutenants alive gives you more keys at the end"),
                react_1["default"].createElement("li", null, "At levl 50 and over, do all vaal side areas for 6-links, you can change colors in crafting bench"),
                react_1["default"].createElement("li", null, "Don't obsess over every drop, prioritize sockets and links"),
                react_1["default"].createElement("li", null, "7 vaal gems + sacrifice fragment = Vaal orb, with Vaal Orbs you can vaal your skills"),
                react_1["default"].createElement("li", null, "Molten shell is a very good skill to vaal for Hardcore"),
                react_1["default"].createElement("li", null, "Essences are good for easy leveling crafting"),
                react_1["default"].createElement("li", null, "Sell to the vendor a Rustic Sash (magic or rare) + Blacksmith Whetstone + weapon = Magic same weapon type with (40 to 64%) Increased Physical Damage"),
                react_1["default"].createElement("li", null, "Sell to the vendor a Chain Belt (magix or rare) + Blacksmith Whetstone + Dagger/Sceptre/Staff/Wand = Magic same weapon with (10 to 29%) Increased Spell Damage"),
                react_1["default"].createElement("li", null, "Sell to a vendor Magic Sceptre/Wand/Rune Dagger + Ruby Ring(for Fire Damage) or Topaz Ring(for Lightning Damage) or Sapphire Ring(for Cold Damage) + Orb of Alteration = Weapon with with added x to x Lightning/Fire/Cold Damage to Spells"),
                react_1["default"].createElement("li", null, "Sell to a vendor White Boots + Any rarity Quicksilver Flask + Orb of Augmentation = Magic Boots with 10% increased Movement Speed"),
                react_1["default"].createElement("li", null, "Sell to a vendor Magic or Rare Boots with +X% Movement Speed + Any rarity Quicksilver Flask + Orb of Augmentation = Magic Boots with (original value)+5% increased Movement Speed")))));
}
exports.ZoneTips = ZoneTips;
function LevelTips(props) {
    //const [levelTips, setlevelTips] = useState(  )
    return react_1["default"].createElement("div", null, "choses a faire en fonction du level");
}
exports.LevelTips = LevelTips;
//# sourceMappingURL=LevelingGuide.js.map