import React, { useState, useEffect, MouseEventHandler } from "react";

export function Gem(props: {
  curGem: IAppGems;
  curPlayer: IAppPlayer;
  curAct: IAppAct;
}): JSX.Element {
  const curGem = props.curGem;
  const curPlayer = props.curPlayer;
  const curAct = props.curAct;

  const curBuy = curGem.buy.filter((e) => {
    return e.available_to.includes(curPlayer.characterClass);
  });

  const [showAllActs, setshowAllActs] = useState(false);

  console.log("*** In Gem ***");
  console.log(curGem);
  console.log(curPlayer.characterClass);
  console.log(curBuy);

  function gemClick(
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    gemName: string
  ) {
    e.preventDefault();
    window.myAPI.openExternal("https://www.poewiki.net/wiki/" + gemName);
  }

  if (curBuy) {
    return (
      <div>
        <div className="flex flex-row gap-2 items-center">
          <img
            className="w-socket h-socket"
            src={"resources/images/gems/" + curGem.name + ".png"}
          />
          <a
            href="#"
            onClick={(e) => {
              gemClick(e, curGem.name);
            }}
          >
            {curGem.name}
          </a>
          <div className="flex flex-col">
            {curBuy.map((_buy, index) => {
              if (_buy.act === curAct.actid || showAllActs)
                return (
                  <p key={index}>
                    <span className="text-poe-3">{_buy.npc}</span>&nbsp;
                    <span className="text-poe-50">{_buy.quest_name}</span>&nbsp;
                    <span className="text-poe-3">{_buy.town}</span>
                  </p>
                );
            })}
          </div>
        </div>
      </div>
    );
  }

  return <div></div>;
}
