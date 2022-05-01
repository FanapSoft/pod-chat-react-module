// src/list/Avatar.scss.js
import React, {Component} from "react";
import {connect} from "react-redux";
import classnames from "classnames";

//strings
import strings from "../constants/localization";

//actions

//UI components
import Container from "../../../pod-chat-ui-kit/src/container";
import {Button} from "../../../pod-chat-ui-kit/src/button";
import {MdVideocam, MdPhone} from "react-icons/md";


//styling
import style from "../../styles/app/MainHeadCallButtons.scss";
import {
  chatAcceptCall,
  chatCallBoxShowing, chatCallGetParticipantList, chatCallEnded, chatSelectParticipantForCallShowing,
  chatStartCall,
  chatStartGroupCall
} from "../actions/chatActions";
import {checkForParticipantsStatus, isGroup} from "../utils/helpers";
import {
  CHAT_CALL_BOX_NORMAL, CHAT_CALL_STATUS_STARTED, DROPPING_OUTGOING_TIME_OUT,
  MAX_GROUP_CALL_COUNT
} from "../constants/callModes";
import {getParticipant} from "./ModalThreadInfoPerson";
import MakeGlobalCall from "./_component/MakeGlobalCall";

@connect(store => {
  return {
    chatCallStatus: store.chatCallStatus,
    participants: store.threadParticipantList.participants,
  };
})
export default class MainHeadCallButtons extends Component {

  constructor(props) {
    super(props);
    this.onVoiceCallClick = this.onVoiceCallClick.bind(this);
    this.onVideoCallClick = this.onVideoCallClick.bind(this);
    this.onJoinCall = this.onJoinCall.bind(this);
    this.makeGlobalCallRef = React.createRef();
  }

  onJoinCall() {
    const {thread, dispatch} = this.props;
    dispatch(chatAcceptCall(thread.call, false, true, thread));
  }

  _groupCall(type) {
    const {participants, thread, dispatch} = this.props;
    if (thread.participantCount > MAX_GROUP_CALL_COUNT) {
      return this.makeGlobalCallRef.current.onMakeCall(this._lastGroupCallRequest);
    }
    dispatch(chatCallBoxShowing(CHAT_CALL_BOX_NORMAL, thread));
    dispatch(chatCallGetParticipantList(null, participants));
    dispatch(chatStartGroupCall(thread.id, null, type));
    checkForParticipantsStatus.call(this, participants);
  }

  _p2pCall(callType) {
    const {participants, thread, user, dispatch} = this.props;
    const contact = thread.onTheFly ? thread.participant : getParticipant(participants, user);
    dispatch(chatCallBoxShowing(CHAT_CALL_BOX_NORMAL, thread, contact));
    if (thread.onTheFly) {
      const id = contact.isMyContact ? contact.contactId : contact.id;
      const type = contact.isMyContact ? "TO_BE_USER_CONTACT_ID" : "TO_BE_USER_ID";
      return dispatch(chatStartCall(null, callType, {
        invitees: [{
          "id": id,
          "idType": type
        }
        ]
      }));
    }
    dispatch(chatCallGetParticipantList(null, [contact, user]));
    dispatch(chatStartCall(thread.id, callType));
  }

  onVoiceCallClick() {
    const {thread} = this.props;
    if (isGroup(thread)) {
      this._lastGroupCallRequest = "voice";
      return this._groupCall("voice");
    }
    this._p2pCall("voice");
  }

  onVideoCallClick() {
    const {thread} = this.props;
    if (isGroup(thread)) {
      this._lastGroupCallRequest = "video";
      return this._groupCall("video");
    }
    this._p2pCall("video");
  }

  render() {
    const {smallVersion, chatCallStatus, thread} = this.props;
    const classNames = classnames({
      [style.MainHeadCallButtons__Button]: true,
      [style["MainHeadCallButtons__Button--smallVersion"]]: smallVersion,

    });
    const isJoinCall = thread.call;
    return (
      <Container inline>
        {isGroup(thread) && <MakeGlobalCall noRender ref={this.makeGlobalCallRef} dualMode thread={thread}/>}
        {isJoinCall && isGroup(thread) ?

          <Button className={style.MainHeadCallButtons__JoinCallButton}
                  onClick={this.onJoinCall}>{strings.joinCall}</Button>
          :
          <>
            <Container className={classNames} onClick={chatCallStatus.status ? e => {
            } : this.onVoiceCallClick}>
              <MdPhone size={style.iconSizeMd}
                       color={chatCallStatus.status ? "rgb(255 255 255 / 30%)" : style.colorWhite}/>
            </Container>

            <Container className={classNames} onClick={chatCallStatus.status ? e => {
            } : this.onVideoCallClick}>
              <MdVideocam size={style.iconSizeMd}
                          color={chatCallStatus.status ? "rgb(255 255 255 / 30%)" : style.colorWhite}/>
            </Container>
          </>
        }


      </Container>
    )
  }
}