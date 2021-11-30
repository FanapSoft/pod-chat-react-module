// src/actions/messageActions.js
import {
  threadGetList,
  threadGoToMessageId,
  threadLeave,
  threadMessageGetList,
  threadMessageGetListPartial
} from "./threadActions";
import ChatSDK from "../utils/chatSDK";
import {stateGeneratorState} from "../utils/storeHelper";
import {getThreadHistory} from "../utils/listing";
import {
  CHAT_GET_INSTANCE,
  CHAT_SMALL_VERSION,
  CHAT_STATE,
  CHAT_MODAL_PROMPT_SHOWING,
  CHAT_ROUTER_LESS,
  CHAT_SEARCH_RESULT,
  CHAT_SEARCH_SHOW,
  THREAD_NEW,
  THREAD_CHANGED,
  THREAD_FILE_UPLOADING,
  THREAD_REMOVED_FROM,
  THREAD_PARTICIPANTS_LIST_CHANGE,
  THREADS_LIST_CHANGE,
  THREAD_LEAVE_PARTICIPANT,
  THREAD_GET_LIST,
  CHAT_STOP_TYPING,
  CHAT_IS_TYPING,
  CHAT_NOTIFICATION,
  CHAT_NOTIFICATION_CLICK_HOOK,
  CHAT_RETRY_HOOK,
  CHAT_SIGN_OUT_HOOK,
  THREAD_MESSAGE_PIN,
  MESSAGE_PINNED,
  THREAD_GO_TO_MESSAGE,
  THREAD_GET_MESSAGE_LIST,
  THREAD_CREATE,
  THREAD_GET_MESSAGE_LIST_PARTIAL,
  MESSAGE_SEND,
  CHAT_DESTROY,
  THREAD_THUMBNAIL_UPDATE,
  CHAT_AUDIO_PLAYER,
  CHAT_AUDIO_RECORDER,
  CHAT_SUPPORT_MODE,
  CHAT_SUPPORT_MODULE_BADGE_SHOWING,
  CHAT_CALL_BOX_SHOWING,
  CHAT_CALL_STATUS,
  CHAT_SELECT_PARTICIPANT_FOR_CALL_SHOWING,
  CHAT_CALL_PARTICIPANT_LIST_PRELOAD,
  THREAD_PARTICIPANT_GET_LIST_PARTIAL,
  THREAD_PARTICIPANT_GET_LIST,
  CHAT_CALL_PARTICIPANT_LIST,
  CHAT_CALL_PARTICIPANT_LEFT,
  CHAT_CALL_PARTICIPANT_JOINED,
  CHAT_CALL_PARTICIPANT_LIST_CHANGE,
  CHAT_CALL_GROUP_VIDEO_VIEW_MODE, CHAT_CALL_GROUP_SETTINGS_SHOWING
} from "../constants/actionTypes";
import {messageInfo} from "./messageActions";
import {THREAD_HISTORY_LIMIT_PER_REQUEST} from "../constants/historyFetchLimits";
import {
  CALL_DIV_ID,
  CHAT_CALL_BOX_NORMAL, CHAT_CALL_STATUS_DIVS,
  CHAT_CALL_STATUS_INCOMING,
  CHAT_CALL_STATUS_OUTGOING,
  CHAT_CALL_STATUS_STARTED
} from "../constants/callModes";
import {callParticipantStandardization} from "../utils/helpers";


let firstReadyPassed = false;

const {CANCELED, SUCCESS} = stateGeneratorState;
const typing = [];

function findInTyping(threadId, userId, remove) {
  let index = 0;
  for (const type of typing) {
    index++;
    if (type.user.userId === userId) {
      if (threadId === type.threadId) {
        if (remove) {
          return typing.splice(index, 1);
        }
        return type;
      }
    }
  }
  return {};
}

function resetChatCall(dispatch, call) {
  dispatch(chatCallStatus());
  dispatch(chatCallGroupSettingsShowing(false));
  if (call) {
    if (call.uiLocalVideo) {
      const {uiLocalVideo, uiLocalAudio} = call;
      uiLocalVideo.remove();
      uiLocalAudio.remove();
      for (const remoteTag of call?.uiRemoteElements) {
        remoteTag.uiRemoteAudio.remove();
        remoteTag.uiRemoteVideo.remove();
      }
    }
  }
  document.getElementById(CALL_DIV_ID).innerHTML = "";
  dispatch(chatCallGetParticipantList());
}

