import React, {Component} from "react";
import {connect} from "react-redux";
import classnames from "classnames";
import {
  avatarNameGenerator,
  avatarUrlGenerator,
  filterVideoCallParticipants,
  getMessageMetaData,
  isVideoCall,
  mobileCheck
} from "../utils/helpers";
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
import {findDOMNode} from "react-dom";

function makeParticipantVideMute(participant, uiElements, isVideoCallResult) {
  if (!uiElements || !participant) {
    return participant;
  }
  return {
    ...participant,
    videoMute: participant.videoMute || (isVideoCallResult && !uiElements[participant.id]?.video)
  };
}

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
    this.scroller = {
      isDown: false,
      startX: null,
      scrollLeft: null,
      participantMouseDown: null
    };
    this.onScrollerMouseDown = this.onScrollerMouseDown.bind(this);
    this.onScrollerMouseLeaveUp = this.onScrollerMouseLeaveUp.bind(this);
    this.onScrollerMouseMove = this.onScrollerMouseMove.bind(this);
    this.onParticipantMouseDown = this.onParticipantMouseDown.bind(this);
    this.scrollerRef = React.createRef();
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
      isVideoIncluded,
      chatCallStatus
    } = this.props;

    const {call} = chatCallStatus;
    const {uiElements} = call;
    sceneParticipant = sceneParticipant || participant;

    if (uiElements) {
      if (!sceneParticipant) {
        const newSceneParticipant = chatCallParticipantList.find(participant => uiElements[participant.id]);
        if (newSceneParticipant) {
          this.setState({
            sceneParticipant: newSceneParticipant
          });
        }
      }
    }

    if (isScreenShare) {
      const tag = document.getElementById('video-screenShare');
      return setTimeout(() => {
        injectVideo(tag, "screenShare");
      }, 1000);
    }

    const goForInjectingCondition = ((sceneParticipant && nowSceneParticipant) && (sceneParticipant.id !== nowSceneParticipant.id)) || !sceneParticipant;
    if (goForInjectingCondition) {
      nowSceneParticipant = nowSceneParticipant && nowSceneParticipant.id ? nowSceneParticipant : chatCallParticipantList && chatCallParticipantList[0];
      if (!nowSceneParticipant) {
        return;
      }
      const tag = document.getElementById(`video-${nowSceneParticipant.id}`);
      if (tag) {
        if (isVideoIncluded) {
          tag.innerHTML = "";
          traverseOverContactForInjecting();
        }
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
        setTimeout(() => {
          injectVideo(tag, "screenShare");
        }, 1000);
      }
    }

  }

  componentWillUnmount() {
    this.props.resetMediaSourceLocation();
  }

  onParticipantClick(participant, e) {
    e.stopPropagation();
    const slider = findDOMNode(this.scrollerRef.current);
    if (slider.scrollLeft !== this.scroller.participantMouseDown) {
      return
    }
    this.props.resetMediaSourceLocation();
    this.setState({
      sceneParticipant: participant
    });
  }

  onScrollerMouseDown(e) {
    e.stopPropagation();
    e.preventDefault();
    const slider = e.currentTarget;
    this.scroller.isDown = true
    this.scroller.startX = e.pageX - slider.offsetLeft;
    this.scroller.scrollLeft = slider.scrollLeft;
  }

  onParticipantMouseDown() {
    this.scroller.participantMouseDown = findDOMNode(this.scrollerRef.current).scrollLeft;
  }

  onScrollerMouseLeaveUp(e) {
    e.stopPropagation();
    e.preventDefault();
    this.scroller.isDown = false;
  }

  onScrollerMouseMove(e) {
    e.stopPropagation();
    e.preventDefault();
    const slider = e.currentTarget;
    if (!this.scroller.isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - this.scroller.startX) * 3; //scroll-fast
    slider.scrollLeft = this.scroller.scrollLeft - walk;
  }

  render() {
    const {
      chatCallStatus,
      chatCallParticipantList,
      participant,
      chatCallBoxShowing,
      isScreenShare,
      isVideoIncluded
    } = this.props;
    let {sceneParticipant} = this.state;
    const fullScreenCondition = chatCallBoxShowing.showing === CHAT_CALL_BOX_FULL_SCREEN;
    const {call} = chatCallStatus;
    const isVideoCallResult = isVideoCall(call)
    const {uiElements} = call;
    sceneParticipant = sceneParticipant || participant;
    sceneParticipant = sceneParticipant && sceneParticipant.id ? sceneParticipant : chatCallParticipantList.find(participant => participant.id === sceneParticipant);
    if (uiElements) {
      const selectOnePersonForBeingSceneParticipant = !sceneParticipant || (sceneParticipant && (isVideoCallResult ? !uiElements[sceneParticipant.id] : !uiElements[sceneParticipant.id]?.video));
      if (selectOnePersonForBeingSceneParticipant) {
        sceneParticipant = chatCallParticipantList.find(participant => isVideoCallResult ? uiElements[participant.id] : uiElements[participant.id]?.video);
      }
    }
    let filterParticipants = filterVideoCallParticipants(uiElements, isVideoCallResult, isVideoIncluded, chatCallParticipantList, participant => {
      return (isScreenShare || participant.id !== sceneParticipant?.id);
    });


    if (filterParticipants.length === 1) {
      if (!isVideoCallResult && isVideoIncluded) {
        if (!sceneParticipant || !uiElements[sceneParticipant.id]?.video) {
          sceneParticipant = filterParticipants[0];
          filterParticipants = [];
        }
      }
    }
    sceneParticipant = makeParticipantVideMute(sceneParticipant, uiElements, isVideoCallResult);
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

    if (filterParticipants.length) {
      filterParticipants.push(filterParticipants[0])
      filterParticipants.push(filterParticipants[0])
      filterParticipants.push(filterParticipants[0])
      filterParticipants.push(filterParticipants[0])
      filterParticipants.push(filterParticipants[0])
      filterParticipants.push(filterParticipants[0])
      filterParticipants.push(filterParticipants[0])
      filterParticipants.push(filterParticipants[0])
      filterParticipants.push(filterParticipants[0])
      filterParticipants.push(filterParticipants[0])
    }

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
        <Container
          id={isScreenShare ? "video-screenShare" : `video-${sceneParticipant ? sceneParticipant.id : "video-scene"}`}
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
          <Container className={style.CallBoxSceneGroupVideoThumbnail__ListScroller}
                     ref={this.scrollerRef}
                     onMouseDown={this.onScrollerMouseDown}
                     onMouseLeave={this.onScrollerMouseLeaveUp}
                     onMouseUp={this.onScrollerMouseLeaveUp}
                     onMouseMove={this.onScrollerMouseMove}>
            {filterParticipants.map((participant, index) =>
              <Container className={style.CallBoxSceneGroupVideoThumbnail__ListItem}
                         key={participant.id}
                         onMouseDown={this.onParticipantMouseDown}
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