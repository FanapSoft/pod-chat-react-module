import React, {Component, Fragment} from "react";
import {connect} from "react-redux";

//actions
import {threadCreateWithExistThread, threadGoToMessageId} from "../actions/threadActions";
import {
  chatAcceptCall,
  chatAudioPlayer,
  chatCallBoxShowing, chatCallMuteParticipants,
  chatCallStatus, chatCallUnMuteParticipants,
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
  MdPause
} from "react-icons/md";

//styling
import style from "../../styles/app/CallBoxControlSet.scss";
import {getMessageMetaData, isScreenShare, isScreenShareOwnerIsMe, isVideoCall, mobileCheck} from "../utils/helpers";
import {
  CALL_DIV_ID, CHAT_CALL_BOX_COMPACTED, CHAT_CALL_BOX_FULL_SCREEN,
  CHAT_CALL_BOX_NORMAL,
  CHAT_CALL_STATUS_DIVS,
  CHAT_CALL_STATUS_INCOMING,
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
    this.onVolumeClick = this.onVolumeClick.bind(this);
    this.onMicClick = this.onMicClick.bind(this);
    this.onMoreActionClick = this.onMoreActionClick.bind(this);
    this.state = {
      volume: true,
      mic: true,
      moreSettingShow: false
    }
  }

  componentDidMount() {
    const {user, chatCallParticipantList, chatCallStatus} = this.props;
    if (chatCallParticipantList.length) {
      const participant = chatCallParticipantList.find(e => e.id === user.id);

      if (participant) {
        const {mic, volume} = this.state;
        if (participant.mute) {
          if (mic) {
            this.setState({
              mic: false
            });
          }
        }

        if (chatCallStatus && chatCallStatus.call) {
          const {uiRemoteAudio} = chatCallStatus.call;
          if (volume && uiRemoteAudio) {
            if (uiRemoteAudio.muted) {
              this.setState({
                volume: false
              });
            }
          }
        }
      }
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {chatCallStatus, dispatch} = this.props;
    const {chatCallStatus: oldChatCallStatus} = prevProps;
    const {status: oldStatus} = oldChatCallStatus;
    const {status} = chatCallStatus;
    if (oldStatus !== status) {
      if (status === CHAT_CALL_STATUS_STARTED) {
        const {volume, mic} = this.state;
        const {callId, uiRemoteAudio} = chatCallStatus.call;
        const {user} = this.props;
        if (!mic) {
          dispatch(chatCallMuteParticipants(callId, [user.id]));
        }
        if (!volume) {
          if (uiRemoteAudio) {
            uiRemoteAudio.muted = true;
          }
        }
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

  onAcceptCallClick(e) {
    e.stopPropagation();
    const {dispatch, chatCallStatus, stopRingtone} = this.props;
    const {call, status} = chatCallStatus;
    dispatch(chatAcceptCall(call));
    stopRingtone(status);
  }

  onVolumeClick(e) {
    e.stopPropagation();
    const currentState = this.state.volume;
    const nextState = !currentState;
    const {chatCallStatus} = this.props;
    const {call, status} = chatCallStatus;
    const {uiRemoteAudio} = call;
    if (uiRemoteAudio) {
      uiRemoteAudio.muted = !nextState;
    }
    this.setState({
      volume: nextState,
    })
  }

  onMicClick(e) {
    e.stopPropagation();
    const currentState = this.state.mic;
    const nextState = !currentState;
    const {chatCallStatus, user, dispatch} = this.props;
    if (nextState) {
      dispatch(chatCallUnMuteParticipants(chatCallStatus.call.callId, [user.id]));
    } else {
      dispatch(chatCallMuteParticipants(chatCallStatus.call.callId, [user.id]));
    }
    this.setState({
      mic: nextState,
    })
  }

  onMoreActionClick(showing, e) {
    e && e.stopPropagation();
    this.setState({
      moreSettingShow: showing
    })
  }

  render() {
    const {chatCallStatus, buttonSize, chatCallBoxShowing, user} = this.props;
    const {mic, volume, moreSettingShow} = this.state;
    const {status, call} = chatCallStatus;
    const {showing: callBoxShowingType} = chatCallBoxShowing;
    const showScreenShareIconCondition = isScreenShare(call) && isScreenShareOwnerIsMe(call?.screenShare, user);
    const incomingCondition = status === CHAT_CALL_STATUS_INCOMING;
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
    const speakerOnOrOffClassNames = classnames({
      [style.CallBoxControlSet__Button]: true,
      [style.CallBoxControlSet__Speaker]: true
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
      <ButtonFloating onClick={this.onAcceptCallClick} size={buttonSize || "sm"} className={callAcceptClassNames}>
        {isVideoCall(call) ?
          <MdVideocam size={style.iconSizeMd} style={{margin: "7px 5px"}}/>
          :
          <MdCall size={style.iconSizeMd} style={{margin: "7px 5px"}}/>
        }
      </ButtonFloating>
      }
      {!incomingCondition &&
      <ButtonFloating onClick={this.onMicClick} size={buttonSize || "sm"} className={micOffOrOnClassNames}>

        {mic ?
          <MdMic size={style.iconSizeMd} style={{margin: "7px 5px"}}/> :
          <MdMicOff size={style.iconSizeMd} style={{margin: "7px 5px"}}/>
        }
      </ButtonFloating>
      }

      <ButtonFloating onClick={this.onVolumeClick} size={buttonSize || "sm"} className={speakerOnOrOffClassNames}>

        {volume ?
          <MdVolumeUp size={style.iconSizeMd} style={{margin: "7px 5px"}}/> :
          <MdVolumeOff size={style.iconSizeMd} style={{margin: "7px 5px"}}/>
        }

      </ButtonFloating>

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