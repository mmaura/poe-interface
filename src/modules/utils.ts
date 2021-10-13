export function findCurAct(acts: IAppAct[], actid: number): IAppAct {
  console.log("APP: FindCurAct actData:");
  //console.log(actsData)
  const _curAtct = acts.find((e) => {
    return e.actid === actid;
  });
  console.log(_curAtct);
  return _curAtct;
}

//   function findCurZoneActID(actid: number, zoneid: string){
//     console.log("APP: findCurZoneActID\n in act:")
//     const _curAct = findCurAct(actid)

//     const curzone = _curAct.zones.find((e) => {
//         //console.log("find curzone : "+e.level+"-"+e.name+"==="+zoneid)
//         return ((e.level+"-"+e.name) === zoneid)
//         })

//     if ( curzone === undefined) {
//       setcurZoneID(_curAct.zones[0].level+"-"+_curAct.zones[0].name)
//       // console.log("not found, return:")
//       console.log(_curAct.zones[0])
//       return _curAct.zones[0]
//     }
//     else{
//       console.log(curzone)
//       return curzone
//     }
// }

export function findCurZone(act: IAppAct, zoneid: string): IAppZone {
  console.log("APP: findCurZoneAct\n in act:");

  let curzone;

  console.log(act);
  if (zoneid !== "") {
    curzone = act.zones.find((e) => {
      console.log("find curzone : " + e.name + "===" + zoneid);
      return e.name === zoneid;
    });
  }

  if (curzone === undefined) {
    console.log("not found, return:");
    console.log(act.zones[0]);
    return act.zones[0];
  } else {
    console.log(curzone);
    return curzone;
  }
}

export function findZoneGear(
  gearsData: IAppGear[],
  actid: number,
  zonename: string
): IAppGear {
  console.log("findZoneGear")
  return gearsData.find((e) => {
    //return (e.actid === actid && e.zonename.includes(zonename))
    return e.zones.find((e) => {
      return ( e.actid === actid && e.zonename === zonename) 
    })
  });
}

export function findGem(gemsData: IAppGems[], name: string): IAppGems {
  return gemsData.find((e) => {
    return e.name === name;
  });
}
