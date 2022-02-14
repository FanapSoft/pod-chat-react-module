import React, {Component, Fragment} from "react";
import {connect} from "react-redux";

//actions
import {threadCreateWithExistThread, threadGoToMessageId} from "../actions/threadActions";
import {
  chatAcceptCall,
  chatAudioPlayer,
  chatCallBoxShowing, chatCallMuteParticipants, chatCallParticipantListChange,
  chatCallStatus, chatCallTurnOffVideo, chatCallTurnOnVideo, chatCallUnMuteParticipants,
  chatRejectCall
} from "../actions/chatActions";

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import {ButtonFloating} from "../../../pod-chat-ui-kit/src/button";

import Modal, {ModalBody, ModalHeader, ModalFooter} from "../../../pod-chat-ui-kit/src/modal";
import {
  MdCall,
  MdMicOff,
  MdVolumeOff,
  MdVolumeUp,
  MdMic,
  MdVideocam,
  MdMoreHoriz,
  MdOutlineScreenShare,
  MdViewCarousel,
  MdPause, MdVideocamOff
} from "react-icons/md";

//styling
import style from "../../styles/app/CallBoxControlSet.scss";
import {
  getMessageMetaData,
  isParticipantVideoTurnedOn,
  isScreenShare,
  isScreenShareOwnerIsMe,
  isVideoCall,
  mobileCheck
} from "../utils/helpers";
import {
  CALL_DIV_ID, CHAT_CALL_BOX_COMPACTED, CHAT_CALL_BOX_FULL_SCREEN,
  CHAT_CALL_BOX_NORMAL,
  CHAT_CALL_STATUS_DIVS,
  CHAT_CALL_STATUS_INCOMING, CHAT_CALL_STATUS_OUTGOING,
  CHAT_CALL_STATUS_STARTED
} from "../constants/callModes";
import classnames from "classnames";
import {getParticipant} from "./ModalThreadInfoPerson";
import strings from "../constants/localization";
import CallBoxControlSetMore from "./CallBoxControlSetMore";


@connect(store => {
  return {
    chatCallStatus: store.chatCallStatus,
    user: store.user.user,
    chatCallParticipantList: store.chatCallParticipantList.participants,
    chatCallBoxShowing: store.chatCallBoxShowing
  }
})
export default class CallBoxControlSet extends Component {

  constructor(props) {
    super(props);
    this.onDropCallClick = this.onDropCallClick.bind(this);
    this.onAcceptCallClick = this.onAcceptCallClick.bind(this);
    this.onMicClick = this.onMicClick.bind(this);
    this.onCamClick = this.onCamClick.bind(this);
    this.onMoreActionClick = this.onMoreActionClick.bind(this);
    this.state = {
      mic: true,
      cam: false,
      moreSettingShow: false
    }
  }

