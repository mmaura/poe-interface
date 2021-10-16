"use strict";
exports.__esModule = true;
exports.getCharacterClass = exports.findGem = exports.getZoneGear = exports.getCurZone = exports.getCurAct = void 0;
function getCurAct(acts, actid) {
    // console.log("APP: FindCurAct actData:");
    //console.log(actsData)
    var _curAtct = acts.find(function (e) {
        return e.actid === actid;
    });
    // console.log(_curAtct);
    return _curAtct;
}
exports.getCurAct = getCurAct;
function getCurZone(act, zoneid) {
    // console.log("APP: findCurZoneAct\n in act:");
    var curzone;
    // console.log(act);
    if (zoneid !== "") {
        curzone = act.zones.find(function (e) {
            console.log("find curzone : " + e.name + "===" + zoneid);
            return e.name === zoneid;
        });
    }
    if (curzone === undefined) {
        // console.log("not found, return:");
        // console.log(act.zones[0]);
        return act.zones[0];
    }
    else {
        // console.log(curzone);
        return curzone;
    }
}
exports.getCurZone = getCurZone;
function getZoneGear(gearsData, actid, zonename) {
    // console.log("findZoneGear");
    return gearsData.find(function (e) {
        return e.zones.find(function (e) {
            return e.actid === actid && e.zonename === zonename;
        });
    });
}
exports.getZoneGear = getZoneGear;
function findGem(gemsData, name) {
    console.log("Find Gem");
    console.log(name);
    return gemsData.find(function (e) {
        return e.name === name;
    });
}
exports.findGem = findGem;
function getCharacterClass(DefaultClassData, characterClass) {
    var _character = DefaultClassData.find(function (e) {
        if (e.classe === characterClass || e.ascendancy.includes(characterClass))
            console.log("e.classe = " + e.classe);
        console.log("e.ascen.. = " + e.ascendancy.includes(characterClass));
        console.log("characterClass = " + characterClass);
        return true;
    });
    return _character.classe;
}
exports.getCharacterClass = getCharacterClass;
//# sourceMappingURL=utils.js.map