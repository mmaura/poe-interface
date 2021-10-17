import React, { useState, useEffect, MouseEventHandler } from "react";
import { findGem } from "../../modules/functions";
//import { findGem } from "../modules/utils";

export function ZoneGem(props: {
  curGears: IGuideGear;
  curPlayer: IAppPlayer;
  curAct: IActs;
}): JSX.Element {
  const curPlayer = props.curPlayer;
  const curAct = props.curAct;

  if (props.curGears != undefined) {
    if (props.curGears.gems2buy != undefined) {
      return (
        <div>
          <h2>Liste des courses</h2>
          {props.curGears.gems2buy.map((gemName, index) => {
            const _gem = findGem(gemName);
            return (
              <Gem
                key={_gem.name + index}
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
  curPlayer: IAppPlayer;
  curAct: IActs;
  gem: IGems;
}): JSX.Element {
  const curGem = props.gem;
  const curPlayer = props.curPlayer;
  const curAct = props.curAct;

  const [showAllActs, setshowAllActs] = useState(false);
  const [showAllClasses, setshowAllClasses] = useState(false);

  const curBuy = curGem.buy.filter((e) => {
    return (
      (e.available_to.includes(curPlayer.characterClass) || showAllClasses) &&
      (e.act === curAct.actid || showAllActs)
    );
  });

  function gemClick(
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    gemName: string
  ) {
    e.preventDefault();
    window.levelingAPI.openExternal("https://www.poewiki.net/wiki/" + gemName);
  }

  if (curGem) {
    return (
      <div className="grid grid-cols-12 gap-1 items-center">
        <div className="col-span-5 flex flex-row">
          <img
            className="w-socket h-socket"
            src={"../assets/images/gems/" + curGem.name + ".png"}
          />
          <a
            className=""
            href="#"
            onClick={(e) => {
              gemClick(e, curGem.name);
            }}
          >
            {curGem.name}
          </a>
        </div>
        <div className="col-span-7 flex flex-col">
          {curBuy.length > 1 ? (
            curBuy.map((_buy, index) => {
              return (
                <p key={index}>
                  <span className="text-poe-3">{_buy.npc}</span>&nbsp;
                  <span className="text-poe-50">{_buy.quest_name}</span>&nbsp;
                  <span className="text-poe-3">{_buy.town}</span>
                  <span className="text-poe-50">
                    Classes: {_buy.available_to}
                  </span>
                  &nbsp;
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
