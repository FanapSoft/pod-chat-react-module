import React, {Component} from "react";
import {connect} from "react-redux";
import CallBoxSceneGroupVoiceParticipants from "./CallBoxSceneGroupVoiceParticipants";

@connect()
export default class CallBoxSceneGroupVoice extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const {chatCallBoxShowing} = this.props;
    return <CallBoxSceneGroupVoiceParticipants chatCallBoxShowing={chatCallBoxShowing}/>
  }
}