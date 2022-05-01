import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {isOwner} from "../utils/privilege";

//actions
import {
  chatCallAddParticipants,
  chatCallGroupSettingsShowing,
  chatCallMuteParticipants, chatCallParticipantListChange,
  chatCallRemoveParticipants,
  chatSelectParticipantForCallShowing
} from "../actions/chatActions";

//components
import Container from "../../../pod-chat-ui-kit/src/container";

import Modal, {ModalBody} from "../../../pod-chat-ui-kit/src/modal";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import {
  MdMic,
  MdMicOff,
  MdClose,
  MdCallEnd,
  MdAdd, MdPhone, MdAddCall
} from "react-icons/md";
import List from "../../../pod-chat-ui-kit/src/List";

//styling
import style from "../../styles/app/CallBoxSceneGroupParticipantsControl.scss";
import {CHAT_CALL_STATUS_STARTED, MAX_GROUP_CALL_COUNT,} from "../constants/callModes";
import {ContactListItem} from "./_component/contactList";
import classnames from "classnames";
import Gap from "raduikit/src/gap";
import strings from "../constants/localization";
import {checkForParticipantsStatus} from "../utils/helpers";
import SelectParticipantForCallFooter from "./_component/SelectParticipantForCallFooter";

@connect(store => {
  return {
    chatCallStatus: store.chatCallStatus,
    threads: store.threads.threads
  }
})
export default class CallBoxSceneGroupParticipantsControl extends Component {

  constructor(props) {
    super(props);
    this.onParticipantMuteClick = this.onParticipantMuteClick.bind(this);
    this.onParticipantRemoveClicked = this.onParticipantRemoveClicked.bind(this);
    this.onAddMember = this.onAddMember.bind(this);
    this.hideControl = this.hideControl.bind(this);
    this.callAgain = this.callAgain.bind(this);
    this.state = {}
  }

  onParticipantMuteClick(participant, e) {
    e.stopPropagation();
    const {chatCallStatus, user, dispatch} = this.props;
    if (!participant.mute) {
      dispatch(chatCallMuteParticipants(chatCallStatus.call.callId, [participant.id]));
    }
  }

  onParticipantRemoveClicked(participant) {
    const {chatCallStatus, dispatch} = this.props;
    dispatch(chatCallRemoveParticipants(chatCallStatus.call.callId, [participant.id]));
  }

  hideControl() {
    const {dispatch} = this.props;
    dispatch(chatCallGroupSettingsShowing(false));
  }

  callAgain(participant) {
    const {chatCallParticipantList, chatCallStatus, dispatch} = this.props;
    dispatch(chatCallAddParticipants(chatCallStatus.call.callId, [participant.contactId], [participant]));
    dispatch(chatCallParticipantListChange([{...participant, callStatus: 0}]));
    checkForParticipantsStatus.call(this, chatCallParticipantList);
  }

  onAddMember() {
    const {chatCallBoxShowing, dispatch} = this.props;
    const {thread} = chatCallBoxShowing;
    return dispatch(chatSelectParticipantForCallShowing({
        thread,
        showing: true,
        selectiveMode: true,
        headingTitle: strings.addMember,
        FooterFragment: SelectParticipantForCallFooter
      },
    ));
  }

  render() {
    const {chatCallParticipantList, chatCallBoxShowing, user, chatCallStatus, threads} = this.props;
    const {call, status} = chatCallStatus;
    const classNames = classnames({
      [style.CallBoxSceneGroupParticipantsControl]: true
    });
    let {thread} = chatCallBoxShowing;
    const isCallOwner = (call && call.isOwner) || isOwner(thread, user);
    thread = isCallOwner ? thread : threads.find(e => e.id === thread.id);
    const muteUnmutePermissionCondition = (isOwner(thread, user) || isCallOwner);
    return <Modal isOpen={true} wrapContent userSelect="none">

      <ModalBody>

        <Container className={classNames}>
          <Container className={style.CallBoxSceneGroupParticipantsControl__Head}>
            <Container className={style.CallBoxSceneGroupParticipantsControl__HeadText}>
              <Text bold
                    size="sm">{strings.peopleIsTalking(chatCallParticipantList.length)}
              </Text>
            </Container>

            {(thread.participantCount < MAX_GROUP_CALL_COUNT) &&
            <Container cursor="pointer">

              <MdAdd onClick={this.onAddMember}
                     size={style.iconSizeMd}
                     color={style.colorAccentDark}/>
              <Gap x={5}/>
            </Container>
            }

            <Container cursor="pointer">
              <MdClose onClick={this.hideControl}
                       size={style.iconSizeMd}
                       color={style.colorAccentDark}/>
            </Container>
          </Container>
          <List style={{overflowY: "auto"}}>
            {chatCallParticipantList.map(participant =>
              <ContactListItem invert
                               key={participant.id}
                               contact={participant}
                               AvatarTextFragment={({contact}) => {
                                 return <Text size="xs"
                                              color={contact.callStatus === 6 ? "green" : contact.callStatus === 4 ? "red" : "accent"}
                                              bold>
                                   {contact.callStatus === 6 ? strings.callStarted : contact.callStatus === 4 ? strings.notAnswered : strings.callingWithNoType}
                                 </Text>
                               }}
                               AvatarNameFragment={
                                 ({contact}) => {
                                   return contact.admin ?
                                     <Container className={style.ModalThreadInfoGroupSettingsAdminAdd__AdminDisable}
                                                onMouseDown={e => e.stopPropagation()}>
                                     </Container> : ""
                                 }
                               }
                               LeftActionFragment={
                                 ({contact}) => {
                                   return <Container style={{display: "flex", flexDirection: "row-reverse"}}>
                                     {status === CHAT_CALL_STATUS_STARTED &&
                                     <Container
                                       style={{
                                         margin: "3px 0",
                                         cursor: "pointer"
                                       }}>
                                       {contact.callStatus === 4 &&
                                       <MdAddCall size={style.iconSizeSm}
                                                  onClick={this.callAgain.bind(null, contact)}
                                                  color={style.colorAccentDark}
                                                  title={strings.callAgain}
                                                  style={{
                                                    cursor: "pointer",
                                                    margin: "3px 4px",
                                                  }}/>}
                                       {contact.mute ?
                                         <MdMicOff size={style.iconSizeSm}
                                                   color={style.colorGrayDark}
                                                   style={{
                                                     margin: "3px 4px",
                                                   }}/>
                                         :
                                         <MdMic size={style.iconSizeSm}
                                                onClick={this.onParticipantMuteClick.bind(this, contact)}
                                                color={style.colorAccentDark}
                                                style={{
                                                  margin: "3px 4px",
                                                }}/>}

                                     </Container>
                                     }
                                     {/*                                     {isCallOwner &&
                                     <Container
                                       style={{margin: "3px 0", cursor: "pointer"}}
                                       color={style.colorRedDark}
                                       onClick={this.onParticipantRemoveClicked.bind(this, contact)}>
                                       <MdCallEnd size={style.iconSizeSm}
                                                  color={style.colorRed}
                                                  style={{
                                                    margin: "3px 4px"
                                                  }}/>
                                     </Container>
                                     }*/}
                                   </Container>

                                 }
                               }
                               contacts={chatCallParticipantList}/>
            )}
          </List>
        </Container>
      </ModalBody>
    </Modal>
      ;
  }
}


