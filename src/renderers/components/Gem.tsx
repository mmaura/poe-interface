import React, { useState, useEffect } from "react";

export function Gem( props: { curGem : IAppGems, curPlayer: IAppPlayer}){

    const curGem = props.curGem
    const curPlayer = props.curPlayer

    console.log(curGem)

    return (
        <div>
            <p><img src={ curGem.iconPath } />{curGem.name}{
            curGem.buy.find((e)=>{
                e.available_to.includes(curPlayer.characterClass)
            })
            }</p>
        </div>
    )
}