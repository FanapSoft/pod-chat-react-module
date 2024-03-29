import style from "../../styles/app/MainMessagesMessage.scss";
import strings from "../constants/localization";
import React from "react";

export default function SeenFragment({isMessageByMe, message, thread, onMessageSeenListClick, onRetry, onCancel, forceSeen}) {
  if (!isMessageByMe) {
    return null;
  }
  if (message.hasError) {
    return (
      <Container inline>
        <MdErrorOutline size={style.iconSizeXs} style={{margin: "0 5px"}}/>
        <Gap x={2}>
          <Container onClick={onRetry} inline>
            <Text size="xs" color="accent" linkStyle>{strings.tryAgain}</Text>
          </Container>
          <Gap x={5}/>
          <Container onClick={onCancel} inline>
            <Text size="xs" color="accent" linkStyle>{strings.cancel}</Text>
          </Container>
        </Gap>
        <Gap x={3}/>
      </Container>
    )
  }
  const isGroup = thread.group;
  const messageStatusIconSpecs = {
    color: style.colorGreenTick,
    size: 18,
    style: {margin: "0 5px"}
  };
  if (!message.id) {
    return <MdSchedule size={messageStatusIconSpecs.size} style={messageStatusIconSpecs.style}
                       color={messageStatusIconSpecs.color}/>
  }
  if (!isGroup) {
    if (message.seen || forceSeen) {
      return <MdDoneAll size={messageStatusIconSpecs.size} style={messageStatusIconSpecs.style}
                        color={messageStatusIconSpecs.color}/>
    }
  }
  return <MdDone className={isGroup ? style.MainMessagesMessage__SentIcon : ""}
                 size={messageStatusIconSpecs.size}
                 color={messageStatusIconSpecs.color}
                 style={{margin: "0 5px", cursor: isGroup ? "pointer" : "default"}}
                 onClick={isGroup ? onMessageSeenListClick : null}/>
}