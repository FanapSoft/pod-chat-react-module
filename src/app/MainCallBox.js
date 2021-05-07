import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import classnames from "classnames";


//actions
import {threadCreateWithExistThread, threadGoToMessageId} from "../actions/threadActions";
import {chatAudioPlayer, chatCallBoxShowing as chatCallBoxShowingAction, chatRejectCall} from "../actions/chatActions";

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import {
  MdExpandLess,
  MdPlayArrow,
  MdPause
} from "react-icons/md";
import MainCallBoxScene from "./MainCallBoxScene";
import MainCallBoxControlSet from "./MainCallBoxControlSet";

//styling
import style from "../../styles/app/MainCallBox.scss";
import styleVar from "../../styles/variables.scss";
import {getMessageMetaData} from "../utils/helpers";
import {
  CHAT_CALL_BOX_COMPACTED,
  CHAT_CALL_BOX_NORMAL,
  CHAT_CALL_STATUS_INCOMING,
  CHAT_CALL_STATUS_OUTGOING, DROPPING_INCOMING_TIME_OUT, DROPPING_OUTGOING_TIME_OUT
} from "../constants/callModes";
import {chatCallBoxShowingReducer} from "../reducers/chatReducer";
import MainCallBoxHead from "./MainCallBoxHead";
import ringtoneSound from "../constants/ringtone.mp3";
import callingTone from "../constants/callingTone.mp3";


@connect(store => {
  return {
    chatCallStatus: store.chatCallStatus
  }
}, null, null, {forwardRef: true})
export default class MainCallBox extends Component {

  constructor(props) {
    super(props);
    this.onCallBoxClick = this.onCallBoxClick.bind(this);
    //create notification audio tag
    this.playRingtone = this.playRingtone.bind(this);
    this.stopRingtone = this.stopRingtone.bind(this);
    this.interValId = null;
    this.ringtone = new Audio(ringtoneSound);
    this.ringtone.loop = true;
    this.ringtone.muted = true;

    this.callingTone = new Audio(callingTone);
    this.callingTone.loop = true;
    this.callingTone.muted = true;
  }

  setTimeoutForDropping(type, timeout) {
    const {dispatch} = this.props;
    if (!this.interValId) {
      this.interValId = setTimeout(e => {
        const {chatCallStatus} = this.props;
        if (chatCallStatus.status === type) {
          dispatch(chatRejectCall(chatCallStatus.call));
          this.stopRingtone(type);
          this.interValId = window.clearInterval(this.interValId);
        }
      }, timeout);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {chatCallStatus} = this.props;
    const {chatCallStatus: oldChatCallStatus} = prevProps;
    const {status: oldStatus} = oldChatCallStatus;
    const {status} = chatCallStatus;
    if (oldStatus !== status) {
      this.interValId = window.clearInterval(this.interValId);
      if (status === CHAT_CALL_STATUS_INCOMING) {
        this.setTimeoutForDropping(CHAT_CALL_STATUS_INCOMING, DROPPING_INCOMING_TIME_OUT);
        this.playRingtone(CHAT_CALL_STATUS_INCOMING);
      } else {
        if (status === CHAT_CALL_STATUS_OUTGOING) {
          this.setTimeoutForDropping(CHAT_CALL_STATUS_OUTGOING, DROPPING_OUTGOING_TIME_OUT);
          this.playRingtone(CHAT_CALL_STATUS_OUTGOING);
        }
        if (!status) {
          this.stopRingtone(CHAT_CALL_STATUS_OUTGOING);
          this.stopRingtone(CHAT_CALL_STATUS_INCOMING);
        }
      }
    }
  }

  onCallBoxClick() {
    const {dispatch, chatCallBoxShowing} = this.props;
    const {thread, contact} = chatCallBoxShowing;
    dispatch(chatCallBoxShowingAction(CHAT_CALL_BOX_COMPACTED, thread, contact));
  }

  playRingtone(type) {
    if (type === CHAT_CALL_STATUS_INCOMING) {
      this.ringtone.currentTime = 0;
      this.ringtone.muted = false;
      this.ringtone.play();
    } else if (type === CHAT_CALL_STATUS_OUTGOING) {
      this.callingTone.currentTime = 0;
      this.callingTone.muted = false;
      this.callingTone.play();
    }
  }

  stopRingtone(type) {
    if (type === CHAT_CALL_STATUS_INCOMING) {
      this.ringtone.muted = true;
      this.ringtone.pause();
      this.ringtone.currentTime = 0;
    } else if (type === CHAT_CALL_STATUS_OUTGOING) {
      this.callingTone.muted = true;
      this.callingTone.pause();
      this.callingTone.currentTime = 0;
    }
  }

  render() {
    const {chatCallStatus, chatCallBoxShowing} = this.props;
    const {showing: callBoxShowingType} = chatCallBoxShowing;
    const {status} = chatCallStatus;
    const incomingCondition = status === CHAT_CALL_STATUS_INCOMING;
    const classNames = classnames({
      [style.MainCallBox]: true,
      [style["MainCallBox--showing"]]: callBoxShowingType === CHAT_CALL_BOX_NORMAL,
      [style["MainCallBox--calling"]]: !incomingCondition
    });

    return <Container className={classNames}>


      <Container className={style.MainCallBox__Head} onClick={this.onCallBoxClick}>
        <MainCallBoxHead chatCallStatus={chatCallStatus}/>
      </Container>
      {callBoxShowingType === CHAT_CALL_BOX_NORMAL &&
      <Fragment>
        <Container className={style.MainCallBox__Scene}>
          <MainCallBoxScene chatCallStatus={chatCallStatus} chatCallBoxShowing={chatCallBoxShowing}/>
        </Container>
        <Container className={style.MainCallBox__ControlSet}>
          <MainCallBoxControlSet stopRingtone={this.stopRingtone} className={style.MainCallBox__ControlSet}/>
        </Container>
      </Fragment>
      }


    </Container>
  }
}