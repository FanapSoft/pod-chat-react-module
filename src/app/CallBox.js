import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import classnames from "classnames";
import Cookies from "js-cookie";


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
import CallBoxScenePerson from "./CallBoxScenePerson";
import CallBoxControlSet from "./CallBoxControlSet";
import CallBoxRecording from "./CallBoxRecording";

//styling
import style from "../../styles/app/CallBox.scss";
import {getMessageMetaData, isGroup, isRecording, mobileCheck} from "../utils/helpers";
import {
  CALL_SETTING_COOKIE_KEY_NAME,
  CALL_SETTINGS_CHANGE_EVENT,
  CHAT_CALL_BOX_COMPACTED, CHAT_CALL_BOX_FULL_SCREEN,
  CHAT_CALL_BOX_NORMAL,
  CHAT_CALL_STATUS_INCOMING,
  CHAT_CALL_STATUS_OUTGOING, CHAT_CALL_STATUS_STARTED, DROPPING_INCOMING_TIME_OUT, DROPPING_OUTGOING_TIME_OUT
} from "../constants/callModes";
import CallBoxHead from "./CallBoxHead";
import ringtoneSound from "../constants/ringtone.mp3";
import callingTone from "../constants/callingTone.mp3";
import CallBoxSceneGroup from "./CallBoxSceneGroup";
import {CgPacman} from "react-icons/all";
import Draggable from "react-draggable";


@connect(store => {
  return {
    chatCallStatus: store.chatCallStatus,
    threadObject: store.thread
  }
}, null, null, {forwardRef: true})
export default class CallBox extends Component {

  constructor(props) {
    super(props);
    this.onCallBoxClick = this.onCallBoxClick.bind(this);
    //create notification audio tag
    this.playRingtone = this.playRingtone.bind(this);
    this.stopRingtone = this.stopRingtone.bind(this);
    this.hideOrShowControls = this.hideOrShowControls.bind(this);
    this.interValId = null;
    this.ringtone = new Audio(ringtoneSound);
    this.ringtone.loop = true;
    this.ringtone.muted = true;

    this.callingTone = new Audio(callingTone);
    this.callingTone.loop = true;
    this.callingTone.muted = true;

    const currentSettings = JSON.parse(Cookies.get(CALL_SETTING_COOKIE_KEY_NAME) || "{}");

    this.ringToneSound = currentSettings.hasOwnProperty("ringToneSound") ? currentSettings.ringToneSound : true;
    this.callToneSound = currentSettings.hasOwnProperty("callToneSound") ? currentSettings.callToneSound : true;

    this.state = {
      showControl: true
    };

    window.addEventListener(CALL_SETTINGS_CHANGE_EVENT, e => {
      this.ringToneSound = e.detail.ringToneSound;
      this.callToneSound = e.detail.callToneSound;
    })
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
    const {status, call} = chatCallStatus;
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
        if (!status || status === CHAT_CALL_STATUS_STARTED) {
          this.stopRingtone(CHAT_CALL_STATUS_OUTGOING);
          this.stopRingtone(CHAT_CALL_STATUS_INCOMING);
        }
      }
    }
  }

  componentWillUnmount() {
    this.setState({})
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
      if (this.ringToneSound) {
        this.ringtone.play()
      }
    } else if (type === CHAT_CALL_STATUS_OUTGOING) {
      this.callingTone.currentTime = 0;
      this.callingTone.muted = false;
      if (this.callToneSound) {
        this.callingTone.play();
      }
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

  hideOrShowControls() {
    this.setState({
      showControl: !this.state.showControl
    })
  }

  render() {
    const {chatCallStatus, chatCallBoxShowing, threadObject} = this.props;
    const {showControl} = this.state;
    const {showing: callBoxShowingType, thread} = chatCallBoxShowing;
    const {status, call} = chatCallStatus;
    const incomingCondition = status === CHAT_CALL_STATUS_INCOMING;
    const {thread: currentThread, threadFetching} = threadObject;
    const fullScreenCondition = callBoxShowingType === CHAT_CALL_BOX_FULL_SCREEN || mobileCheck();
    const classNames = classnames({
      [style.CallBox]: true,
      [style["CallBox--showing"]]: callBoxShowingType === CHAT_CALL_BOX_NORMAL || callBoxShowingType === CHAT_CALL_BOX_FULL_SCREEN,
      [style["CallBox--fullScreen"]]: callBoxShowingType === CHAT_CALL_BOX_FULL_SCREEN || mobileCheck(),
      [style["CallBox--noThreadOpened"]]: (!currentThread.id && !threadFetching),
      [style["CallBox--calling"]]: !incomingCondition,
      [style["CallBox--group"]]: thread && isGroup(thread)
    });

    const callBoxDraggableClassNames = classnames({
      [style.CallBox__DraggableContainer]: true,
      [style["CallBox__DraggableContainer--fullScreen"]]: callBoxShowingType === CHAT_CALL_BOX_FULL_SCREEN || mobileCheck(),
      [style["CallBox__DraggableContainer--showing"]]: callBoxShowingType === CHAT_CALL_BOX_NORMAL || callBoxShowingType === CHAT_CALL_BOX_FULL_SCREEN,
    });

    const callBoxHeadClassNames = classnames({
      [style.CallBox__Head]: true,
      [style["CallBox__Head--hide"]]: !showControl && fullScreenCondition
    });
    const CallBoxControlSetClassNames = classnames({
      [style.CallBox__ControlSet]: true,
      [style["CallBox__ControlSet--hide"]]: !showControl && fullScreenCondition
    });

    return <Draggable bounds="body" disabled={mobileCheck() || fullScreenCondition}>
      <Container className={callBoxDraggableClassNames}>
        <Container className={classNames} onClick={fullScreenCondition && this.hideOrShowControls} id="chat-call-box">

          <Container className={callBoxHeadClassNames} onClick={this.onCallBoxClick}>
            <CallBoxHead chatCallStatus={chatCallStatus} thread={thread} chatCallBoxShowing={chatCallBoxShowing}/>
          </Container>

          {(callBoxShowingType === CHAT_CALL_BOX_NORMAL || callBoxShowingType === CHAT_CALL_BOX_FULL_SCREEN) &&
          <Fragment>
            <Container className={style.CallBox__Scene}>
              <>
                {isGroup(thread) ?
                  <CallBoxSceneGroup chatCallStatus={chatCallStatus} chatCallBoxShowing={chatCallBoxShowing}/>
                  :
                  <CallBoxScenePerson chatCallStatus={chatCallStatus} chatCallBoxShowing={chatCallBoxShowing}/>
                }
                {isRecording(call) &&
                <Container className={style.CallBox__RecordingContainer}>
                  <CallBoxRecording call={call}/>
                </Container>
                }
              </>
            </Container>
            <Container className={CallBoxControlSetClassNames}>
              <CallBoxControlSet stopRingtone={this.stopRingtone} className={style.CallBox__ControlSet}/>
            </Container>
          </Fragment>
          }


        </Container>
      </Container>
    </Draggable>
  }
}