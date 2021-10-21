import React, { useState, useEffect } from "react";
import * as ReactDOM from "react-dom";

import "../index.css";
import "./index.css";

function App(props: { AppData: any }) {
  const [PoeLogPath, setPoeLogPath] = useState(props.AppData.poeLogPath);

  function ShowPoeLogDialog() {
    console.log("click");
    window.configAPI.send("configWindow", { func: "showPoeLogPathDialog", var: [PoeLogPath as string] })
  }

  /**********************************
   * IPC
   */
   window.configAPI.receive("poeLogPath", (e, arg) => {
    setPoeLogPath(arg);
    console.log("receive poeLogPath:");
     console.log(arg);
  });

  return (
    <div>
      <h1>Configuration</h1>
      <span>{PoeLogPath}</span>
      <button className="border-double border-2 border-poe-4 rounded-lg bg-poe-96" onClick={ShowPoeLogDialog}>Ouvrir</button>
    </div>
  );
}

window.configAPI
  .sendSync("configWindow", { func: "getInitData" })
  .then((result: { poeLogPath: string }) => {
    ReactDOM.render(<App AppData={result} />, document.getElementById("root"));
  });
