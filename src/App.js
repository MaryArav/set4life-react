import React, { Component } from 'react';
import './App.css';
import Board from './Components/Sections/Board.js';
import SelectGameType from './Components/Sections/SelectGameType.js';
import Variables from './SetGame/Variables.js';
import Entrance from './Components/Sections/Entrance.js';

class App extends Component {
  constructor(props){
    super(props);
    this.state={
      pageSeen:"ent"
      //ent-EntrancePage
      //sel-SelectGameType
      //boa-Board
    }
  }

  moveThroughPages=(pageName)=>{
     this.setState({pageSeen:pageName})
  }

  render() {
    console.log(this.state.pageSeen);
    return (
      <div id="App" className='page'>
      {this.state.pageSeen==="ent"&&<Entrance moveThroughPages={this.moveThroughPages} />}
      {this.state.pageSeen==="sel"&&<SelectGameType moveThroughPages={this.moveThroughPages} />}
      {this.state.pageSeen==="boa"&&<Board gameObj={Variables.gameObj} gameCode={Variables.gameCode}  userId={Variables.userId} />} 
      </div>
    );
  }
}

export default App;
