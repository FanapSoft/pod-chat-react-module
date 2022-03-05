import React, {Component} from "react";
import {connect} from "react-redux";

//actions
import {threadCreateWithExistThread, threadGoToMessageId} from "../actions/threadActions";
import {chatAudioPlayer, chatCallGroupSettingsShowing} from "../actions/chatActions";

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
    const {chatCallParticipantList, chatCallBoxShowing, user, chatCallGroupSettingsShowing} = this.props;
    const {detailsListShowing} = this.state;
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
    const filteredParticipantList = chatCallParticipantList.length > 4 ? chatCallParticipantList.slice(0, 4) : chatCallParticipantList;
    if (chatCallParticipantList.length > 4) {
      filteredParticipantList.push({contactName: "5 +"})
    }
    return <Container className={CallBoxSceneGroupParticipantsClassNames}
                      onClick={() => this.setDetailsShowing()}>
      {filteredParticipantList.map(participant =>
        <Container className={style.CallBoxSceneGroupParticipants__Participant}>
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