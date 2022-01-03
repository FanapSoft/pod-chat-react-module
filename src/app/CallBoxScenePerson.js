import React, {Component} from "react";
import {connect} from "react-redux";

//actions

//components

//styling
import {isScreenShare, isScreenShareOwnerIsMe, isVideoCall} from "../utils/helpers";
import {CHAT_CALL_STATUS_INCOMING, CHAT_CALL_STATUS_OUTGOING} from "../constants/callModes";
import CallBoxScenePersonVideo from "./CallBoxScenePersonVideo";
import CallBoxScenePersonAudio from "./CallBoxScenePersonAudio";


@connect(store => {
  return {
    user: store.user.user,
    chatCallParticipantList: store.chatCallParticipantList.participants
  };
})
export default class CallBoxScenePerson extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const {chatCallStatus, chatCallBoxShowing, user, chatCallParticipantList} = this.props;
    const {status, call} = chatCallStatus;
    const isVideoCalling = isVideoCall(call);
    const isScreenSharing = isScreenShare(call);
    const incomingCondition = status === CHAT_CALL_STATUS_INCOMING;
    const outgoingCondition = status === CHAT_CALL_STATUS_OUTGOING;
    const commonArgs = {
      chatCallStatus,
      chatCallBoxShowing,
      user,
      chatCallParticipantList
    };
    return (isScreenSharing || isVideoCalling) && !incomingCondition && !outgoingCondition ?
      <CallBoxScenePersonVideo {...commonArgs}/> :
      <CallBoxScenePersonAudio {...commonArgs}/>;
  }
}