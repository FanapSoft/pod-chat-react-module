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


@connect()
export default class CallBoxScenePersonVideo extends Component {

  constructor(props) {
    super(props);
    this.remoteVideoRef = React.createRef();
    this.localVideoRef = React.createRef();
  }

  _getTags(call, user) {
    const {uiElements} = call;
    const isVideoCalling = isVideoCall(call);
    const isScreenSharing = isScreenShare(call);
    const isScreenSharingOwnerIsMe = isScreenSharing && isScreenShareOwnerIsMe(call?.screenShare, user);
    const getRemoteVideoCamCondition = (isVideoCalling && isScreenSharing && isScreenSharingOwnerIsMe) || (!isScreenSharing && isVideoCalling);
    const getLocalVideoCamCondition = (isVideoCalling && isScreenSharing && !isScreenSharingOwnerIsMe) || (!isScreenSharing && isVideoCalling);
    const {video: remoteVideo} = getRemoteVideoCamCondition ?
      findRemoteStreams(user, call.otherClientDtoList, uiElements)
      :
      isScreenSharing ? uiElements.screenShare : {};
    const {video: localVideo} = getLocalVideoCamCondition ?
      findLocalStreams(user, uiElements)
      :
      isScreenSharing && !isVideoCalling ? {} : uiElements.screenShare;

    return {remoteVideo, localVideo, isScreenSharing, isScreenSharingOwnerIsMe, isVideoCalling}
  }

  _injectVideos() {
    const {user, chatCallStatus} = this.props;
    const {call} = chatCallStatus;
    const {uiElements} = call;
    if (uiElements) {
      const remoteVideoTag = ReactDOM.findDOMNode(this.remoteVideoRef.current);
      const localVideoTag = ReactDOM.findDOMNode(this.localVideoRef.current);
      const {remoteVideo, localVideo, isScreenSharing, isScreenSharingOwnerIsMe, isVideoCalling} = this._getTags(call, user);

      if (remoteVideo) {
        remoteVideo.setAttribute("class", style.CallBoxSceneVideo__SideCamVideo);
        remoteVideo.removeAttribute("height");
        remoteVideo.removeAttribute("width");
        remoteVideo.disablePictureInPicture = true;
      }
      if (localVideo) {
        localVideo.setAttribute("class", style.CallBoxSceneVideo__MyCamVideo);
        localVideo.removeAttribute("height");
        localVideo.removeAttribute("width");
        localVideo.disablePictureInPicture = true;
      }
      setTimeout(function () {
        remoteVideo && remoteVideoTag.append(remoteVideo);
        localVideo && localVideoTag.append(localVideo);
        if (isScreenSharing && isVideoCalling) {
          const callDivTag = document.getElementById(CALL_DIV_ID);
          if (isScreenSharingOwnerIsMe) {
            const {video} = findLocalStreams(user, uiElements);
            callDivTag.append(video);
          } else {
            const {video} = findRemoteStreams(user, call.otherClientDtoList, uiElements);
            callDivTag.append(video);
          }
        }
      }, 100);
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

    const classNames = classnames({
      [style.CallBoxSceneVideo]: true,
      [style["CallBoxSceneVideo--fullScreen"]]: fullScreenCondition
    });

    const callBoxSceneCamContainerClassName = classnames({
      [style.CallBoxSceneVideoCamContainer]: true,
      [style["CallBoxSceneVideoCamContainer--fullScreen"]]: fullScreenCondition,
      [style["CallBoxSceneVideoCamContainer--fullWidth"]]: fullScreenCondition && (isScreenShare(call) && !isScreenShareOwnerIsMe(call?.screenShare, user)),
    });

    return <Container className={classNames}>
      <Container className={callBoxSceneCamContainerClassName}>
        <Container className={style.CallBoxSceneVideo__SideCam} ref={this.remoteVideoRef}>
          <Container className={style.CallBoxSceneVideo__MuteContainer}>
            {sideUserFromParticipantList && sideUserFromParticipantList.mute &&
            <MdMicOff size={style.iconSizeXs}
                      color={style.colorAccent}
                      style={{margin: "3px 4px"}}/>
            }
          </Container>
        </Container>
        <Container className={style.CallBoxSceneVideo__MyCam} ref={this.localVideoRef}/>
      </Container>
    </Container>
  }
}