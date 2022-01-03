import React, {Component} from "react";
import {connect} from "react-redux";
import classnames from "classnames";
import ReactDOM from "react-dom";

//constants
import {
  CALL_DIV_ID, CHAT_CALL_BOX_FULL_SCREEN
} from "../constants/callModes";

//actions

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import {
  MdMicOff
} from "react-icons/md";

//styling
import style from "../../styles/app/CallBoxSceneVideo.scss";
import {
  findLocalStreams,
  findRemoteStreams,
  isScreenShare,
  isScreenShareOwnerIsMe, isVideoCall,
  mobileCheck
} from "../utils/helpers";
import {get} from "leaflet/src/dom/DomUtil";

function fixVideoTag(tag, classNames) {
  tag.setAttribute("class", classNames);
  tag.removeAttribute("height");
  tag.removeAttribute("width");
  tag.disablePictureInPicture = true;
}

@connect()
export default class CallBoxScenePersonVideo extends Component {

  constructor(props) {
    super(props);
    this.remoteVideoRef = React.createRef();
    this.localVideoRef = React.createRef();
    this.remoteVideoInScreenSharingRef = React.createRef();
  }

  _getTags(call, user) {
    const {uiElements} = call;
    const isVideoCalling = isVideoCall(call);
    const isScreenSharing = isScreenShare(call);
    const isScreenSharingOwnerIsMe = isScreenSharing && isScreenShareOwnerIsMe(call?.screenShare, user);
    const {video: remoteVideo} = findRemoteStreams(user, call.otherClientDtoList, uiElements)
    const {video: localVideo} = findLocalStreams(user, uiElements)
    const {video: screenShareVideo} = uiElements.screenShare;

    return {remoteVideo, localVideo, screenShareVideo, isScreenSharing, isScreenSharingOwnerIsMe, isVideoCalling}
  }

  _injectVideos() {
    const {user, chatCallStatus} = this.props;
    const {call} = chatCallStatus;
    const {uiElements} = call;
    if (uiElements) {
      const remoteVideoTag = ReactDOM.findDOMNode(this.remoteVideoRef.current);
      const localVideoTag = ReactDOM.findDOMNode(this.localVideoRef.current);
      const {
        remoteVideo,
        localVideo,
        screenShareVideo,
        isScreenSharing,
      } = this._getTags(call, user);
      screenShareVideo && fixVideoTag(screenShareVideo, style.CallBoxScenePersonVideo__SideCamVideo);
      remoteVideo && fixVideoTag(remoteVideo, isScreenSharing ? style.CallBoxScenePersonVideo__SideCamVideo : style.CallBoxScenePersonVideo__MainCamVideo);
      localVideo && fixVideoTag(localVideo, style.CallBoxScenePersonVideo__SideCamVideo);
      if (isScreenSharing) {
        const remoteVideoInScreenSharingRef = ReactDOM.findDOMNode(this.remoteVideoInScreenSharingRef.current);
        screenShareVideo && remoteVideoTag.append(screenShareVideo);
        if(isVideoCall(call)) {
          localVideo && localVideoTag.append(localVideo);
          remoteVideo && remoteVideoInScreenSharingRef.append(remoteVideo);
        }
      } else {
        localVideo && localVideoTag.append(localVideo);
        remoteVideo && remoteVideoTag.append(remoteVideo);
      }
    }
  }

  componentDidMount() {
    this._injectVideos();
  }

  componentWillUnmount() {
    const {user, chatCallStatus} = this.props;
    const {call} = chatCallStatus;
    const {uiElements} = call;
    if (uiElements) {
      const {video: remoteVideo} = isScreenShare(call) ? uiElements.screenShare : findRemoteStreams(user, call.otherClientDtoList, uiElements);
      const {video: localVideo} = findLocalStreams(user, uiElements);
      const callDivTag = document.getElementById(CALL_DIV_ID);
      callDivTag.append(remoteVideo);
      callDivTag.append(localVideo);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {call: oldCall} = prevProps.chatCallStatus;
    const {call} = this.props.chatCallStatus;
    if (oldCall) {
      if (!oldCall.uiRemoteElements) {
        this._injectVideos();
      }
    }
  }

  render() {
    const {chatCallStatus, chatCallBoxShowing, user, chatCallParticipantList} = this.props;
    const {status, call} = chatCallStatus;
    const fullScreenCondition = chatCallBoxShowing.showing === CHAT_CALL_BOX_FULL_SCREEN || mobileCheck();
    const sideUserFromParticipantList = chatCallParticipantList.find(participant => user.id !== participant.id);
    const isScreenSharing = isScreenShare(call);

    const classNames = classnames({
      [style.CallBoxScenePersonVideo]: true,
      [style["CallBoxScenePersonVideo--fullScreen"]]: fullScreenCondition
    });

    const callBoxSceneCamContainerClassName = classnames({
      [style.CallBoxScenePersonVideo__Cams]: true,
      [style["CallBoxScenePersonVideo__Cams--fullScreen"]]: fullScreenCondition,
      [style["CallBoxScenePersonVideo__Cams--fullWidth"]]: fullScreenCondition && isScreenSharing
    });

    return <Container className={classNames}>
      <Container className={callBoxSceneCamContainerClassName}>
        <Container className={style.CallBoxScenePersonVideo__MainCam} ref={this.remoteVideoRef}>
          <Container className={style.CallBoxScenePersonVideo__MuteContainer}>
            {sideUserFromParticipantList && sideUserFromParticipantList.mute &&
            <MdMicOff size={style.iconSizeXs}
                      color={style.colorAccent}
                      style={{margin: "3px 4px"}}/>
            }
          </Container>
        </Container>
        {isVideoCall(call) &&
          <Container className={style.CallBoxScenePersonVideo__SideCams}>
            <Container className={style.CallBoxScenePersonVideo__SideCam} ref={this.localVideoRef}/>
            {isScreenSharing &&
            <Container className={style.CallBoxScenePersonVideo__SideCam} ref={this.remoteVideoInScreenSharingRef}/>
            }
          </Container>
        }
      </Container>
    </Container>
  }
}