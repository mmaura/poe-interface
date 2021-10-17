import InitialAct from "../../assets/data/acts.json";
import InitialClasses from "../../assets/data/classes.json";
import DefaultGuide from "../../assets/data/guide.json";
import InitialGems from "../../assets/data/gems.json";

export function getCharacterClass(
  // DefaultClassData: IAppClasses[],
  characterClass: string
): string {
  const _character = InitialClasses.find((e) => {
    if (e.classe === characterClass || e.ascendancy.includes(characterClass))
      // console.log("e.classe = " + e.classe)
      // console.log("e.ascen.. = " + e.ascendancy.includes(characterClass))
      // console.log("characterClass = " + characterClass)
      return true;
  });
  return _character.classe;
}

// export function getCharacterAscendancy(characterClass: string): string { // DefaultClassData: IAppClasses[],
//   const _character = InitialClasses.find((e) => {
//     if (e.ascendancy.includes(characterClass))
//       // console.log("e.classe = " + e.classe)
//       // console.log("e.ascen.. = " + e.ascendancy.includes(characterClass))
//       // console.log("characterClass = " + characterClass)
//       return true;
//   });

//   if (_character !== null) return undefined;
//   else return _character.ascendancy;
// }

export function findGem(
  // gemsData: IAppGems[],
  name: string
): IGems {
  // console.log("Find Gem");
  // console.log(name);

  return InitialGems.find((e) => {
    return e.name === name;
  });
}

export function getZoneGear(
  //gearsData: IAppGear[],
  actid: number,
  zonename: string
): IGuideGear {
  // console.log("findZoneGear");
  return DefaultGuide.gears.find((e) => {
    return e.zones.find((e) => {
      return e.actid === actid && e.zonename === zonename;
    });
  });
}

export function getCurZone(
  ///curAct: IAppAct,
  actID: number,
  zoneID: string
): IAppZone {
  // console.log("APP: findCurZoneAct\n in act:");

  const curAct = getCurAct(actID);
  let curZone;

  // console.log(act);
  if (zoneID !== "") {
    curZone = curAct.zones.find((e) => {
      // console.log("find curzone : " + e.name + "===" + zoneid);
      return e.name === zoneID;
    });
  }

  if (curZone === undefined) {
    // console.log("not found, return:");
    // console.log(act.zones[0]);
    return curAct.zones[0];
  } else {
    // console.log(curzone);
    return curZone;
  }
}

export function getCurAct(
  //acts: IAppAct[],
  actid: number
): IAppAct {
  // console.log("APP: FindCurAct actData:");
  //console.log(actsData)
  const _curAtct = InitialAct.find((e) => {
    return e.actid === actid;
  });
  // console.log(_curAtct);
  return _curAtct;
}

export function GetAllActs(): IActs[] {
  return InitialAct;
}
