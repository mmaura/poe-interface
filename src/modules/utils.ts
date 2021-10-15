export function getCurAct(acts: IAppAct[], actid: number): IAppAct {
  // console.log("APP: FindCurAct actData:");
  //console.log(actsData)
  const _curAtct = acts.find((e) => {
    return e.actid === actid;
  });
  // console.log(_curAtct);
  return _curAtct;
}

export function getCurZone(act: IAppAct, zoneid: string): IAppZone {
  // console.log("APP: findCurZoneAct\n in act:");

  let curzone;

  // console.log(act);
  if (zoneid !== "") {
    curzone = act.zones.find((e) => {
      console.log("find curzone : " + e.name + "===" + zoneid);
      return e.name === zoneid;
    });
  }

  if (curzone === undefined) {
    // console.log("not found, return:");
    // console.log(act.zones[0]);
    return act.zones[0];
  } else {
    // console.log(curzone);
    return curzone;
  }
}

export function getZoneGear(
  gearsData: IAppGear[],
  actid: number,
  zonename: string
): IAppGear {
  // console.log("findZoneGear");
  return gearsData.find((e) => {
    return e.zones.find((e) => {
      return e.actid === actid && e.zonename === zonename;
    });
  });
}

export function findGem(gemsData: IAppGems[], name: string): IAppGems {
  console.log("Find Gem");
  console.log(name);
  return gemsData.find((e) => {
    return e.name === name;
  });
}

export function getCharacterClass(
  DefaultClassData: IAppClasses[],
  characterClass: string
): string {
  const _character = DefaultClassData.find((e) => {
    if (e.classe === characterClass || e.ascendancy.includes(characterClass))
    console.log("e.classe = " + e.classe)
    console.log("e.ascen.. = " + e.ascendancy.includes(characterClass))
    console.log("characterClass = " + characterClass)
      return true;
  });
  return _character.classe;
}