export const chatSetInstance = config => {
  return (dispatch, getState) => {
    dispatch({
      type: CHAT_GET_INSTANCE(),
      payload: null
    });
    new ChatSDK({
      config,
      onThreadEvents: (thread, type) => {

        switch (type) {
          case THREAD_NEW:
          case THREAD_PARTICIPANTS_LIST_CHANGE:
          case THREAD_LEAVE_PARTICIPANT:
          case THREADS_LIST_CHANGE:
            return dispatch({
              type: type,
              payload:
                type === THREAD_NEW ? {redirectToThread: thread.redirectToThread, thread: thread.result.thread}
                  :
                  type === THREADS_LIST_CHANGE ? thread.result.threads
                    :
                    type === THREAD_PARTICIPANTS_LIST_CHANGE ? {...thread.result, threadId: thread.threadId}
                      :
                      type === THREAD_LEAVE_PARTICIPANT ? {threadId: thread.threadId, id: thread.result.participant.id}
                        : thread
            });
          case "MESSAGE_UNPIN":
          case "MESSAGE_PIN": {
            const {thread: id, pinMessage} = thread.result;
            const isUnpin = type === "MESSAGE_UNPIN";
            if (!isUnpin) {
              if (pinMessage.notifyAll) {
                dispatch(messageInfo(id, pinMessage.messageId)).then(message => {
                  return dispatch({
                    type: MESSAGE_PINNED,
                    payload: message
                  });
                });
              }
            }
            return dispatch({
              type: THREAD_MESSAGE_PIN,
              payload: {id, pinMessageVO: isUnpin ? null : pinMessage}
            });
          }
          case THREAD_REMOVED_FROM:
            return dispatch(threadLeave(thread.result.thread, true));
          default:
            if (type === "THREAD_LAST_ACTIVITY_TIME") {
              return;
            }
            thread.changeType = type;
            if (thread.result) {
              if (!thread.result.thread) {
                return;
              }
              if (!thread.result.thread.id) {
                return;
              }
            }
            dispatch({
              type: THREAD_CHANGED,
              payload: thread.result ? thread.result.thread : thread
            });
        }
      },
      onMessageEvents: (message, type) => {
        const {thread} = getState().thread;

        if (window.document.hasFocus() && type === "MESSAGE_NEW") {
          if (thread) {
            if (thread.id !== message.threadId) {
              return;
            }
          }
        }
        (!message.uniqueId && message.id) && (message.uniqueId = message.id);
        dispatch({
          type: type,
          payload: message
        });
      },
      onCallEvents: (call, type) => {
        const oldCall = getState().chatCallStatus;
        const user = getState().user.user;
        switch (type) {
          case "CALL_SESSION_CREATED":
            call.isOwner = true;
            return dispatch(chatCallStatus(oldCall.status, call));
          case "CALL_PARTICIPANT_LEFT":
            return dispatch(chatCallParticipantLeft(callParticipantStandardization(call)));
          case "CALL_PARTICIPANT_JOINED":
            return dispatch(chatCallParticipantJoined(callParticipantStandardization(call)));
          case "CALL_PARTICIPANT_MUTE":
          case "CALL_PARTICIPANT_UNMUTE":
            return dispatch(chatCallParticipantListChange(callParticipantStandardization(call)));
          case "RECEIVE_CALL":
            dispatch(chatCallBoxShowing(CHAT_CALL_BOX_NORMAL, call.conversationVO || {}, call.creatorVO));
            return dispatch(chatCallStatus(CHAT_CALL_STATUS_INCOMING, call));
          case "CALL_STARTED": {
            const callId = call.clientDTO.desc.split("-")[1];
            call.isOwner = user.id === oldCall.call.creatorId;
            if (call.isOwner) {
              dispatch(chatCallGetParticipantList(callId, null, true)).then(participants => {
                const oldThreadParticipant = getState().chatCallParticipantList.participants;
                const newMap = oldThreadParticipant.map(participant => {
                  const found = participants.find(finded => {
                    if (participant.id === finded.id) {
                      finded.joined = true;
                      return finded;
                    }
                  });
                  if (found) {
                    return found;
                  }
                  return participant;
                });
                dispatch(chatCallGetParticipantList(callId, newMap));
              });
            } else {
              dispatch(chatCallGetParticipantList(callId));
            }
            return dispatch(chatCallStatus(CHAT_CALL_STATUS_STARTED, {callId, ...oldCall.call, ...call}))
          }
          case "CALL_ENDED":
            dispatch(chatCallBoxShowing(false));
            resetChatCall(dispatch, oldCall.call);
            return;
          case "CALL_DIVS":
            return dispatch(chatCallStatus(CHAT_CALL_STATUS_STARTED, {...oldCall.call, ...call}));
          case "START_SCREEN_SHARE":
            return dispatch(chatCallStatus(CHAT_CALL_STATUS_STARTED, {...oldCall.call, screenShare: {...call}}));
          case "END_SCREEN_SHARE":
            delete oldCall.call.screenShare;
            return dispatch(chatCallStatus(CHAT_CALL_STATUS_STARTED, {...oldCall.call}));
          default:
            break;
        }
      },
      onContactsEvents: (contacts, type) => {
        dispatch({
          type: type,
          payload: contacts
        });
      },
      onFileUploadEvents: message => {
        dispatch({
          type: THREAD_FILE_UPLOADING,
          payload: {...message, hasError: message.state === "UPLOAD_ERROR"}
        });
      },
      onSystemEvents: ({result, type}) => {
        if (type === "IS_TYPING") {
          const {thread: threadId, user} = result;
          const {threadId: oldThreadId, user: oldUser} = findInTyping(threadId, user.userId);

          if (oldThreadId) {
            const timeOutName = `${oldThreadId}${oldUser.userId}TimeOut`;
            clearTimeout(window[timeOutName]);
          } else {
            typing.push({threadId, user});
          }
          const timeOutName = `${threadId}${user.userId}TimeOut`;
          window[timeOutName] = setTimeout(() => {
            findInTyping(threadId, user.userId, true);
            dispatch({
              type: CHAT_STOP_TYPING,
              payload: {threadId, user}
            });
          }, 1500);
          const lastThread = getState().threads.threads.find(e => e.id === threadId);
          if (lastThread.isTyping && lastThread.isTyping.isTyping) {
            return;
          }
          return dispatch({
            type: CHAT_IS_TYPING,
            payload: {threadId, user}
          });
        }
        if (type === "SERVER_TIME") {
          window._universalTalkTimerDiff = Date.now() - result.time;
        }
      },
      onChatState(e) {
        dispatch({
          type: CHAT_STATE,
          payload: e
        });
      },
      onChatError(e) {

        if (e && e.code) {
          if (e.code === 208) {
            const event = new CustomEvent('podchat-error', {detail: e});
            document.body.dispatchEvent(event);
          }
          if (e.code === 21) {
            const {chatRetryHook, chatInstance} = getState();
            if (chatRetryHook) {
              chatRetryHook().then(token => {
                chatInstance.setToken(token);
                chatInstance.reconnect();
              });
            }
          }

        }
      },
      onChatReady(e) {
        if (firstReadyPassed) {
          dispatch(restoreChatState());
        }
        firstReadyPassed = true;
        dispatch({
          type: CHAT_GET_INSTANCE("SUCCESS"),
          payload: e
        })
      }
    });
  }
};

