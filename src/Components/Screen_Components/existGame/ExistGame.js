import React, { Component } from 'react';
import LoadingImg from '../../../data/design/loading-img.gif';
import Variables from '../../../SetGame/Variables.js';
import firebaseObj from '../../../firebase/firebaseObj';
import GeneralFunctions from '../../../SetGame/GeneralFunctions';
import UserIcon from '../../Small_Components/UserIcon/UserIcon';
import arrow from '../../../data/design/left-arrow.png';
import './existgame.css';

let listenerIfExistGame,previous_gameCode;
export default class ExistGame extends Component {
    constructor(props) {
        super(props);
        this.state = {
            gameCode: '',
            invalidGameCode: false,
            participants: [],
            loadLocatePartic: null,
            gameObj: {}
        }
        window.history.pushState('existGame', '', 'existGame');
    }


    onClickExistGameCodeButton = () => {
        if (Object.keys(this.state.gameObj).length) {
            let gameObj = this.state.gameObj;
            firebaseObj.updatingValueInDataBase(`Games/${this.state.gameCode}/Game_Participants`,
                { [Variables.userId]: { Name: Variables.playerName, ProfilePic: Variables.profilePic, isConnected: true } });

            Object.assign(Variables, {
                gameCode: this.state.gameCode,
                _timer: gameObj.timeOut_choosingCards,
                constParameters: gameObj.constParameters ? gameObj.constParameters : {},
                creationGameTime: gameObj.creationTime
            });

            this.props.moveThroughPages("boa", gameObj);
        }
        else
            this.setState({ invalidGameCode: true });
    }


    inputChange = (event) => {
        let input_gameCode = event.target.value;

        if (input_gameCode.length <= 3) {
            this.setState({ gameCode: input_gameCode, invalidGameCode: false, participants: [], loadLocatePartic: null });
            
            if(input_gameCode.length <3 && previous_gameCode){
                firebaseObj.removeListener(listenerIfExistGame,`Games/${previous_gameCode}`);
                previous_gameCode=null;
            }

            if (input_gameCode.length === 3) {
                this.setState({ loadLocatePartic: true });
                listenerIfExistGame =firebaseObj.listenerOnFirebase(this.MonitorParticipants,`Games/${input_gameCode}`);
                previous_gameCode=input_gameCode;
            }
        }
    }


    MonitorParticipants = (gameObj) => {
        let ArrParticipants = gameObj && gameObj.Game_Participants ?
            Object.entries(gameObj.Game_Participants).map(val => {
                if (val[1].isConnected)
                    return val[1].Name;
            }) : []
        ArrParticipants = ArrParticipants.filter(val => val !== undefined);
        this.setState({ gameObj: gameObj ? gameObj : {}, participants: ArrParticipants, loadLocatePartic: false });
    }


    keypressed = (e) => {
        if (e.key === "Enter")
            this.onClickExistGameCodeButton();
    }

    
    render() {
        return (
            <div onKeyPress={this.keypressed} id="existGame">
                <div className="upperBar">
                    <UserIcon name={Variables.playerName} src={Variables.profilePic} />
                    <img className="arrow" src={arrow} alt="back" onClick={this.props.onClickGameTypeButton} name='sel' />
                </div>
                <h3> הכנס קוד משחק:</h3>
                <input
                    id="input"
                    name='gameCode'
                    type='text'
                    placeholder="הכנס קוד משחק"
                    value={this.state.gameCode}
                    onChange={this.inputChange} />
                <br />

                {this.state.loadingParticipants ?
                    <img src={LoadingImg} alt='loading' /> :
                    <button
                        onClick={this.onClickExistGameCodeButton}
                        disabled={this.state.participants.length >= 4} >המשך</button>}
                {this.state.loadLocatePartic ?
                    <img src={LoadingImg} alt='loading' className="LoadingImg" /> :
                    this.state.loadLocatePartic !== null &&
                    <ParticipantsList participants={this.state.participants} />
                }
            </div>
        );
    }
}


const ParticipantsList = (props) => (
    <p>
        {props.participants.length >= 4 ? 'המשחק מכיל כבר כמות מקסימאלית של משתתפים' :
            props.participants.length ?
                GeneralFunctions.string_From_List(props.participants, '', ` ${props.participants.length === 1 ? `משתתף` : `משתתפים`} במשחק כרגע `) :
                'המשחק אינו קיים. אנא נסה שנית'}
    </p>
);