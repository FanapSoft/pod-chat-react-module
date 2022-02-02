import React, {Fragment} from "react";
import {
  decodeEmoji,
  clearHtml,
  isMessageIsFile, isSystemMessage, isMessageByMe, analyzeCallStatus
} from "../utils/helpers";
import strings from "../constants/localization";
import Typing from "./_component/Typing";
import {sanitizeRule} from "./AsideThreads";

//UI components
import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import style from "../../styles/app/AsideThreadsLastSeenMessageText.scss";

export default function (props) {
  const {
    isGroup,
    isChannel,
    lastMessageVO,
    lastMessage,
    draftMessage,
    inviter,
    isTyping,
    isMessageByMe,
    thread
  } = props;
  const isFileReal = isMessageIsFile(lastMessageVO);
  const hasLastMessage = lastMessage || lastMessageVO;
  const isSystemMessageResult = lastMessageVO && isSystemMessage(lastMessageVO);
  const AnalyzeResult = isSystemMessageResult && analyzeCallStatus(lastMessageVO, isMessageByMe, thread);
  const isTypingReal = isTyping && isTyping.isTyping;
  const isTypingUserName = isTyping && isTyping.user.user;
  const AnalyzeCallFragment = () => AnalyzeResult &&
    (<Container userSelect="none" className={style.MainMessagesMessageSystem__CallStatus}>
      <AnalyzeResult.Icon/>
      <Text size="sm" inline color="gray" dark>
        {AnalyzeResult.Text()}
      </Text>
    </Container>)

  return (
    <Container> {
      isTypingReal ?
        <Typing isGroup={isGroup || isChannel} typing={isTyping}
                textProps={{size: "sm", color: "yellow", dark: true}}/>
        :
        draftMessage ?
          <Fragment>
            <Text size="sm" inline color="red" light>{strings.draft}:</Text>
            <Text size="sm"
                  inline
                  color="gray"
                  dark
                  isHTML>{clearHtml(draftMessage, true)}</Text></Fragment>
          :
          (
            isGroup && !isChannel ?
              AnalyzeResult ?
                <AnalyzeCallFragment/>
                :
                hasLastMessage ?
                  <Container display="inline-flex">

                    <Container>
                      <Text size="sm" inline
                            color="accent">{isTypingReal ? isTypingUserName : draftMessage ? "Draft:" : lastMessageVO.participant && (lastMessageVO.participant.contactName || lastMessageVO.participant.name)}:</Text>
                    </Container>

                    <Container>
                      {isFileReal ?
                        <Text size="sm" inline color="gray" dark>{strings.sentAFile}</Text>
                        :
                        <Text isHTML size="sm" inline color="gray"
                              sanitizeRule={sanitizeRule}
                              dark>{decodeEmoji(lastMessage, 30)}</Text>
                      }
                    </Container>

                  </Container>
                  :
                  <Text size="sm" inline
                        color="accent">{decodeEmoji(strings.createdAThread(inviter && (inviter.contactName || inviter.name), isGroup, isChannel), 30)}</Text>
              :
              hasLastMessage ? isFileReal ?
                  <Text size="sm" inline color="gray" dark>{strings.sentAFile}</Text>
                  :
                  <Fragment>
                    {AnalyzeResult ?
                      <AnalyzeCallFragment/>
                      :
                      <Text isHTML size="sm" inline color="gray"
                            sanitizeRule={sanitizeRule}
                            dark>{decodeEmoji(lastMessage, 30)}</Text>
                    }
                  </Fragment>

                :
                <Text size="sm" inline
                      color="accent">{decodeEmoji(strings.createdAThread(inviter && (inviter.contactName || inviter.name), isGroup, isChannel), 30)}</Text>
          )
    }
    </Container>
  )
}