export const chatGetImage = (hashCode, size, quality, crop) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    return chatSDK.getImageFromPodspace(hashCode, size, quality, crop);
  }
};

export const chatGetFile = (hashCode, callBack, params) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    return chatSDK.getFileFromPodspace(hashCode, callBack, params);
  }
};

export const chatCancelFileDownload = (uniqueId) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    return chatSDK.cancelFileDownload(uniqueId)
  }
};

export const chatFileHashCodeUpdate = (payload, isCancel) => {
  return (dispatch) => {
    dispatch({
      type: isCancel ? CHAT_FILE_HASH_CODE_REMOVE : CHAT_FILE_HASH_CODE_UPDATE,
      payload
    });
  }
};

export const chatUploadImage = (image, threadId, callBack) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    chatSDK.uploadImage(image, threadId).then(callBack);
  }
};

export const chatDestroy = () => {
  return (dispatch) => {
    firstReadyPassed = false;
    dispatch({
      type: CHAT_DESTROY,
      payload: null
    });
  }
};

export const restoreChatState = () => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;

    const threads = state.threads.threads;
    dispatch(threadGetList(0, threads.length, null, true)).then(threads => {
      dispatch({
        type: THREAD_GET_LIST(SUCCESS),
        payload: threads
      });
    });

    const pastThread = state.thread.thread;
    if (pastThread.id && !pastThread.onTheFly) {
      chatSDK.getThreadInfo({threadIds: [pastThread.id]}).then(thread => {
        const {messages, threadId, hasNext, hasPrevious, fetching, fetched} = state.threadMessages;
        dispatch({
          type: THREAD_CREATE("CACHE"),
          payload: thread
        });
        const needToFetchSomethingCondition = (!pastThread.lastMessageVO && thread.lastMessageVO) || (pastThread.lastMessageVO.id !== thread.lastMessageVO.id);
        if (!needToFetchSomethingCondition) {
          return;
        }
        const lastMassage = messages[messages.length - 1];
        const firstInitial = !thread.lastMessageVO || (lastMassage && thread.lastMessageVO.time < lastMassage.time);
        const offsetOrTimeNanos = firstInitial ? undefined : lastMassage.time + 200;
        getThreadHistory(chatSDK, threadId, THREAD_HISTORY_LIMIT_PER_REQUEST, offsetOrTimeNanos, !firstInitial).then(payload => {
          const {messages} = payload;
          if (firstInitial) {
            dispatch({
              type: THREAD_GET_MESSAGE_LIST(SUCCESS),
              payload
            });
            threadGoToMessageId(messages[messages.length - 1]);
          } else {
            if (!hasNext) {
              return dispatch({
                type: THREAD_GET_MESSAGE_LIST_PARTIAL(SUCCESS),
                payload
              });
            }
          }

        })
      });
    }
  }
};

