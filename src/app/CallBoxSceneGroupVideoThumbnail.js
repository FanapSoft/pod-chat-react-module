import React, {Component} from "react";
import {connect} from "react-redux";
import classnames from "classnames";
import {avatarNameGenerator, avatarUrlGenerator, getMessageMetaData} from "../utils/helpers";
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
  MdPause
} from "react-icons/md";
import Avatar, {AvatarImage, AvatarName} from "../../../pod-chat-ui-kit/src/avatar";
import AvatarText from "../../../pod-chat-ui-kit/src/avatar/AvatarText";

//styling
import style from "../../styles/app/CallBoxSceneGroupVideoThumbnail.scss";


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
      isVideoCall
    } = this.props;

    const {isScreenShare: oldIsScreenShare} = prevProps;
    sceneParticipant = sceneParticipant || participant;
    const goForInjectingCondition = (isScreenShare !== oldIsScreenShare) || ((sceneParticipant && nowSceneParticipant) && (sceneParticipant.id !== nowSceneParticipant.id)) || !sceneParticipant;
    if (goForInjectingCondition) {
      if (!isScreenShare) {
        nowSceneParticipant = nowSceneParticipant && nowSceneParticipant.id ? nowSceneParticipant : chatCallParticipantList && chatCallParticipantList[0];
        if (!nowSceneParticipant) {
          return;
        }
      }

      const tag = document.getElementById(isScreenShare ? 'video-screenShare' : `video-${nowSceneParticipant.id}`);

      if (tag) {
        if (isScreenShare) {
          return setTimeout(() => {
            injectVideo(tag, "screenShare");
          }, 100);
        }
        if (isVideoCall) {
          tag.innerHTML = "";
          traverseOverContactForInjecting();
        }
      }
    }
  }

  componentDidMount() {
    const {
      isVideoCall,
      isScreenShare,
      injectVideo
    } = this.props;
    if (isScreenShare && !isVideoCall) {
      const tag = document.getElementById(isScreenShare ? 'video-screenShare' : `video-${nowSceneParticipant.id}`);

      if (tag) {
        return setTimeout(() => {
          injectVideo(tag, "screenShare");
        }, 100);
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
      isVideoCall
    } = this.props;
    let {sceneParticipant} = this.state;
    const fullScreenCondition = chatCallBoxShowing.showing === CHAT_CALL_BOX_FULL_SCREEN;
    sceneParticipant = sceneParticipant || participant;
    sceneParticipant = sceneParticipant && sceneParticipant.id ? sceneParticipant : chatCallParticipantList.find(partcipant => partcipant.id === sceneParticipant);
    if (!sceneParticipant) {
      sceneParticipant = chatCallParticipantList && chatCallParticipantList[0];
    }
    const {call} = chatCallStatus;
    const {uiElements} = call;
    let filterParticipants = [];
    if (uiElements) {
      filterParticipants = chatCallParticipantList.filter(participant => uiElements[participant.id] && (isScreenShare || participant.id !== sceneParticipant.id));
    }
    if (!sceneParticipant) {
      sceneParticipant = {};
    }
    const classNames = classnames({
      [style.CallBoxSceneGroupVideoThumbnail]: true,
    });

    const listClassNames = classnames({
      [style.CallBoxSceneGroupVideoThumbnail__List]: true,
      [style["CallBoxSceneGroupVideoThumbnail__List--fullScreen"]]: fullScreenCondition
    })

    return <Container className={classNames}>
      <Container className={style.CallBoxSceneGroupVideoThumbnail__Scene}>
        <Container id={isScreenShare ? "video-screenShare" : `video-${sceneParticipant.id}`}
                   className={style.CallBoxSceneGroupVideoThumbnail__CamVideoContainer}/>
      </Container>
      {isVideoCall &&
        <Container className={listClassNames}>
          <Container className={style.CallBoxSceneGroupVideoThumbnail__ListContainer}>
            <Container className={style.CallBoxSceneGroupVideoThumbnail__ListScroller}>
              {filterParticipants.map((participant, index) =>
                <Container className={style.CallBoxSceneGroupVideoThumbnail__ListItem}
                           key={participant.id}
                           onClick={this.onParticipantClick.bind(this, participant)}>
                  <Container className={style.CallBoxSceneGroupVideoThumbnail__MuteContainer}>
                    {participant && participant.mute &&
                    <MdMicOff size={style.iconSizeXs}
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