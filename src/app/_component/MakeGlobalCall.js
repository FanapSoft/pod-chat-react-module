import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";

//strings
import strings from "../../constants/localization";
import {CHAT_CALL_BOX_NORMAL, MAX_GROUP_CALL_COUNT} from "../../constants/callModes";


//actions
import {
  chatCallBoxShowing,
  chatCallGetParticipantList,
  chatSelectParticipantForCallShowing, chatStartGroupCall
} from "../../actions/chatActions";

//UI components
import {Button} from "../../../../pod-chat-ui-kit/src/button"
import Container from "../../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../../pod-chat-ui-kit/src/typography";
import {MdPhone} from "react-icons/md";

//styling
import style from "../../../styles/utils/ghost.scss";
import {threadCreateWithExistThread} from "../../actions/threadActions";
import {checkForParticipantsStatus} from "../../utils/helpers";


@connect(store => {
  return {
    user: store.user.user,
    chatCallStatus: store.chatCallStatus
  };
}, null, null, {forwardRef: true})
export default class MakeGlobalCall extends Component {

  constructor(props) {
    super(props);
    this.onMakeCall = this.onMakeCall.bind(this);
    this._selectParticipantForCallFooterFragment = this._selectParticipantForCallFooterFragment.bind(this);
  }

  _selectParticipantForCallFooterFragment(callType, mode, {selectedContacts, allContacts}) {
    const {dispatch, user} = this.props;
    const isMaximumCount = (selectedContacts && selectedContacts.length > MAX_GROUP_CALL_COUNT - 1);
    return <Container>
      <Container>
        {(selectedContacts && selectedContacts.length >= 1) &&
        <Button disabled={isMaximumCount} color={isMaximumCount ? "gray" : "accent"} onClick={e => {
          if (isMaximumCount) {
            return;
          }
          dispatch(chatSelectParticipantForCallShowing(false));
          let selectedParticipants = allContacts.filter(e => selectedContacts.indexOf(e.id) > -1);
          const invitees = selectedParticipants.map(e => ({id: e.id, idType: mode === "CONTACT" ? "TO_BE_USER_CONTACT_ID" : "TO_BE_USER_ID"}));
          dispatch(chatStartGroupCall(null, invitees, callType || "VOICE", null, result => {
            selectedParticipants.push(user);
            if (mode === "CONTACT") {
              selectedParticipants = selectedParticipants.map(participant => (participant.id === user.id ? participant : {...participant, ...participant.linkedUser, id: participant.userId, contactId: participant.id}));
            }
            dispatch(threadCreateWithExistThread(result));
            dispatch(chatCallBoxShowing(CHAT_CALL_BOX_NORMAL, result));
            dispatch(chatCallGetParticipantList(null, selectedParticipants));
            checkForParticipantsStatus.call(this, selectedParticipants);
          }));
        }}>{strings.call}</Button>
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

  onMakeCall(callType, params) {
    return this.props.dispatch(chatSelectParticipantForCallShowing({
        showing: true,
        selectiveMode: true,
        headingTitle: strings.forCallPleaseSelectContacts,
        FooterFragment: this._selectParticipantForCallFooterFragment.bind(this, callType),
        ...params
      },
    ));
  }

  render() {
    const {noRender} = this.props;
    if (noRender) {
      return null;
    }
    return (<Container onClick={this.onMakeCall.bind(this, "VOICE")}>
      <MdPhone size={style.iconSizeMd} color={style.colorWhite}/>
    </Container>)
  }
}