import React, {Component} from "react";
import {connect} from "react-redux";
import classnames from "classnames";
import {avatarNameGenerator, avatarUrlGenerator, getMessageMetaData, isVideoCall, mobileCheck} from "../utils/helpers";
import {
  CALL_DIV_ID, CALL_SETTING_COOKIE_KEY_NAME,
  CALL_SETTINGS_CHANGE_EVENT,
  CHAT_CALL_BOX_FULL_SCREEN,
  CHAT_CALL_STATUS_INCOMING, GROUP_VIDEO_CALL_VIEW_MODE
} from "../constants/callModes";
import {getImage, getName} from "./_component/contactList";
import Gap from "raduikit/src/gap";
import CallBoxSceneGroupVoiceParticipants from "./CallBoxSceneGroupVoiceParticipants";

//actions
import {threadCreateWithExistThread, threadGoToMessageId} from "../actions/threadActions";
import {chatAudioPlayer} from "../actions/chatActions";

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import {
  MdMicOff,
  MdPlayArrow,
  MdPause, MdVideocamOff
} from "react-icons/md";
import Avatar, {AvatarImage, AvatarName} from "../../../pod-chat-ui-kit/src/avatar";
import AvatarText from "../../../pod-chat-ui-kit/src/avatar/AvatarText";

//styling
import style from "../../styles/app/CallBoxSceneGroupVideoThumbnail.scss";
import strings from "../constants/localization";