  componentDidMount() {
    const {user, chatCallParticipantList, chatCallStatus} = this.props;
    const {call} = chatCallStatus;
    if (chatCallParticipantList.length) {
      const participant = chatCallParticipantList.find(e => e.id === user.id);

      if (participant) {
        this.setState({
          cam: isVideoCall(call) ? participant.video === undefined ? true : participant.video : participant.video,
          mic: !participant.mute
        });
      }
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {user, chatCallStatus, dispatch} = this.props;
    const {cam} = this.state;
    const {chatCallParticipantList: oldChatCallParticipantList, chatCallStatus: oldChatCallStatus} = prevProps;
    const {status: oldStatus} = oldChatCallStatus;
    const {status, call} = chatCallStatus;
    if (oldStatus !== status) {
      if (oldStatus === CHAT_CALL_STATUS_OUTGOING) {
        if (status === CHAT_CALL_STATUS_STARTED) {
          const {mic, cam} = this.state;
          const {callId} = call;
          const {user} = this.props;
          const timeoutCount = 500;
          if (!mic) {
            setTimeout(() => dispatch(chatCallMuteParticipants(callId, [user.id])), timeoutCount);
          }
          if (isVideoCall(call)) {
            if (!cam) {
              setTimeout(() => dispatch(chatCallTurnOffVideo(user.id)), timeoutCount);
            }
          } else {
            if (cam) {
              setTimeout(() => dispatch(chatCallTurnOnVideo(user.id)), timeoutCount);
            }
          }
        }
      } else if (oldStatus === CHAT_CALL_STATUS_INCOMING) {
        if (!cam && this.lastAcceptedCallIsVideo) {
          this.setState({
            cam: this.lastAcceptedCallIsVideo
          });
          setTimeout(()=> dispatch(chatCallParticipantListChange([{id: user.id, video: true}])) ,1000)

        }
        this.lastAcceptedCallIsVideo = false;
      }
    }
  }

  onDropCallClick(e) {
    e.stopPropagation();
    const {stopRingtone, dispatch, chatCallStatus} = this.props;
    const {call, status} = chatCallStatus;
    dispatch(chatRejectCall(call, status));
    stopRingtone(status);
  }

  onAcceptCallClick(isVideoCall, e) {
    (e || isVideoCall).stopPropagation();
    const {dispatch, chatCallStatus, stopRingtone} = this.props;
    const {call, status} = chatCallStatus;
    dispatch(chatAcceptCall(call, isVideoCall));
    this.lastAcceptedCallIsVideo = isVideoCall === true;
    stopRingtone(status);
  }


  onMicClick(e) {
    e.stopPropagation();
    const currentState = this.state.mic;
    const nextState = !currentState;
    const {chatCallStatus, user, dispatch} = this.props;
    const {status, call} = chatCallStatus;
    if (nextState) {
      dispatch(chatCallUnMuteParticipants(call.callId, [user.id], status !== CHAT_CALL_STATUS_STARTED));
    } else {
      dispatch(chatCallMuteParticipants(call.callId, [user.id], status !== CHAT_CALL_STATUS_STARTED));
    }
    this.setState({
      mic: nextState,
    })
  }

  onCamClick(e) {
    e.stopPropagation();
    const currentState = this.state.cam;
    const nextState = !currentState;
    const {chatCallStatus, user, dispatch} = this.props;
    const {status} = chatCallStatus;
    if (nextState) {
      dispatch(chatCallTurnOnVideo(user.id, status !== CHAT_CALL_STATUS_STARTED));
    } else {
      dispatch(chatCallTurnOffVideo(user.id, status !== CHAT_CALL_STATUS_STARTED));
    }
    this.setState({
      cam: nextState,
    })
  }

  onMoreActionClick(showing, e) {
    e && e.stopPropagation()
    this.setState({
      moreSettingShow: !this.state.moreSettingShow
    });
  }

  render() {
    const {chatCallStatus, buttonSize, chatCallBoxShowing, user} = this.props;
    const {mic, volume, moreSettingShow, cam} = this.state;
    const {status, call} = chatCallStatus;
    const {showing: callBoxShowingType} = chatCallBoxShowing;
    const showScreenShareIconCondition = isScreenShare(call) && isScreenShareOwnerIsMe(call?.screenShare, user);
    const incomingCondition = status === CHAT_CALL_STATUS_INCOMING;
    const isCallStarted = status === CHAT_CALL_STATUS_STARTED;
    const fullScreenCondition = callBoxShowingType === CHAT_CALL_BOX_FULL_SCREEN || (mobileCheck() && callBoxShowingType !== CHAT_CALL_BOX_COMPACTED);
    const classNames = classnames({
      [style.CallBoxControlSet]: true,
      [style["CallBoxControlSet--fullScreen"]]: fullScreenCondition
    });
    const callDropClassNames = classnames({
      [style.CallBoxControlSet__Button]: true,
      [style.CallBoxControlSet__DropCall]: true
    });
    const callAcceptClassNames = classnames({
      [style.CallBoxControlSet__Button]: true,
      [style.CallBoxControlSet__AcceptCall]: true
    });
    const micOffOrOnClassNames = classnames({
      [style.CallBoxControlSet__Button]: true,
      [style.CallBoxControlSet__Mic]: true
    });
    const moreActionClassNames = classnames({
      [style.CallBoxControlSet__Button]: true,
      [style.CallBoxControlSet__MoreAction]: true
    });

    return <Container className={classNames}>
      <ButtonFloating onClick={this.onDropCallClick} size={buttonSize || "sm"} className={callDropClassNames}>
        <MdCall size={style.iconSizeMd} style={{margin: "7px 5px"}}/>
      </ButtonFloating>
      {incomingCondition &&
      <>
        <ButtonFloating size={buttonSize || "sm"} className={callAcceptClassNames} onClick={this.onAcceptCallClick}>
          <MdCall size={style.iconSizeMd} style={{margin: "7px 5px"}}/>
        </ButtonFloating>
        <ButtonFloating size={buttonSize || "sm"} className={callAcceptClassNames}
                        onClick={this.onAcceptCallClick.bind(this, true)}>
          <MdVideocam size={style.iconSizeMd} style={{margin: "7px 5px"}}/>
        </ButtonFloating>
      </>
      }
      {!incomingCondition &&
      <>
        {
          <ButtonFloating onClick={this.onCamClick} size={buttonSize || "sm"} className={micOffOrOnClassNames}>
            {cam ?
              <MdVideocam size={style.iconSizeMd} style={{margin: "7px 5px"}}/> :
              <MdVideocamOff size={style.iconSizeMd} style={{margin: "7px 5px"}}/>
            }
          </ButtonFloating>
        }
        <ButtonFloating onClick={this.onMicClick} size={buttonSize || "sm"} className={micOffOrOnClassNames}>

          {mic ?
            <MdMic size={style.iconSizeMd} style={{margin: "7px 5px"}}/> :
            <MdMicOff size={style.iconSizeMd} style={{margin: "7px 5px"}}/>
          }
        </ButtonFloating>

      </>
      }

      {!incomingCondition && callBoxShowingType !== CHAT_CALL_BOX_COMPACTED &&
      <Fragment>

        <ButtonFloating onClick={this.onMoreActionClick.bind(this, true)} size={buttonSize || "sm"}
                        className={moreActionClassNames}>
          {showScreenShareIconCondition &&
          <Container className={style.CallBoxControlSet__ScreenShareIconContainer}>
            <MdOutlineScreenShare size={style.iconSizeMd} style={{margin: "7px 5px"}}/>
          </Container>
          }
          <MdMoreHoriz size={style.iconSizeMd} style={{margin: "7px 5px"}}/>

        </ButtonFloating>
        {moreSettingShow && <CallBoxControlSetMore onMoreActionClick={this.onMoreActionClick.bind(this)}/>}
      </Fragment>
      }


    </Container>
  }
}