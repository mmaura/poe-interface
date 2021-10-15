import React, { useState, useEffect, MouseEventHandler } from "react";
import { findGem } from "../../modules/utils";
//import { findGem } from "../modules/utils";

export function ZoneGem(props: {
  initialGems: IAppGems[];
  curGears: IAppGear;
  curPlayer: IAppPlayer;
  curAct: IAppAct;
}): JSX.Element {
  const initialGems = props.initialGems;
  //const curGems = props.s;
  const curPlayer = props.curPlayer;
  const curAct = props.curAct;

  console.log("ZoneGem");
  //console.log(props.curGears.gems2buy);
  if (props.curGears != undefined) {
    if (props.curGears.gems2buy != undefined) {
      return (
        <div>
          <h2>Liste des courses</h2>
          {props.curGears.gems2buy.map((e) => {
            const _gem = findGem(initialGems, e);
            return (
              <Gem
                initialGem={initialGems}
                curPlayer={curPlayer}
                curAct={curAct}
                gem={_gem}
              />
            );
          })}
        </div>
      );
    }
  }
  return <h2>Liste des courses vide</h2>;
}

export function Gem(props: {
  initialGem: IAppGems[];
  curPlayer: IAppPlayer;
  curAct: IAppAct;
  gem: IAppGems;
}): JSX.Element {
  const curGem = props.gem;
  const curPlayer = props.curPlayer;
  const curAct = props.curAct;

  /**   if no character selected or if allclasses checked
   *    then show for all classes
   */
  //       if (curPlayer.characterClass === "")

  const [showAllActs, setshowAllActs] = useState(false);
  const [showAllClasses, setshowAllClasses] = useState(false);

  const curBuy = curGem.buy.filter((e) => {
    return (
      (e.available_to.includes(curPlayer.characterClass) || showAllClasses) &&
      (e.act === curAct.actid || showAllActs)
    );
  });

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

  if (curGem) {
    return (
      <div className="grid grid-cols-10 gap-2 items-center">
        <img
          className="w-socket h-socket"
          src={"resources/images/gems/" + curGem.name + ".png"}
        />
        <a
          className="col-span-3"
          href="#"
          onClick={(e) => {
            gemClick(e, curGem.name);
          }}
        >
          {curGem.name}
        </a>
        <div className="col-span-6 flex flex-col">
          {curBuy.length > 1 ? (
            curBuy.map((_buy, index) => {
              return (
                <p key={index}>
                  <span className="text-poe-3">{_buy.npc}</span>&nbsp;
                  <span className="text-poe-50">{_buy.quest_name}</span>&nbsp;
                  <span className="text-poe-3">{_buy.town}</span>
                  <span className="text-poe-50">Classes: {_buy.available_to}</span>&nbsp;
                  <span className="text-poe-50">Act: {_buy.act}</span>&nbsp;
                </p>
              );
            })
          ) : (
            <p>
              <span> Not aiviable for your class at this act, </span>
              <span className="text-poe-50">Ask a friend.</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  return <div></div>;
}
