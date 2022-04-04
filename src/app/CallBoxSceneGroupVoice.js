import React, {Component} from "react";
import {connect} from "react-redux";
import CallBoxSceneGroupVoiceParticipants from "./CallBoxSceneGroupVoiceParticipants";

@connect()
export default class CallBoxSceneGroupVoice extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const {...other} = this.props;
    return <CallBoxSceneGroupVoiceParticipants {...other}/>
  }
}