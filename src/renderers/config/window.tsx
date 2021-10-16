import React, { useState, useEffect } from "react";
import * as ReactDOM from "react-dom";

import '../index.css'
import './index.css'

function App() {
    return <div>
        <h1>Ma fenetre</h1>
    </div>
}

// window.myAPI.getInitData().then((result: IReactAppInit) => {
//     ReactDOM.render(<App AppData={result} />, document.getElementById("root"));
//   });
  
ReactDOM.render(<App />, document.getElementById("root"));