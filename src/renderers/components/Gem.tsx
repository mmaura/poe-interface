import React, { useState, useEffect } from "react";

export function Gem( props: { curGem : IAppGems}){

    const curGem = props.curGem
    console.log(curGem)

    return (
        <div>
            <img src={ curGem.iconPath } />
        </div>
    )
}