export const chatSmallVersion = isSmall => {
  return dispatch => {
    return dispatch({
      type: CHAT_SMALL_VERSION,
      payload: isSmall
    });
  }
};

export const chatSupportMode = isSupportMode => {
  return dispatch => {
    return dispatch({
      type: CHAT_SUPPORT_MODE,
      payload: isSupportMode
    });
  }
};

export const chatSupportModuleBadgeShowing = showing => {
  return dispatch => {
    return dispatch({
      type: CHAT_SUPPORT_MODULE_BADGE_SHOWING,
      payload: showing
    });
  }
};

export const chatCallBoxShowing = (showing, thread, contact) => {
  return dispatch => {
    return dispatch({
      type: CHAT_CALL_BOX_SHOWING,
      payload: {showing, thread, contact}
    });
  }
};

export const chatCallStatus = (status = null, call = null) => {
  return dispatch => {
    return dispatch({
      type: CHAT_CALL_STATUS,
      payload: {status, call}
    });
  }
};

export const chatCallMuteParticipants = (callId, userIds) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    chatSDK.muteCallParticipants(callId, userIds);
    dispatch(chatCallParticipantListChange(userIds.map(user => {
      return {id: user, mute: true}
    })));
  }
};

export const chatCallUnMuteParticipants = (callId, userIds) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    chatSDK.unMuteCallParticipants(callId, userIds);
    dispatch(chatCallParticipantListChange(userIds.map(user => {
      return {id: user, mute: false}
    })));
  }
};

export const chatCallRemoveParticipants = (callId, userIds) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    chatSDK.removeCallParticipants(callId, userIds).then(e => {
      dispatch({
        type: CHAT_CALL_PARTICIPANT_LEFT,
        payload: userIds
      });
    });
  }
};

export const chatCallAddParticipants = (callId, usernames, participants) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    if (participants) {
      chatSDK.addCallParticipants(callId, usernames).then(e => {
        dispatch({
          type: CHAT_CALL_PARTICIPANT_JOINED,
          payload: participants
        });
      });
    }
  }
};

export const chatCallGetParticipantList = (callId, payload, direct) => {
  return (dispatch, getState) => {
    if (!callId && !payload) {
      return dispatch({
        type: CHAT_CALL_PARTICIPANT_LIST(CANCELED)
      });
    }
    if (payload) {
      return dispatch({
        type: CHAT_CALL_PARTICIPANT_LIST_PRELOAD,
        payload
      });
    }
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    if (direct) {
      return chatSDK.getCallParticipants(callId);
    }
    dispatch({
      type: CHAT_CALL_PARTICIPANT_LIST(),
      payload: chatSDK.getCallParticipants(callId)
    });
  }
};

export const chatCallParticipantJoined = participant => {
  return dispatch => {
    participant.joined = true;
    dispatch({
      type: CHAT_CALL_PARTICIPANT_JOINED,
      payload: participant
    });
  }
};

export const chatCallParticipantLeft = (participantId) => {
  return (dispatch, getState) => {
    dispatch({
      type: CHAT_CALL_PARTICIPANT_LEFT,
      payload: participantId
    });
  }
};

export const chatCallParticipantListChange = participants => {
  return dispatch => {
    dispatch({
      type: CHAT_CALL_PARTICIPANT_LIST_CHANGE,
      payload: participants
    });
  }
};


export const chatAcceptCall = (call) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    chatSDK.acceptCall(call.callId);
    dispatch(chatCallStatus(CHAT_CALL_STATUS_STARTED, call));
  }
};

