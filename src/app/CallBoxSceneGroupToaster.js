import React, {Component} from "react";
import {connect} from "react-redux";
import {toast, ToastContainer} from "react-toastify";
import {getName} from "./_component/contactList";
import strings from "../constants/localization";
import classnames from "classnames";

//actions

//components

//styling
import style from "../../styles/app/CallBoxSceneGroupToaster.scss";


const COMMON_TOAST_OPTIONS = {
  position: "bottom-center",
  autoClose: 2000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
  progress: undefined,
  containerId: "call-box-container",
  className: style.CallBoxSceneGroupToaster__Toast
}

@connect(store => {
  return {
    joined: store.chatCallParticipantJoined,
    left: store.chatCallParticipantLeft
  };
})
export default class CallBoxSceneGroup extends Component {

  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {joined, left} = this.props;
    if (joined.joinTime !== prevProps.joined.joinTime && joined.callStatus === 6) {
      toast.success(strings.participantJoinedToCall(getName(joined)), COMMON_TOAST_OPTIONS);
    }
    if (left.leaveTime !== prevProps.left.leaveTime) {
      toast.info(strings.participantLeftCall(getName(left)), COMMON_TOAST_OPTIONS);
    }
  }

  render() {
    const classNames = classnames({
      [style.CallBoxSceneGroupToaster]: true,
      [style["CallBoxSceneGroupToaster--VideoCall"]]: this.props.isVideoIncluded
    })
    return <ToastContainer
      enableMultiContainer
      position="bottom-center"
      containerId={COMMON_TOAST_OPTIONS.containerId}
      className={classNames}
      autoClose={1000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl
      pauseOnFocusLoss
      draggable
      pauseOnHover={false}
      closeButton={false}
    />;
  }
}