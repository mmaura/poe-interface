import React, {
  ChangeEvent,
  ChangeEventHandler,
  useContext,
  useState,
} from "react";
import ReactTooltip from "react-tooltip";

export function ZoneMenu(props: {
  curGuide: IClassesGuide;
}): JSX.Element {
  const [curGuide, setGuide] = useState(() => {
    return props.curGuide;
  });

  function onFormChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    console.log(e);
    setGuide((prevstate) => ({
      ...prevstate,
      [name]: value,
    }));
  }

  return (
    <div className="flex flex-row">
      <button
        className="bg-poe-96 border-poe-4 p-2 shadow-xl rounded-lg h-10 overflow-hidden mb-1"
        data-for="TipsPopup"
        data-tip="TipsPopup"
        data-effect="solid"
        data-place="bottom"
      >
        Afficher les astuces
      </button>
      <div className=" border-poe-1 border-2 rounded-lg p-1 flex flex-row">
        <h2>Set Courrant</h2>
          <GuideIdentityField
            name="name"
            value={curGuide.identity.name}
            enabled={true}
            onChange={onFormChange}
          />
          <GuideIdentityField
            name="lang"
            value={curGuide.identity.lang}
            enabled={true}
            onChange={onFormChange}
          />
          <GuideIdentityField
            name="class"
            value={curGuide.identity.class}
            enabled={true}
            onChange={onFormChange}
          />
        <button
          onClick={() => {
            window.poe_interfaceAPI.send("cloneGuide");
          }}
          className="bg-poe-96 border-poe-4 p-2 shadow-xl rounded-lg h-10 overflow-hidden mb-1"
        >
          Cloner le set
        </button>
        <button className="bg-poe-96 border-poe-4 p-2 shadow-xl rounded-lg h-10 overflow-hidden mb-1">
          Modifier le set
        </button>
      </div>


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
