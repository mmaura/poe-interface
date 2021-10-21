import React, { useState, useEffect, useContext, useCallback } from "react";

import ReactTooltip from "react-tooltip";

import { findGem } from "../../modules/functions";

import { ActContext, PlayerContext } from "../window";

export function ZoneGem(props: { curGears: IGuideGear }): JSX.Element {
  if (props.curGears != undefined) {
    if (props.curGears.gems2buy != undefined) {
      return (
        <div>
          <h2>Liste des courses</h2>
          {props.curGears.gems2buy.map((gemName, index) => {
            const _gem = findGem(gemName);
            return <LongGem key={_gem.name + index} gem={_gem} />;
          })}
        </div>
      );
    }
  }
  return <h2>Liste des courses vide</h2>;
}

export function LongGem(props: { gem: IGems }): JSX.Element {
  const curGem = props.gem;

  const curPlayer = useContext(PlayerContext) as IAppPlayer;
  const curAct = useContext(ActContext) as IAppAct;

  const curBuy = curGem.buy.filter((e) => {
    return (
      e.available_to.includes(curPlayer.characterClass) &&
      e.act === curAct.actid
    );
  });

  if (curGem) {
    return (
      <div className="grid grid-cols-12 gap-1 items-center">
        <div className="col-span-4 flex flex-row">
          <Gem curGem={curGem} />
          <span>{curGem.name}</span>
        </div>
        <div className="col-span-8 flex flex-col">
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
              <span> not available for your class at this act, </span>
              <span className="text-poe-60">Ask a friend.</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  return <div></div>;
}

export function Gem(props: { curGem: IGems }): JSX.Element {
  const curGem = props.curGem;
  const gemClick = useCallback(
    (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
      e.preventDefault();
      window.levelingAPI.openExternal(
        "https://www.poewiki.net/wiki/" + curGem.name
      );
    },
    []
  );

  useEffect(() => {
    ReactTooltip.rebuild();
  }, [curGem]);

  return (
    <div
      data-for={`gem` + curGem.name}
      data-tip={`gem` + curGem.name}
      data-effect="solid"
      data-place="left"
      data-delay-hide="10000"
    >
      <img
        onClick={gemClick}
        className="w-socket h-socket"
        src={"../assets/images/gems/" + curGem.name + ".png"}
      />
      <ReactTooltip id={`gem` + curGem.name} clickable>
        <h2>{curGem.name}</h2>

        {curGem.buy.map((_buy, index) => {
          return (
            <div className="grid grid-cols-3 gap-2 w-auto">
              <p key={index}>
                <span className="text-poe-3">Act: {_buy.act}&nbsp;</span>
                <span className="text-poe-3">{_buy.town}&nbsp;</span>
                <span
                  className="text-poe-50"
                  onClick={() => {
                    window.levelingAPI.openWiki(_buy.npc);
                  }}
                >
                  {_buy.npc}
                </span>
              </p>
              <span
                className="text-poe-60"
                onClick={() => {
                  window.levelingAPI.openWiki(_buy.quest_name);
                }}
              >
                {_buy.quest_name}
              </span>
              <span className="text-poe-50">{_buy.available_to}</span>
              <br />
            </div>
          );
        })}
      </ReactTooltip>
    </div>
  );
}
