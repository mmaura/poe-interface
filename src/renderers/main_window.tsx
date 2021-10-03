import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './main_window.css';

//let player = {level: 0, zone: "na", name : "na"};
//let player 


class Titre extends React.Component {
  render(){
    return (<h1>POE Interface</h1>)
  }
}
ReactDOM.render(<Titre />, document.getElementById('titre'))

interface IState {
  player?: {level: number, zone: string, name: string };
}

class Player extends React.Component<IState> {
  state: { player: any }

  constructor(props: any){
     super(props);
     this.state = ({ player: '' })
  }

  onTime() {
    window.myAPI.player_get().then((result) => {
      console.log('time')
      console.log(result)
      this.setState({player: result})
      //return result
    })
  }

  // Before the component mounts, we initialise our state
  componentWillMount() {
    this.onTime();
  }

  // After the component did mount, we set the state each second.
  componentDidMount() {
    setInterval(() => this.onTime(), 5000);
  }

  render() {
    return (
      <div className="player">
        <h1>Information Joueur {this.state.player.name}</h1>
        <ul>
          <li>Level:{this.state.player.level}</li>
          <li>Zone: {this.state.player.zone}</li> 
        </ul>
      </div>
    );
  }
}

ReactDOM.render(<Player />, document.getElementById('playerRender'));
