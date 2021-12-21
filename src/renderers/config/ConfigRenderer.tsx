import { mdiFolderOpenOutline } from "@mdi/js"
import React, { useState, useCallback } from "react"
import * as ReactDOM from "react-dom"

import "../index.css"
import { MenuButton } from "../leveling/MenuBar"
import "./index.css"

function App(props: { Init: any }) {
  const [poeLogPath, setpoeLogPath] = useState(props.Init[1])

  const showPoeLogDialog = useCallback(() => {
    window.poe_interface_API.send("configRenderer", "showPoeLogPathDialog", poeLogPath)
  }, [poeLogPath])

  /**********************************
   * IPC
   */
  window.poe_interface_API.receive("configRenderer", (e, arg) => {
    console.log("=> Receive configRenderer :", arg)
    switch (arg[0]) {
      case "poeLogPath":
        setpoeLogPath(arg)
        break
    }
  })

  return (
    <div className="p-2 max-h-screen h-screen w-screen overflow-hidden">
      <h1>Configuration</h1>
      <div className="container">
        <h2>Poe Log Path</h2>
        <p>
          Chosse the path of Poe log (use{" "}
          <span className="italic text-poe-1">.../SteamLibrary/steamapps/common/Path of Exile/logs/Client.txt</span>) for steam linux
          installation.
        </p>
        <div className="flex flex-row gap-4">
          <MenuButton mdiPath={mdiFolderOpenOutline} tooltip="choose file" onClick={showPoeLogDialog} />
          <span className="italic text-poe-50">{poeLogPath}</span>
        </div>
      </div>
    </div>
  )
}

window.poe_interface_API.sendSync("configRenderer", "Init").then(e => {
  console.log(e)
  ReactDOM.render(<App Init={e} />, document.getElementById("root"))
})
