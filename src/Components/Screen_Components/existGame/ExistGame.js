import React, { Component } from 'react';
import LoadingImg from '../../../data/design/loading-img.gif';
import Variables from '../../../SetGame/Variables.js';
import firebaseObj from '../../../firebase/firebaseObj';
import GeneralFunctions from '../../../SetGame/GeneralFunctions';
import UserIcon from '../../Small_Components/UserIcon/UserIcon';
import arrow from '../../../data/design/left-arrow.png';
import './existgame.css';

let listenerIfExistGame, previous_gameCode;
export default class ExistGame extends Component {
    constructor(props) {
        super(props);
        this.state = {
            gameCode: '',
            invalidGameCode: false,
            loadLocatePartic: null,
            gameObj: {},
            id_participants: [],
            names_participants: []
        }
        window.history.pushState('existGame', '', 'existGame');
    }


    onClickExistGameCodeButton = () => {
        if (Object.keys(this.state.gameObj).length) {
            let gameObj = this.state.gameObj;

            Object.assign(Variables, {
                gameCode: this.state.gameCode,
                _timer: gameObj.timeOut_choosingCards,
                constParameters: gameObj.constParameters ? gameObj.constParameters : {},
                creationGameTime: gameObj.creationTime
            });

            if (gameObj.Game_Participants[Variables.userId]) {

                firebaseObj.updatingValueInDataBase(
                    `Games/${this.state.gameCode}/Game_Participants/${Variables.userId}`,
                    { isConnected: true });

                firebaseObj._db.ref(`Games/${this.state.gameCode}/Game_Participants/${Variables.userId}/game_id`).once('value').then(snap => {
                    let game_id = snap.val();

                    Object.assign(Variables, {
                        _date: game_id._date,
                        day_numberedGame: game_id.day_numberedGame
                    });
                });
                firebaseObj.updatingGameIdInFB(this.state.gameCode,true);
            }

            else {
                firebaseObj.updatingGameIdInFB(this.state.gameCode);
            }

            this.props.moveThroughPages("boa", gameObj);

        }
        else
            this.setState({ invalidGameCode: true });
    }



    inputChange = (event) => {

        if(event.target.value.match(/^\d+$/)||!event.target.value){
            let input_gameCode = event.target.value;

            if (input_gameCode.length <= 3) {
                this.setState({ gameCode: input_gameCode, invalidGameCode: false, participants: [], loadLocatePartic: null });
    
                if (input_gameCode.length < 3 && previous_gameCode) {
                    firebaseObj.removeListener(listenerIfExistGame, `Games/${previous_gameCode}`);
                    previous_gameCode = null;
                }
    
                if (input_gameCode.length === 3) {
                    this.setState({ loadLocatePartic: true });
                    listenerIfExistGame = firebaseObj.listenerOnFirebase(this.MonitorParticipants, `Games/${input_gameCode}`);
                    previous_gameCode = input_gameCode;
                }
            }
        }
    }


    MonitorParticipants = (gameObj) => {
        let arr_participants = gameObj && gameObj.Game_Participants ?
            Object.entries(gameObj.Game_Participants).map(val => {
                if (val[1].isConnected) {
                    return val;
                }
            }) : [];

        arr_participants = arr_participants.filter(val => val !== undefined);
        let id_participants = arr_participants.map(val => val[0]);
        let names_participants = arr_participants.map(val => val[1].Name);

        this.setState({
            gameObj: gameObj ? gameObj : {}, loadLocatePartic: false,
            id_participants: id_participants, names_participants: names_participants
        });
    }


    keypressed = (e) => {
        if (this.state.id_participants.length && this.state.id_participants.length < 4 && !this.state.id_participants.includes(Variables.userId)) {
            if (e.key === "Enter") {
                this.onClickExistGameCodeButton();
            }
        }
    }


    render() {
        return (
            <div id='exist-game' className='container-fluid d-flex flex-column' 
            style={{ height: '100vh' }} 
            onKeyPress={this.keypressed} >

                <nav className="navbar">
                    <UserIcon name={Variables.playerName} src={Variables.profilePic} _direction='left' />
                    <img className="upper-bar-icon" src={arrow} alt="back" onClick={this.props.onClickGameTypeButton} name='sel' />
                </nav>

                <div id='search-game' className='container d-flex flex-column align-items-center'>
                    <h3 className='display-4'> הכנס קוד משחק</h3>
                    <input
                        className='form-control d-block'
                        id="input"
                        name='gameCode'
                        type='text'
                        placeholder="הכנס קוד משחק"
                        value={this.state.gameCode}
                        onChange={this.inputChange} />


                    {this.state.loadingParticipants ?
                        <img src={LoadingImg} alt='loading' /> :

                        <button
                            className='btn btn-primary'
                            onClick={this.onClickExistGameCodeButton}
                            disabled={!(this.state.id_participants.length && 
                                this.state.id_participants.length < 4 && 
                                !this.state.id_participants.includes(Variables.userId))} >המשך</button>
                    }

                    {this.state.loadLocatePartic ?
                        <img className='loading-sm' src={LoadingImg} alt='loading' /> :

                        this.state.loadLocatePartic !== null &&
                        <ParticipantsList
                            id_participants={this.state.id_participants}
                            names_participants={this.state.names_participants} />
                    }

                </div>
            </ div>
        );
    }
}


const ParticipantsList = (props) => {
    let game_status = '';
    //red
    let color='#dc3545';

    if (props.id_participants.includes(Variables.userId)) {
        game_status = 'הנך כבר משתתף במשחק זה'
    }
    else if (props.id_participants.length) {

        if (props.id_participants.length >= 4)
            game_status = 'המשחק מכיל כבר כמות מקסימאלית של משתתפים';

        else{
            game_status = GeneralFunctions.string_From_List(props.names_participants,
                '', ` ${props.names_participants.length === 1 ? `משתתף` : `משתתפים`} במשחק כרגע `);
            color='#28a745';
        }
            
    }
    else
        game_status = 'המשחק אינו קיים. אנא נסה שנית';

    return (
        <p id='participants-list'
        style={{color:color}}>{game_status}</p>
    );
}