export const chatRejectCall = (call, status) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    if (status === CHAT_CALL_STATUS_STARTED) {
      chatSDK.endCall(call.callId);
    } else {
      if (call) {
        chatSDK.rejectCall(call.callId);
      }
    }
    resetChatCall(dispatch, call);
    dispatch(chatCallBoxShowing(false, null, null));
  }
};

export const chatStartCall = (threadId, type, params) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    chatSDK.startCall(threadId, type, params);
    dispatch(chatCallStatus(CHAT_CALL_STATUS_OUTGOING, null));
  }
};

export const chatSelectParticipantForCallShowing = data => {
  return dispatch => {
    return dispatch({
      type: CHAT_SELECT_PARTICIPANT_FOR_CALL_SHOWING,
      payload: data
    });
  }
};

export const chatStartGroupCall = (threadId, invitees, type, params) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    chatSDK.startGroupCall(threadId, invitees, type, params);
    dispatch(chatCallStatus(CHAT_CALL_STATUS_OUTGOING, {type: type === "video" ? 1 : 0}));
  }
};

export const chatCallStartScreenShare = () => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    if (state.chatCallStatus.call) {
      chatSDK.startScreenShare(state.chatCallStatus.call.callId);
    }
  }
};

export const chatCallEndScreenShare = () => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    if (state.chatCallStatus.call) {
      chatSDK.endScreenShare(state.chatCallStatus.call.callId);
    }
  }
};


export const chatCallGroupVideoViewMode = type => {
  return (dispatch, getState) => {
    dispatch({
      type: CHAT_CALL_GROUP_VIDEO_VIEW_MODE,
      payload: type
    });
  }
};

export const chatCallGroupSettingsShowing = showing => {
  return dispatch => {
    dispatch({
      type: CHAT_CALL_GROUP_SETTINGS_SHOWING,
      payload: showing
    });
  }
};

export const chatRouterLess = isRouterLess => {
  return dispatch => {
    return dispatch({
      type: CHAT_ROUTER_LESS,
      payload: isRouterLess
    });
  }
};

export const chatNotification = isNotification => {
  return dispatch => {
    return dispatch({
      type: CHAT_NOTIFICATION,
      payload: isNotification
    });
  }
};

export const chatNotificationClickHook = chatNotificationClickHook => {
  return {
    type: CHAT_NOTIFICATION_CLICK_HOOK,
    payload: thread => chatNotificationClickHook.bind(null, thread)
  }
};

export const chatRetryHook = chatRetryHookHook => {
  return {
    type: CHAT_RETRY_HOOK,
    payload: () => chatRetryHookHook
  }
};

export const chatSignOutHook = chatSignOutHookHook => {
  return {
    type: CHAT_SIGN_OUT_HOOK,
    payload: () => chatSignOutHookHook
  }
};

export const chatModalPrompt = (isShowing, message, onApply, onCancel, confirmText, customBody, extraMessage, noConfirmButton, noCancelButton) => {
  return dispatch => {
    return dispatch({
      type: CHAT_MODAL_PROMPT_SHOWING,
      payload: {
        isShowing,
        message,
        extraMessage,
        onApply,
        onCancel,
        confirmText,
        customBody,
        noConfirmButton,
        noCancelButton
      }
    });
  }
};

export const chatSearchResult = (isShowing, filteredThreads, filteredContacts) => {
  return dispatch => {
    return dispatch({
      type: CHAT_SEARCH_RESULT,
      payload: {
        isShowing,
        filteredThreads,
        filteredContacts
      }
    });
  }
};

export const chatSearchShow = isShow => {
  return dispatch => {
    return dispatch({
      type: CHAT_SEARCH_SHOW,
      payload: isShow
    });
  }
};

export const chatClearCache = () => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    chatSDK.clearCache();
  }
};

export const chatAudioPlayer = data => {
  return (dispatch, getState) => {
    const state = getState();
    const chatAudioPlayer = state.chatAudioPlayer;
    if (chatAudioPlayer) {
      const {player, message} = chatAudioPlayer;
      if (!data || data.message.id !== message.id) {
        player.stop();
      }
    }
    dispatch({
      type: CHAT_AUDIO_PLAYER,
      payload: data ? data : null
    });
  }
};
export const chatAudioRecorder = recording => {
  return (dispatch, getState) => {
    dispatch({
      type: CHAT_AUDIO_RECORDER,
      payload: recording
    });
  }
};

export const startTyping = threadId => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    chatSDK.startTyping(threadId);
  }
};

export const stopTyping = () => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    chatSDK.stopTyping();
  }
};