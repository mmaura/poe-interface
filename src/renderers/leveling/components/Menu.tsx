import React, {
  ChangeEvent,
  ChangeEventHandler,
  useContext,
  useState,
} from "react";
import ReactTooltip from "react-tooltip";

export function ZoneMenu(props: {
  curGuideIdentity: IGuideIdentity;
}): JSX.Element {
  const [curGuideIdentity, setGuideIdentity] = useState(() => {
    return props.curGuideIdentity;
  });

  function onFormChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    console.log(e);
    setGuideIdentity((prevstate) => ({
      ...prevstate,
      [name]: value,
    }));
  }

  return (
    <div className="flex flex-col">
      <button
        className="bg-poe-96 border-poe-4 p-2 shadow-xl rounded-lg h-10 overflow-hidden mb-1"
        data-for="TipsPopup"
        data-tip="TipsPopup"
        data-effect="solid"
        data-place="bottom"
      >
        Afficher les astuces
      </button>
      <div className=" border-poe-1 border-2 rounded-lg p-1 flex flex-col">
        <h2>Set Courrant</h2>
        <form>
          <GuideIdentityField
            name="name"
            value={curGuideIdentity.name}
            enabled={true}
            onChange={onFormChange}
          />
          <GuideIdentityField
            name="lang"
            value={curGuideIdentity.lang}
            enabled={true}
            onChange={onFormChange}
          />
          <GuideIdentityField
            name="class"
            value={curGuideIdentity.class}
            enabled={true}
            onChange={onFormChange}
          />
        </form>
        <button
          onClick={() => {
            window.levelingAPI.send("cloneGuide");
          }}
          className="bg-poe-96 border-poe-4 p-2 shadow-xl rounded-lg h-10 overflow-hidden mb-1"
        >
          Cloner le set
        </button>
        <button className="bg-poe-96 border-poe-4 p-2 shadow-xl rounded-lg h-10 overflow-hidden mb-1">
          Modifier le set
        </button>
      </div>

      <ReactTooltip id="TipsPopup">
        {" "}
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

function GuideIdentityField(props: {
  name: string;
  value: string;
  enabled: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
}): JSX.Element {
  const { name, value, enabled, onChange } = props;

  return (
    <input
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      className="bg-poe-96 border-poe-4 p-2 shadow-xl rounded-lg h-10 overflow-hidden mb-1"
    />
  );
}