@connect(store => {
  return {
    chatCallParticipantList: store.chatCallParticipantList.participants,
    chatCallGroupSettingsShowing: store.chatCallGroupSettingsShowing,
    chatCallGroupVideoViewMode: store.chatCallGroupVideoViewMode
  };
})
export default class CallBoxSceneGroupVideoThumbnail extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sceneParticipant: null
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    let {sceneParticipant} = prevState;
    let {sceneParticipant: nowSceneParticipant} = this.state;
    const {
      isScreenShare,
      traverseOverContactForInjecting,
      participant,
      chatCallParticipantList,
      injectVideo,
      isVideoIncluded
    } = this.props;

    sceneParticipant = sceneParticipant || participant;

    if (isScreenShare) {
      const tag = document.getElementById('video-screenShare');
      return injectVideo(tag, "screenShare");
    }

    const goForInjectingCondition = ((sceneParticipant && nowSceneParticipant) && (sceneParticipant.id !== nowSceneParticipant.id)) || !sceneParticipant;
    if (goForInjectingCondition) {
      nowSceneParticipant = nowSceneParticipant && nowSceneParticipant.id ? nowSceneParticipant : chatCallParticipantList && chatCallParticipantList[0];
      if (!nowSceneParticipant) {
        return;
      }
      const tag = document.getElementById(`video-${nowSceneParticipant.id}`);
      if (isVideoIncluded) {
        tag.innerHTML = "";
        traverseOverContactForInjecting();
      }

    }
  }

  componentDidMount() {
    const {
      isScreenShare,
      injectVideo
    } = this.props;
    if (isScreenShare) {
      const tag = document.getElementById('video-screenShare');

      if (tag) {
        injectVideo(tag, "screenShare");
      }
    }

  }

  componentWillUnmount() {
    this.props.resetMediaSourceLocation();
  }

  onParticipantClick(participant, e) {
    e.stopPropagation();
    this.props.resetMediaSourceLocation();
    this.setState({
      sceneParticipant: participant
    });
  }

  render() {
    const {
      chatCallStatus,
      chatCallParticipantList,
      participant,
      chatCallBoxShowing,
      isScreenShare,
      isVideoIncluded,

    } = this.props;
    let {sceneParticipant} = this.state;
    const fullScreenCondition = chatCallBoxShowing.showing === CHAT_CALL_BOX_FULL_SCREEN;
    sceneParticipant = sceneParticipant || participant;
    sceneParticipant = sceneParticipant && sceneParticipant.id ? sceneParticipant : chatCallParticipantList.find(partcipant => partcipant.id === sceneParticipant);
    if (!sceneParticipant) {
      sceneParticipant = chatCallParticipantList && chatCallParticipantList[0];
    }
    const {call} = chatCallStatus;
    const isVideoCallResult = isVideoCall(call)
    const {uiElements} = call;
    let filterParticipants = [];
    if (uiElements) {
      filterParticipants = chatCallParticipantList.filter(participant => {
        console.log(participant)
        const commonCondition = (isScreenShare || participant.id !== sceneParticipant.id);
        if(isVideoCallResult) {
          return (participant.videoMute || uiElements[participant.id]) && commonCondition
        }
        return uiElements[participant.id]?.video && commonCondition
      });
    }
    if (!sceneParticipant) {
      sceneParticipant = {};
    }
    sceneParticipant = chatCallParticipantList.find(participant => participant.id === sceneParticipant.id);
    const classNames = classnames({
      [style.CallBoxSceneGroupVideoThumbnail]: true,
    });

    const listClassNames = classnames({
      [style.CallBoxSceneGroupVideoThumbnail__List]: true,
      [style["CallBoxSceneGroupVideoThumbnail__List--mobile"]]: mobileCheck(),
      [style["CallBoxSceneGroupVideoThumbnail__List--fullScreen"]]: fullScreenCondition
    })

    const sceneClassNames = classnames({
      [style.CallBoxSceneGroupVideoThumbnail__Scene]: true,
      [style["CallBoxSceneGroupVideoThumbnail__Scene--screenShare"]]: isScreenShare
    })

    return <Container className={classNames}>
      <Container className={sceneClassNames}>
        <Container className={style.CallBoxSceneGroupVideoThumbnail__MuteContainer}>
          {sceneParticipant && sceneParticipant.mute && !isScreenShare &&
          <MdMicOff size={style.iconSizeXs}
                    color={style.colorAccent}
                    style={{margin: "3px 4px"}}/>
          }
          {sceneParticipant && sceneParticipant.videoMute && !isScreenShare &&
          <MdVideocamOff size={style.iconSizeXs}
                         color={style.colorAccent}
                         style={{margin: "3px 4px"}}/>
          }
        </Container>
        <Container id={isScreenShare ? "video-screenShare" : `video-${sceneParticipant ? sceneParticipant.id : "video-scene"}`}
                   className={style.CallBoxSceneGroupVideoThumbnail__CamVideoContainer}/>
        {sceneParticipant && sceneParticipant.videoMute && !isScreenShare &&
        <Container center>
          <Text invert size="xs">{strings.userMutedTheVideo}</Text>
        </Container>
        }
      </Container>
      {isVideoIncluded &&
      <Container className={listClassNames}>
        <Container className={style.CallBoxSceneGroupVideoThumbnail__ListContainer}>
          <Container className={style.CallBoxSceneGroupVideoThumbnail__ListScroller}>
            {filterParticipants.map((participant, index) =>
              <Container className={style.CallBoxSceneGroupVideoThumbnail__ListItem}
                         key={participant.id}
                         onClick={!isScreenShare && this.onParticipantClick.bind(this, participant)}>
                <Container className={style.CallBoxSceneGroupVideoThumbnail__MuteContainer}>
                  {participant && participant.mute &&
                  <MdMicOff size={style.iconSizeXs}
                            color={style.colorAccent}
                            style={{margin: "3px 4px"}}/>
                  }
                  {participant && participant.videoMute &&
                  <MdVideocamOff size={style.iconSizeXs}
                                 color={style.colorAccent}
                                 style={{margin: "3px 4px"}}/>
                  }
                </Container>
                <Container id={`video-${participant.id}`}
                           className={style.CallBoxSceneGroupVideoThumbnail__CamVideoContainer}/>

              </Container>
            )}
          </Container>
        </Container>

      </Container>
      }
    </Container>
  }
}