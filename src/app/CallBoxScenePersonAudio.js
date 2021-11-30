import React, {Component} from "react";
import {connect} from "react-redux";

//actions

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import {
  MdMicOff,
} from "react-icons/md";
import Avatar, {AvatarImage, AvatarName} from "../../../pod-chat-ui-kit/src/avatar";

//styling
import style from "../../styles/app/CallBoxSceneAudio.scss";
import {avatarNameGenerator, avatarUrlGenerator, isScreenShareOwnerIsMe, mobileCheck} from "../utils/helpers";
import {
  CHAT_CALL_BOX_FULL_SCREEN,
  CHAT_CALL_STATUS_INCOMING
} from "../constants/callModes";
import {getImage, getName} from "./_component/contactList";
import classnames from "classnames";
import Gap from "raduikit/src/gap"


@connect()
export default class CallBoxScenePersonAudio extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const {chatCallStatus, chatCallBoxShowing, user, chatCallParticipantList} = this.props;
    const {status} = chatCallStatus;
    const incomingCondition = status === CHAT_CALL_STATUS_INCOMING;
    const {contact, showing: callBoxShowingType} = chatCallBoxShowing;
    const fullScreenCondition = callBoxShowingType === CHAT_CALL_BOX_FULL_SCREEN || mobileCheck();
    const avatarContainerClassNames = classnames({
      [style.CallBoxSceneAudio__AvatarContainer]: !incomingCondition,
      [style["CallBoxSceneAudio__AvatarContainer--fullScreen"]]: fullScreenCondition,

    });
    const avatarClassName = isSide => classnames({
      [style.CallBoxSceneAudio__Avatar]: true,
      [style["CallBoxSceneAudio__Avatar--fullScreen"]]: fullScreenCondition,
      [style["CallBoxSceneAudio__Avatar--side"]]: isSide && !fullScreenCondition
    });

    const AvatarBuilder = ({user, className}) => {
      const realUserFromParticipantList = chatCallParticipantList.find(participant => user.id === participant.id);
      const realUser = realUserFromParticipantList || user;
      return <Container className={avatarContainerClassNames}>

        <Avatar cssClassNames={className} inline={false}>
          {realUser.mute &&
          <Container className={style.CallBoxSceneAudio__MicOffContainer}>
            <MdMicOff size={style.iconSizeXs}
                      color={style.colorGrayDark}
                      style={{margin: "3px 4px"}}/>
          </Container>
          }
          <AvatarImage src={avatarUrlGenerator(getImage(realUser), avatarUrlGenerator.SIZES.XLARGE)}
                       size="xlg"
                       customSize={fullScreenCondition ? "150px" : null}
                       text={avatarNameGenerator(getName(realUser)).letter}
                       textBg={avatarNameGenerator(getName(realUser)).color}/>
          <Gap y={5}/>
          <AvatarName maxWidth="110px" style={{marginRight: "0", maxWidth: "150px"}} size={fullScreenCondition ? "xlg" : "sm"}>
            {fullScreenCondition ?
              <Text size="xlg" bold invert={!incomingCondition}>
                {getName(realUser)}
              </Text>
              :
              getName(realUser)
            }
          </AvatarName>
        </Avatar>
      </Container>
    };

    const classNames = classnames({
      [style.CallBoxSceneAudio]: true,
      [style["CallBoxSceneAudio--fullScreen"]]: fullScreenCondition,

    });

    return <Container className={classNames}>
      {(!fullScreenCondition || incomingCondition) &&
      <AvatarBuilder user={incomingCondition ? contact : user}
                     className={incomingCondition ? "" : avatarClassName()}/>
      }
      {!incomingCondition &&
      <AvatarBuilder user={contact} className={avatarClassName(true)}/>}

    </Container>
  }
}