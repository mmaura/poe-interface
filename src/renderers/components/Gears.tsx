import React, { useState, useEffect } from "react";

export function ZoneGears(props: { curGears: IAppGear }): any {
  const curGears = props.curGears;

  console.log("in Gears")
  console.log(curGears)

  if (curGears.gears) {
    return (<>
      <div className="container flex flex-col min-h-200px">
        <h2>Gears</h2>
        <p>{curGears ? curGears.note : ""}</p>
        {
          curGears.gears.map((e)=>{
            return <Gear gears={e}/>
          })
        }
      </div>
      <div >

      </div>

    </>);
  } else {
    return (
      <div className="container flex flex-col min-h-200px">
        <h2>Gears</h2>
        <p>Pas de compétences configurées</p>
      </div>
    );
  }
}

function Gear(props: {gears : IGear[]}): any {
  const gears = props.gears

  return (
    <div className="">
     { gears.map((e)=>{
       return (
         e.color
       )
      })}
    </div>
  );
}
