import React, { useState, useEffect } from "react";
import ReactTooltip from "react-tooltip";

export function LevelingGuide(props: any): any {
  const initActs: IAppAct[] = props.acts;
  const curZone: IAppZone = props.curZone;
  const curAct: IAppAct = props.curAct;
  const curPlayer = props.curPlayer as IAppPlayer;

  function handleActChange(e: React.ChangeEvent<HTMLSelectElement>) {
    // console.log("onchange act")
    // setcurActID(Number(e.target.value));
    props.onActChange(e);
  }

  function handleZoneChange(e: React.ChangeEvent<HTMLSelectElement>) {
    //setcurZoneID(e.target.value);
    props.onZoneChange(e);
  }

  return (
    <div className="container">
      <div className="flex flex-row flex-nowrap px-5 py-2 space-x-2">
        {/* <div className="h-10 w-10 shadow-lg rounded-md border-2 p-1"> - </div>
            <div className="h-10 w-10 shadow-lg rounded-md border-2 p-1"> + </div> */}

        {/* <label> Acte </label> */}
        <select
          className="lvlg-map-feature min-w-min"
          value={curAct.actid}
          onChange={handleActChange}
        >
          {initActs.map(function (act: IAppAct) {
            return (
              <option key={act.actid} value={act.actid}>
                {act.act}
              </option>
            );
          })}
        </select>

        {/* <label> Zone</label> */}
        <select
          className="lvlg-map-feature flex-grow"
          value={curZone.name}
          onChange={handleZoneChange}
        >
          {curAct.zones.map(function (zone: IAppZone) {
            return (
              <option key={zone.level + "-" + zone.name} value={zone.name}>
                {zone.name}
              </option>
            );
          })}
        </select>

        <div
          className={`lvlg-map-feature enabled text-center align-middle text-4xl  font-bold 
                ${
                  curZone.level - curPlayer.level > 2
                    ? "text-yellow-500 border-yellow-500"
                    : ""
                }
                ${
                  curZone.level - curPlayer.level > 4
                    ? "text-red-500 border-red-500"
                    : ""
                }
                ${curPlayer.level - curZone.level > 5 ? "disabled" : ""}
            `}
        >
          {curZone.level}
        </div>
        <div
          className={`lvlg-map-feature ${
            curZone.hasRecipe ? "enabled" : "disabled"
          }`}
        >
          {" "}
          <img
            className="w-full h-full"
            src="resources/images/waypoint.png"
          />{" "}
        </div>
        <div
          className={`lvlg-map-feature ${
            curZone.hastrial ? "enabled" : "disabled"
          }`}
        >
          {" "}
          <img
            className="w-full h-full"
            src="resources/images/portal.png"
          />{" "}
        </div>
        <div
          className={`lvlg-map-feature ${
            curZone.hastrial ? "enabled" : "disabled"
          }`}
        >
          {" "}
          <img
            className="w-full h-full"
            src="resources/images/Offering_to_the_Goddess.png"
          />{" "}
        </div>
        <div
          className={`lvlg-map-feature ${
            curZone.haspassive ? "enabled" : "disabled"
          }`}
        >
          {" "}
          <img
            className="w-full h-full"
            src="resources/images/Book_of_Skill.png"
          />{" "}
        </div>
      </div>
    </div>
  );
}

export function ZoneNotes(props: any): any {
  const curZone = props.curZone as IAppZone;
  const curAct = props.curAct as IAppAct;

  return (
    <div className="container flex flex-col min-h-200px">
      <h2>Notes</h2>
      <p>{curZone.note}</p>
    </div>
  );
}

export function ZoneMap(props: any) {
  const curZone = props.curZone as IAppZone;
  const curAct = props.curAct as IAppAct;

  if (curZone.image[0] !== "none" && curZone.image.length > 0) {
    return (
      <div className="container flex flex-col min-h-200px">
        <div className="">
          <h2>Navigation</h2>
        </div>
        <div className="flex flex-row flex-wrap">
          {curZone.image.map((val) => {
            const path =
              "resources/images/zones/" + curAct.act + "/" + val + ".png";
            return <img key={path} className="" src={path} />;
          })}
        </div>
        <div className="">
          <span>{curZone.altimage !== "none" ? curZone.altimage : ""}</span>
        </div>
      </div>
    );
  } else
    return (
      <div className="container flex flex-col min-h-200px">
        <div className="">
          <h2>Navigation</h2>
        </div>
        <div className="">
          <span>{curZone.altimage !== "none" ? curZone.altimage : ""}</span>
        </div>
      </div>
    );
}

export function ZoneTips() {
  return (
    <div className="flex flex-col">
      <button
        id="ZoneTips"
        className="bg-poe-96 border-poe-4 p-2 shadow-xl rounded-lg h-10 overflow-hidden"
        data-tip="hello world"
        data-effect="solid"
        data-place="left"
      >
        Afficher les astuces
      </button>

      <ReactTooltip data-tip="" data-for="zoneTips">
        <h2>Tips</h2>

        <ul className="tips text-sm mt-2">
          <li>
            Logging out to the Character Selection screen and back in is a great
            way to go back to town for free (risky for the first hour of the
            league)
          </li>
          <li>You don't need to talk to NPCs to get quests</li>
          <li>
            One Man tag: Hit boss with everyone not in instance, port in, easy 1
            man boss
          </li>
          <li>Flesh and stone blinds mobs</li>
          <li>Skitter bots slow mobs and shock(15%damage)</li>
          <li>
            Leaving Izaro lieutenants alive gives you more keys at the end
          </li>
          <li>
            At levl 50 and over, do all vaal side areas for 6-links, you can
            change colors in crafting bench
          </li>
          <li>Don't obsess over every drop, prioritize sockets and links</li>
          <li>
            7 vaal gems + sacrifice fragment = Vaal orb, with Vaal Orbs you can
            vaal your skills
          </li>
          <li>Molten shell is a very good skill to vaal for Hardcore</li>
          <li>Essences are good for easy leveling crafting</li>
          <li>
            Sell to the vendor a Rustic Sash (magic or rare) + Blacksmith
            Whetstone + weapon = Magic same weapon type with (40 to 64%)
            Increased Physical Damage
          </li>
          <li>
            Sell to the vendor a Chain Belt (magix or rare) + Blacksmith
            Whetstone + Dagger/Sceptre/Staff/Wand = Magic same weapon with (10
            to 29%) Increased Spell Damage
          </li>
          <li>
            Sell to a vendor Magic Sceptre/Wand/Rune Dagger + Ruby Ring(for Fire
            Damage) or Topaz Ring(for Lightning Damage) or Sapphire Ring(for
            Cold Damage) + Orb of Alteration = Weapon with with added x to x
            Lightning/Fire/Cold Damage to Spells
          </li>
          <li>
            Sell to a vendor White Boots + Any rarity Quicksilver Flask + Orb of
            Augmentation = Magic Boots with 10% increased Movement Speed
          </li>
          <li>
            Sell to a vendor Magic or Rare Boots with +X% Movement Speed + Any
            rarity Quicksilver Flask + Orb of Augmentation = Magic Boots with
            (original value)+5% increased Movement Speed
          </li>
        </ul>
      </ReactTooltip>
    </div>
  );
}

export function LevelTips(props: any): any {
  //const [levelTips, setlevelTips] = useState(  )

  return <div>choses a faire en fonction du level</div>;
}
