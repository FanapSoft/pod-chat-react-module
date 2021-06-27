import React, {Component} from "react";
import {connect} from "react-redux";
import Timer from 'react-compound-timer'

//actions
import {threadCreateWithExistThread, threadGoToMessageId} from "../actions/threadActions";
import {chatCallStatus as chatCallStatusAction, chatCallBoxShowing, chatRejectCall} from "../actions/chatActions";

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import {ButtonFloating} from "../../../pod-chat-ui-kit/src/button"
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import {
  MdExpandLess
} from "react-icons/md";

//styling
import style from "../../styles/app/CallBoxHead.scss";
import styleVar from "../../styles/variables.scss";
import {CHAT_CALL_STATUS_INCOMING, CHAT_CALL_STATUS_STARTED} from "../constants/callModes";
import strings from "../constants/localization";
import {isVideoCall} from "../utils/helpers";
window.calltimer = 0;

@connect(store => {
  return {
    chatCallStatus: store.chatCallStatus
  }
})
export default class CallBoxHead extends Component {

  constructor(props) {
    super(props);
    this.onDropCallClick = this.onDropCallClick.bind(this);
    this.onVolumeClick = this.onVolumeClick.bind(this);
    this.onMicClick = this.onMicClick.bind(this);
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

  render() {
    const {chatCallStatus} = this.props;
    const {status, call} = chatCallStatus;
    const incomingCondition = status === CHAT_CALL_STATUS_INCOMING;
    const callStarted = status === CHAT_CALL_STATUS_STARTED;
    const isVideoCallBool = (isVideoCall(call));
    return <Container className={style.CallBoxHead}>
      <Container className={style.CallBoxHead__StatusContainer}>
        <Text bold
              size="sm">{incomingCondition ? strings.ringing(isVideoCallBool) : callStarted ? strings.callStarted : strings.calling(isVideoCallBool)}</Text>
        {callStarted &&
        <Timer
          formatValue={(value) => `${(value < 10 ? `0${value}` : value)}`}
          initialTime={window.calltimer}>
          {({getTime}) => {
            window.calltimer = getTime();
            return <Text size="xs" color="accent" bold>
              <Timer.Minutes/>:<Timer.Seconds/>
            </Text>
          }}
        </Timer>
        }
      </Container>
      <Container>
        <MdExpandLess size={styleVar.iconSizeMd} color={styleVar.colorAccent} style={{margin: "-3px"}}
                      onClick={this.onCallBoxClick}/>
      </Container>

    </Container>
  }
}