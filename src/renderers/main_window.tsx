import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './main_window.css';





class Titre extends React.Component {
  render(){
    return (<h1>POE Interface</h1>)
  }
}
ReactDOM.render(<Titre />, document.getElementById('titre'))


class Player extends React.Component {
  player = {level: 0, zone: "na", name : "na"};

  onTime() {
    this.player = window.myAPI.player_get()
  }

  render() {
    setInterval(this.onTime, 1000);

    return (
      <div className="player">
        <h1>Information Joueur {this.player.name}</h1>
        <ul>
          <li>Level:{this.player.level}</li>
          <li>Zone: {this.player.zone}</li> 
        </ul>
      </div>
    );
  }
}

ReactDOM.render(<Player />, document.getElementById('playerRender'));
