import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import Timer from 'react-compound-timer'

//actions
import {
  chatCallBoxShowing,
  chatCallGroupSettingsShowing,
  chatCallBoxShowing as chatCallBoxShowingAction,
  chatSelectParticipantForCallShowing,
} from "../actions/chatActions";

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import {
  MdPersonAdd,
  MdExpandLess,
  MdFullscreen,
  MdFullscreenExit, MdGroup
} from "react-icons/md";

//styling
import style from "../../styles/app/CallBoxHead.scss";
import {
  CHAT_CALL_BOX_FULL_SCREEN, CHAT_CALL_BOX_NORMAL,
  CHAT_CALL_STATUS_INCOMING,
  CHAT_CALL_STATUS_STARTED, MAX_GROUP_CALL_COUNT
} from "../constants/callModes";
import strings from "../constants/localization";
import {
  isGroup,
  isParticipantVideoTurnedOn,
  isScreenShare,
  isScreenShareOwnerIsMe,
  isVideoCall,
  mobileCheck
} from "../utils/helpers";
import SelectParticipantForCallFooter from "./_component/SelectParticipantForCallFooter";

window.calltimer = 0;

@connect(store => {
  return {
    user: store.user.user,
    chatCallStatus: store.chatCallStatus,
    chatCallParticipantList: store.chatCallParticipantList.participants
  }
})
export default class CallBoxHead extends Component {

  constructor(props) {
    super(props);
    this.onDropCallClick = this.onDropCallClick.bind(this);
    this.onVolumeClick = this.onVolumeClick.bind(this);
    this.onMicClick = this.onMicClick.bind(this);
    this.onFullScreenClick = this.onFullScreenClick.bind(this);
    this.groupSettingView = this.groupSettingView.bind(this);
    this.onAddMember = this.onAddMember.bind(this);
    this.switchBetweenView = this.switchBetweenView.bind(this);
    this.state = {
      volume: true,
      mic: true
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {chatCallStatus} = this.props;
    const {chatCallStatus: oldChatCallStatus} = prevProps;
    const {status: oldStatus} = oldChatCallStatus;
    const {status} = chatCallStatus;
    if (oldStatus !== status) {
      if (oldStatus === CHAT_CALL_STATUS_STARTED) {
        window.calltimer = 0;
      }
    }
  }

  onDropCallClick(e) {
    e.stopPropagation();
    const {dispatch} = this.props;
    dispatch(chatCallBoxShowing(false, null, null));
  }

  onVolumeClick(e) {
    e.stopPropagation();
    this.setState({
      volume: !this.state.volume,
    })
  }

  onMicClick(e) {
    e.stopPropagation();
    this.setState({
      mic: !this.state.mic,
    })
  }

  switchBetweenView(e) {
    e.stopPropagation();
  }

  groupSettingView(e) {
    e.stopPropagation();
    this.props.dispatch(chatCallGroupSettingsShowing(true));
  }

  onFullScreenClick(e) {
    e.stopPropagation();
    const {dispatch, chatCallBoxShowing} = this.props;
    const {thread, contact} = chatCallBoxShowing;
    dispatch(chatCallBoxShowingAction(chatCallBoxShowing.showing === CHAT_CALL_BOX_FULL_SCREEN ? CHAT_CALL_BOX_NORMAL : CHAT_CALL_BOX_FULL_SCREEN, thread, contact));
  }

  onAddMember(e) {
    e.stopPropagation();
    const {chatCallBoxShowing, dispatch} = this.props;
    const {thread} = chatCallBoxShowing;
    return dispatch(chatSelectParticipantForCallShowing({
        thread,
        showing: true,
        selectiveMode: true,
        headingTitle: strings.addMember,
        FooterFragment: SelectParticipantForCallFooter
      },
    ));
  }

  render() {
    const {chatCallStatus, thread, chatCallBoxShowing, user, chatCallParticipantList} = this.props;
    const {status, call} = chatCallStatus;
    const incomingCondition = status === CHAT_CALL_STATUS_INCOMING;
    const callStarted = status === CHAT_CALL_STATUS_STARTED;
    const fullScreenCondition = chatCallBoxShowing.showing === CHAT_CALL_BOX_FULL_SCREEN || mobileCheck();
    const isMobileCondition = mobileCheck();
    const isVideoCallBool = ((isVideoCall(call) || isParticipantVideoTurnedOn(call, chatCallParticipantList)) || (isScreenShare(call) && (!isScreenShareOwnerIsMe(call.screenShare, user) || isGroup(thread))));
    const accentTextColorCondition = isVideoCallBool && callStarted ? "accent" : "";
    const invertTextColorCondition = (fullScreenCondition && !incomingCondition && !isVideoCallBool) || (isVideoCallBool && fullScreenCondition && !incomingCondition && !callStarted);
    return <Container className={style.CallBoxHead}>
      <Container className={style.CallBoxHead__StatusContainer}>
        <Text bold
              invert={invertTextColorCondition}
              color={accentTextColorCondition}
              size="sm">{incomingCondition ? strings.ringing(isVideoCallBool) : callStarted ? strings.callStarted : strings.calling(isVideoCallBool)}</Text>
        {callStarted &&
        <Timer
          formatValue={(value) => `${(value < 10 ? `0${value}` : value)}`}
          initialTime={window.calltimer}>
          {({getTime}) => {
            window.calltimer = getTime();
            return <Text size="xs" invert={invertTextColorCondition} color={accentTextColorCondition} bold>
              <Timer.Minutes/>:<Timer.Seconds/>
            </Text>
          }}
        </Timer>
        }
      </Container>
      <Container className={style.CallBoxHead__StatusIconContainer}>
        {(callStarted && thread) &&
        <Fragment>
          {
            isGroup(thread) ?
              <MdGroup size={style.iconSizeMd} color={style.colorAccent}
                       style={{marginLeft: "10px", cursor: "pointer"}}
                       onClick={this.groupSettingView}/> :
              <MdPersonAdd size={style.iconSizeMd} color={style.colorAccent}
                           style={{marginLeft: "10px", cursor: "pointer"}}
                           onClick={this.onAddMember}/>

          }

        </Fragment>

        }
        {!isMobileCondition &&
        <Fragment>
          {
            fullScreenCondition ?
              <MdFullscreenExit size={style.iconSizeMd} color={style.colorAccent} style={{marginLeft: "7px"}}
                                onClick={this.onFullScreenClick}/> :
              <MdFullscreen size={style.iconSizeMd} color={style.colorAccent} style={{marginLeft: "7px"}}
                            onClick={this.onFullScreenClick}/>
          }
        </Fragment>
        }

        <MdExpandLess size={style.iconSizeMd} color={style.colorAccent}
                      onClick={this.onCallBoxClick}/>

      </Container>

    </Container>
  }
}