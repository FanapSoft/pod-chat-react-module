import React, {Component} from "react";
import {connect} from "react-redux";
import Cookies from "js-cookie";

//actions
import {threadCreateWithExistThread, threadGoToMessageId} from "../actions/threadActions";
import {
  chatAcceptCall,
  chatAudioPlayer,
  chatCallBoxShowing, chatCallMuteParticipants,
  chatCallStatus, chatCallUnMuteParticipants,
  chatRejectCall
} from "../actions/chatActions";

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import List, {ListItem} from "../../../pod-chat-ui-kit/src/list";

import Gap from "../../../pod-chat-ui-kit/src/gap";
import Modal, {ModalBody, ModalHeader, ModalFooter} from "../../../pod-chat-ui-kit/src/modal";
import {
  MdCall,
  MdMicOff,
  MdRingVolume,
  MdVolumeUp,
  MdMic,
  MdVideocam,
  MdMoreHoriz,
  MdViewQuilt,
  MdFeaturedVideo,
  MdViewCarousel,
  MdPause
} from "react-icons/md";

//styling
import style from "../../styles/app/CallBoxControlSetMore.scss";
import {getMessageMetaData, isVideoCall, mobileCheck} from "../utils/helpers";
import {
  CALL_DIV_ID, CALL_SETTING_COOKIE_KEY_NAME,
  CHAT_CALL_BOX_NORMAL,
  CALL_SETTINGS_CHANGE_EVENT,
  CHAT_CALL_STATUS_INCOMING,
  CHAT_CALL_STATUS_STARTED, GROUP_VIDEO_CALL_VIEW_MODE
} from "../constants/callModes";
import classnames from "classnames";
import {getParticipant} from "./ModalThreadInfoPerson";
import strings from "../constants/localization";
import {emojiCookieName} from "../constants/emoji";


@connect(store => {
  return {
    chatCallStatus: store.chatCallStatus,
    user: store.user.user,
    chatCallParticipantList: store.chatCallParticipantList.participants
  }
})
export default class CallBoxControlSetMore extends Component {

  constructor(props) {
    super(props);
    this.ringToneConfigClick = this.ringToneConfigClick.bind(this);
    this.onCallToneClick = this.onCallToneClick.bind(this);
    this.onViewModeClick = this.onViewModeClick.bind(this);
    this.onClose = this.onClose.bind(this);
    const currentSettings = JSON.parse(Cookies.get(CALL_SETTING_COOKIE_KEY_NAME) || "{}");
    this.state = {
      ringToneSound: currentSettings.hasOwnProperty("ringToneSound") ? currentSettings.ringToneSound : true,
      callToneSound: currentSettings.hasOwnProperty("callToneSound") ? currentSettings.callToneSound : true,
      groupVideoCallMode: currentSettings.hasOwnProperty("groupVideoCallMode") ? currentSettings.groupVideoCallMode : GROUP_VIDEO_CALL_VIEW_MODE.GRID_VIEW
    };
    this.event = new CustomEvent(CALL_SETTINGS_CHANGE_EVENT, {detail: this.state});
    window.dispatchEvent(this.event);
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState, snapshot) {

  }

  setSetting(key, value) {
    const nextState = value || !this.state[key];
    let currentSettings = Cookies.get(CALL_SETTING_COOKIE_KEY_NAME);
    if (currentSettings) {
      currentSettings = JSON.parse(currentSettings);
    } else {
      currentSettings = {};
    }
    currentSettings[key] = nextState;
    Cookies.set(CALL_SETTING_COOKIE_KEY_NAME, JSON.stringify(currentSettings), {expires: 9999999999});
    this.setState({
      [key]: nextState
    });
    this.event = new CustomEvent(CALL_SETTINGS_CHANGE_EVENT, {detail: currentSettings});
    window.dispatchEvent(this.event);
  }

  ringToneConfigClick() {
    this.setSetting("ringToneSound");
  }

  onCallToneClick() {
    this.setSetting("callToneSound");
  }

  onViewModeClick() {
    this.setSetting("groupVideoCallMode", this.state["groupVideoCallMode"] === GROUP_VIDEO_CALL_VIEW_MODE.GRID_VIEW ? GROUP_VIDEO_CALL_VIEW_MODE.THUMBNAIL_VIEW : GROUP_VIDEO_CALL_VIEW_MODE.GRID_VIEW);
  }

  onClose(e) {
    const {onMoreActionClick} = this.props;
    onMoreActionClick(false);
  }

  render() {
    const {chatCallStatus, buttonSize} = this.props;
    const {ringToneSound, callToneSound, groupVideoCallMode} = this.state;
    const {status, call} = chatCallStatus;
    const incomingCondition = status === CHAT_CALL_STATUS_INCOMING;
    const settingItemClassNames = classnames({
      [style.CallBoxControlSetMore__SettingItemContainer]: true
    });

    return <Modal isOpen={true} wrapContent userSelect="none" onClose={this.onClose} onClick={e=>e.stopPropagation()}>

      <ModalBody>
        <List>
          <ListItem selection invert onSelect={this.onViewModeClick}>

            <Container className={settingItemClassNames}>

              <Container className={style.CallBoxControlSetMore__SettingItemText}>
                <MdFeaturedVideo size={style.iconSizeMd} color={style.colorGrayDark}/>
                <Gap x={20}>
                  <Text>{strings.viewModeConfig}</Text>
                </Gap>
              </Container>

              <Container className={style.CallBoxControlSetMore__SettingItemStatus}>
                {groupVideoCallMode === GROUP_VIDEO_CALL_VIEW_MODE.THUMBNAIL_VIEW ?
                  <MdViewCarousel size={style.iconSizeMd} color={style.colorGrayDark}/>
                  :
                  <MdViewQuilt size={style.iconSizeMd} color={style.colorGrayDark}/>
                }

              </Container>

            </Container>
          </ListItem>

          <ListItem selection invert onSelect={this.ringToneConfigClick}>

            <Container className={settingItemClassNames}>

              <Container className={style.CallBoxControlSetMore__SettingItemText}>
                <MdRingVolume size={style.iconSizeMd} color={style.colorGrayDark}/>
                <Gap x={20}>
                  <Text>{strings.ringToneSound}</Text>
                </Gap>
              </Container>

              <Container className={style.CallBoxControlSetMore__SettingItemStatus}>
                <Text size="sm"
                      color={ringToneSound ? "green" : "red"}>{ringToneSound ? strings.active : strings.inActive}</Text>
              </Container>

            </Container>
          </ListItem>
          <ListItem selection invert onSelect={this.onCallToneClick}>

            <Container className={settingItemClassNames}>

              <Container className={style.CallBoxControlSetMore__SettingItemText}>
                <MdVolumeUp size={style.iconSizeMd} color={style.colorGrayDark}/>
                <Gap x={20}>
                  <Text>{strings.callToneSound}</Text>
                </Gap>
              </Container>

              <Container className={style.CallBoxControlSetMore__SettingItemStatus}>
                <Text size="sm"
                      color={callToneSound ? "green" : "red"}>{callToneSound ? strings.active : strings.inActive}</Text>
              </Container>

            </Container>
          </ListItem>
        </List>
      </ModalBody>
    </Modal>
  }
}