import React, {Component} from "react";
import {connect} from "react-redux";
import {getImage, getName} from "./_component/contactList";
import classnames from "classnames";
import Gap from "raduikit/src/gap";
import CallBoxSceneGroupToaster from "./CallBoxSceneGroupToaster";
import CallBoxSceneGroupVideo from "./CallBoxSceneGroupVideo";
import CallBoxSceneGroupVoice from "./CallBoxSceneGroupVoice";
import {
  avatarNameGenerator,
  avatarUrlGenerator,
  getMessageMetaData, isParticipantVideoTurnedOn,
  isScreenShare,
  isVideoCall,
  mobileCheck
} from "../utils/helpers";
import {
  CHAT_CALL_BOX_FULL_SCREEN,
  CHAT_CALL_STATUS_INCOMING,
  CHAT_CALL_STATUS_STARTED
} from "../constants/callModes";

//actions

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import Avatar, {AvatarImage, AvatarName} from "../../../pod-chat-ui-kit/src/avatar";
import AvatarText from "../../../pod-chat-ui-kit/src/avatar/AvatarText";

//styling
import style from "../../styles/app/CallBoxSceneGroup.scss";


@connect(store => {
  return {
    user: store.user.user,
    chatCallParticipantList: store.chatCallParticipantList.participants
  };
})
export default class CallBoxSceneGroup extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const {chatCallStatus, chatCallBoxShowing, user, chatCallParticipantList} = this.props;
    const {status, call} = chatCallStatus;
    const incomingCondition = status === CHAT_CALL_STATUS_INCOMING;
    const startedCondition = status === CHAT_CALL_STATUS_STARTED;
    const fullScreenCondition = chatCallBoxShowing.showing === CHAT_CALL_BOX_FULL_SCREEN || mobileCheck();
    const isVideoCallResult = isVideoCall(call);
    const isVideoIncluded = isVideoCallResult || isParticipantVideoTurnedOn(call, chatCallParticipantList);
    const {thread, contact} = chatCallBoxShowing;

    const avatarContainerClassNames = classnames({
      [style.CallBoxSceneGroup__AvatarContainer]: !incomingCondition
    });
    const avatarClassName = classnames({
      [style.CallBoxSceneGroup__Avatar]: true
    });

    const commonArgs = {
      chatCallParticipantList,
      chatCallStatus,
      chatCallBoxShowing,
      user,
      isVideoIncluded,
      isVideoCall: isVideoCallResult
    };
    if ((isScreenShare(call) || isVideoIncluded) && !incomingCondition && startedCondition) {
      return <>
        <CallBoxSceneGroupToaster isVideoIncluded={isVideoIncluded}/>
        <CallBoxSceneGroupVideo {...commonArgs}/>
      </>
    }
    return <Container className={style.CallBoxSceneGroup}>
      <CallBoxSceneGroupToaster isVideoCall={isVideoCallResult}/>
      {!incomingCondition && <CallBoxSceneGroupVoice {...commonArgs}/>}
      <Container className={avatarContainerClassNames}>
        <Avatar cssClassNames={avatarClassName} inline={false}>
          <AvatarImage
            size="xlg"
            customSize={fullScreenCondition ? "150px" : null}
            src={avatarUrlGenerator.apply(this, [thread.image, avatarUrlGenerator.SIZES.SMALL, getMessageMetaData(thread)])}
            text={avatarNameGenerator(thread.title).letter}
            textBg={avatarNameGenerator(thread.title).color}/>
          <Gap y={5}/>
          <AvatarName maxWidth={"110px"} style={{marginRight: "0", maxWidth: "96px"}} size="sm">
            {fullScreenCondition ?
              <Text size="xlg" bold invert={!incomingCondition}>
                {thread.title}
              </Text>
              :
              thread.title
            }
          </AvatarName>
          {incomingCondition &&
          <AvatarText>
            <Text size="xs" inline color="accent"> {getName(contact)} در حال تماس است</Text>
          </AvatarText>
          }
        </Avatar>
      </Container>
    </Container>
  }
}