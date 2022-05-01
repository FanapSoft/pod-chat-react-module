import React from "react";

//actions
import {
  chatSelectParticipantForCallShowing,
  chatCallAddParticipants
} from "../../actions/chatActions";

//components
import Container from "../../../../pod-chat-ui-kit/src/container";
import {Button} from "../../../../pod-chat-ui-kit/src/button";
import {Text} from "../../../../pod-chat-ui-kit/src/typography";

//styling
import {MAX_GROUP_CALL_COUNT} from "../../constants/callModes";
import strings from "../../constants/localization";
import {useDispatch, useSelector} from "react-redux";

export default function (mode, {selectedContacts, allContacts}) {
  const chatCallStatus = useSelector(store => store.chatCallStatus);
  const chatCallBoxShowing = useSelector(store => store.chatCallBoxShowing);
  const dispatch = useDispatch();
  const {thread} = chatCallBoxShowing;
  const isMaximumCount = thread.participantCount + selectedContacts.length > MAX_GROUP_CALL_COUNT;
  return <Container>
    <Container>
      {(selectedContacts && selectedContacts.length >= 1) &&
      <Button disabled={isMaximumCount} color={isMaximumCount ? "gray" : "accent"} onClick={e => {
        if (isMaximumCount) {
          return;
        }
        const selectedParticipants = allContacts.filter(e => selectedContacts.indexOf(e.id) > -1).map(e => ({
          ...e,
          id: e.userId
        }))
        dispatch(chatSelectParticipantForCallShowing(false));
        dispatch(chatCallAddParticipants(chatCallStatus.call.callId, selectedContacts, selectedParticipants));
      }}>{strings.add}</Button>
      }
      <Button text onClick={() => dispatch(chatSelectParticipantForCallShowing(false))}>{strings.cancel}</Button>
    </Container>
    <Container>
      {
        isMaximumCount &&
        <Text color="accent">{strings.maximumNumberOfContactSelected}</Text>
      }
    </Container>
  </Container>
}