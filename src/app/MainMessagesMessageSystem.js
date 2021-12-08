// src/list/BoxSceneMessagesText
import React, {Component} from "react";
import "moment/locale/fa";
import {connect} from "react-redux";
import {
  analyzeCallStatus
} from "../utils/helpers";

//strings

//actions

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import MainMessagesMessageBox from "./MainMessagesMessageBox";
import MainMessagesMessageBoxHighLighter from "./MainMessagesMessageBoxHighLighter";

//styling
import style from "../../styles/app/MainMessagesText.scss";
import systemMessageStyle from "../../styles/app/MainMessagesMessageSystem.scss";


@connect()
export default class MainMessagesMessageText extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const {
      isMessageByMe,
      isFirstMessage,
      message,
      highLightMessage,
      isChannel,
      isGroup,
      ref,
      user,
      thread
    } = this.props;
    const AnalyzeResult = analyzeCallStatus(message, user, thread);
    if (!AnalyzeResult) {
      return ""
    }
    return (
      <Container className={style.MainMessagesText} ref={ref}>
        <MainMessagesMessageBox message={message}
                                isChannel={isChannel} isGroup={isGroup}
                                isFirstMessage={isFirstMessage} isMessageByMe={isMessageByMe}>
          <MainMessagesMessageBoxHighLighter message={message} highLightMessage={highLightMessage}/>
          <Container userSelect="none" className={systemMessageStyle.MainMessagesMessageSystem__TextContainer}>
            <AnalyzeResult.Icon/>
            <Text isHTML wordWrap="breakWord" whiteSpace="preWrap" color="text" dark size="sm">
              {AnalyzeResult.Text()}
            </Text>
          </Container>
        </MainMessagesMessageBox>
      </Container>
    );
  }
}