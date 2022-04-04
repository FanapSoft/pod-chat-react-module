import React, {Component} from "react";
import {connect} from "react-redux";

//strings
import {BREAK_PARTICIPANT_AVATAR_LIMIT, CHAT_CALL_STATUS_STARTED} from "../constants/callModes";

//actions
import {chatCallGroupSettingsShowing} from "../actions/chatActions";

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import {
  MdMicOff,
} from "react-icons/md";
import Avatar, {AvatarImage} from "../../../pod-chat-ui-kit/src/avatar";

//styling
import style from "../../styles/app/CallBoxSceneGroupParticipants.scss";
import {avatarNameGenerator, avatarUrlGenerator} from "../utils/helpers";
import {getImage, getName} from "./_component/contactList";
import classnames from "classnames";
import CallBoxSceneGroupParticipantsControl from "./CallBoxSceneGroupParticipantsControl";

@connect(store => {
  return {
    user: store.user.user,
    chatCallParticipantList: store.chatCallParticipantList.participants,
    chatCallGroupSettingsShowing: store.chatCallGroupSettingsShowing
  };
})
export default class CallBoxSceneGroup extends Component {

  constructor(props) {
    super(props);
    this.setDetailsShowing = this.setDetailsShowing.bind(this);
    this.state = {
      detailsListShowing: false
    }
  }

  setDetailsShowing() {
    this.props.dispatch(chatCallGroupSettingsShowing(true));
  }

  render() {
    const {chatCallParticipantList, chatCallBoxShowing, user, chatCallGroupSettingsShowing, chatCallStatus} = this.props;
    const {detailsListShowing} = this.state;
    const callStarted = chatCallStatus.status === CHAT_CALL_STATUS_STARTED;
    const CallBoxSceneGroupParticipantsClassNames = classnames({
      [style.CallBoxSceneGroupParticipants]: true,
      [style["CallBoxSceneGroupParticipants--details"]]: detailsListShowing
    });
    const avatarClassName = classnames({
      [style.CallBoxSceneGroupParticipants__Avatar]: true
    });
    if (chatCallGroupSettingsShowing) {
      return <CallBoxSceneGroupParticipantsControl chatCallParticipantList={chatCallParticipantList}
                                                   chatCallBoxShowing={chatCallBoxShowing}
                                                   user={user}/>
    }
    let filteredParticipantList = chatCallParticipantList.length > BREAK_PARTICIPANT_AVATAR_LIMIT ? chatCallParticipantList.slice(0, 4) : chatCallParticipantList;
    if (chatCallParticipantList.length > BREAK_PARTICIPANT_AVATAR_LIMIT) {
      filteredParticipantList.push({contactName: "5 +"})
    }
    filteredParticipantList = callStarted ? filteredParticipantList.filter(e => e.callStatus === 6) : filteredParticipantList;
    return <Container className={CallBoxSceneGroupParticipantsClassNames}
                      onClick={() => this.setDetailsShowing()}>
      {filteredParticipantList.map(participant =>
        <Container className={style.CallBoxSceneGroupParticipants__Participant} title={getName(participant)}>
          {participant.mute &&
          <Container className={style.CallBoxSceneGroupParticipants__MicOffContainer} topLeft>
            <MdMicOff size={style.iconSizeXs}
                      color={style.colorGrayDark}
                      style={{margin: "3px 4px"}}/>
          </Container>
          }
          <Avatar cssClassNames={avatarClassName} inline={false}>
            <AvatarImage src={avatarUrlGenerator(getImage(participant), avatarUrlGenerator.SIZES.XLARGE)}
                         text={avatarNameGenerator(getName(participant)).letter}
                         textBg={avatarNameGenerator(getName(participant)).color}/>
          </Avatar>
        </Container>
      )}

    </Container>
  }
}