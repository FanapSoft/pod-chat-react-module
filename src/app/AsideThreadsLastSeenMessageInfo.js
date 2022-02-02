import React from "react";
import {useDispatch} from "react-redux";
import {prettifyMessageDate} from "../utils/helpers";

import Container from "../../../pod-chat-ui-kit/src/container";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import {Button} from "../../../pod-chat-ui-kit/src/button";
import {
  MdDoneAll,
  MdDone
} from "react-icons/md";

import style from "../../styles/app/AsideThreadsLastSeenMessageInfo.scss";
import {chatCallJoin} from "../actions/chatActions";
import strings from "../constants/localization";

export default function ({isGroup, isChannel, time, lastMessageVO, draftMessage, isMessageByMe, thread}) {
  const dispatch = useDispatch();
  const {call} = thread
  const onJoinCall = e => {
    e.stopPropagation()
    dispatch(chatCallJoin(call));
  }
  return <Container topLeft className={style.AsideThreadsLastSeenMessageInfo}>
    {
      lastMessageVO && !isGroup && !isChannel && isMessageByMe &&
      <>
        {draftMessage ? "" : (
          lastMessageVO.seen ?
            <MdDoneAll size={style.iconSizeSm} color={style.colorAccent}/> :
            <MdDone size={style.iconSizeSm} color={style.colorAccent}/>
        )}
        <Gap x={3}/>
      </>
    }
    <Text size="xs"
          color="gray">{prettifyMessageDate(time || lastMessageVO.time)}</Text>
    {
      call && <Button className={style.AsideThreadsLastSeenMessageInfo__JoinCallButton} size="sm" onMouseDown={e=>e.stopPropagation()} onClick={onJoinCall}>{strings.joinCall}</Button>
    }

  </Container>
}