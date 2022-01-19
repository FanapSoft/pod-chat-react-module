import {
  CHAT_GET_INSTANCE,
  CHAT_MODAL_PROMPT_SHOWING,
  CHAT_SMALL_VERSION,
  CHAT_STATE,
  CHAT_ROUTER_LESS,
  CHAT_SEARCH_RESULT,
  CHAT_SEARCH_SHOW,
  CHAT_NOTIFICATION,
  CHAT_NOTIFICATION_CLICK_HOOK,
  CHAT_RETRY_HOOK,
  CHAT_SIGN_OUT_HOOK,
  CHAT_TYPING_HOOK,
  CHAT_AUDIO_PLAYER,
  CHAT_AUDIO_RECORDER,
  CHAT_SUPPORT_MODE,
  CHAT_SUPPORT_MODULE_BADGE_SHOWING,
  CHAT_CALL_BOX_SHOWING,
  CHAT_CALL_STATUS,
  CHAT_SELECT_PARTICIPANT_FOR_CALL_SHOWING,
  THREAD_PARTICIPANT_GET_LIST,
  THREAD_PARTICIPANTS_LIST_CHANGE,
  THREAD_PARTICIPANT_GET_LIST_PARTIAL,
  THREAD_PARTICIPANTS_REMOVED,
  THREAD_LEAVE_PARTICIPANT,
  CHAT_CALL_PARTICIPANT_LIST,
  CHAT_CALL_PARTICIPANT_LIST_CHANGE,
  CHAT_CALL_PARTICIPANT_LIST_PRELOAD,
  CHAT_CALL_PARTICIPANT_REMOVED,
  CHAT_CALL_PARTICIPANT_LEFT,
  CHAT_CALL_PARTICIPANT_JOINED, CHAT_CALL_GROUP_SETTINGS_SHOWING, CHAT_CALL_GROUP_VIDEO_VIEW_MODE, THREAD_CHANGED
} from "../constants/actionTypes";
import {listUpdateStrategyMethods, stateGenerator, stateGeneratorState, updateStore} from "../utils/storeHelper";
import {CHAT_CALL_BOX_NORMAL, CHAT_CALL_STATUS_INCOMING, CHAT_CALL_STATUS_OUTGOING} from "../constants/callModes";
import strings from "../constants/localization";

const {PENDING, SUCCESS, ERROR, CANCELED} = stateGeneratorState;

export const chatInstanceReducer = (state = {
  chatSDK: null,
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  switch (action.type) {
    case CHAT_GET_INSTANCE("PENDING"):
      return {...state, ...stateGenerator("PENDING")};
    case CHAT_GET_INSTANCE("SUCCESS"):
      return {...state, ...stateGenerator("SUCCESS", action.payload, "chatSDK")};
    case CHAT_GET_INSTANCE("ERROR"):
      return {...state, ...stateGenerator("ERROR", action.payload)};
    default:
      return state;
  }
};

export const chatSmallVersionReducer = (state = false, action) => {
  switch (action.type) {
    case CHAT_SMALL_VERSION:
      return action.payload;
    default:
      return state;
  }
};

export const chatSupportModeReducer = (state = false, action) => {
  switch (action.type) {
    case CHAT_SUPPORT_MODE:
      return action.payload;
    default:
      return state;
  }
};

export const chatSupportModuleBadgeShowingReducer = (state = true, action) => {
  switch (action.type) {
    case CHAT_SUPPORT_MODULE_BADGE_SHOWING:
      return action.payload;
    default:
      return state;
  }
};

export const chatSelectParticipantForCallShowingReducer = (state = {
  showing: false,
  headingTitle: null,
  selectiveMode: false,
  FooterFragment: null
}, action) => {
  switch (action.type) {
    case CHAT_SELECT_PARTICIPANT_FOR_CALL_SHOWING:
      if (!action.payload) {
        return {showing: false, headingTitle: null, selectiveMode: false, FooterFragment: null};
      }
      return action.payload;
    default:
      return state;
  }
};

export const chatCallBoxShowingReducer = (state = {showing: false, thread: null, contact: null}, action) => {
  switch (action.type) {
    case CHAT_CALL_BOX_SHOWING:
      return action.payload;
    case THREAD_CHANGED:
      if (state.thread?.id === action.payload.id) {
        console.log(action.payload)
        return {...state, thread: {...state.thread, ...action.payload}}
      }
    default:
      return state;
  }
};

export const chatCallGroupSettingsShowingReducer = (state = false, action) => {
  switch (action.type) {
    case CHAT_CALL_GROUP_SETTINGS_SHOWING:
      return action.payload;
    default:
      return state;
  }
};

export const chatCallGroupVideoViewModeReducer = (state = "grid"/*thumbnail*/, action) => {
  switch (action.type) {
    case CHAT_CALL_GROUP_VIDEO_VIEW_MODE:
      return action.payload;
    default:
      return state;
  }
};

export const chatCallParticipantListReducer = (state = {
  participants: [],
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  switch (action.type) {
    case CHAT_CALL_PARTICIPANT_LIST(PENDING):
      return {...state, ...stateGenerator(PENDING, {participants: state.participants})};
    case CHAT_CALL_PARTICIPANT_LIST_PRELOAD:
    case CHAT_CALL_PARTICIPANT_LIST(SUCCESS): {
      return {
        ...state, ...stateGenerator(SUCCESS, {participants: action.payload})
      };
    }
    case CHAT_CALL_PARTICIPANT_REMOVED:
    case CHAT_CALL_PARTICIPANT_LEFT:
      return {
        ...state, ...stateGenerator(SUCCESS, {
          participants: updateStore(state.participants, action.payload, {
            method: listUpdateStrategyMethods.REMOVE,
            by: ["id"]
          })
        })
      };
    case CHAT_CALL_PARTICIPANT_LIST_CHANGE:
    case CHAT_CALL_PARTICIPANT_JOINED:
      console.log(state.participants, action.payload)
      return {
        ...state, ...stateGenerator(SUCCESS, {
          participants: updateStore(state.participants, action.payload, {
            method: listUpdateStrategyMethods.UPDATE,
            mix: true,
            by: ["id"],
            upsert: true
          })
        })
      };
    case CHAT_CALL_PARTICIPANT_LIST(CANCELED):
      return {
        participants: [],
        fetching: false,
        fetched: false,
        error: false
      };
    case CHAT_CALL_PARTICIPANT_LIST(ERROR):
      return {...state, ...stateGenerator(ERROR, action.payload)};
    default:
      return state;
  }
};

export const chatCallStatusReducer = (state = {status: null, call: null}, action) => {
  switch (action.type) {
    case CHAT_CALL_STATUS:
      return action.payload;
    default:
      return state;
  }
};

export const chatRouterLessReducer = (state = false, action) => {
  switch (action.type) {
    case CHAT_ROUTER_LESS:
      return action.payload;
    default:
      return state;
  }
};

export const chatNotificationReducer = (state = true, action) => {
  switch (action.type) {
    case CHAT_NOTIFICATION:
      return action.payload;
    default:
      return state;
  }
};

export const chatNotificationClickHookReducer = (state = null, action) => {
  switch (action.type) {
    case CHAT_NOTIFICATION_CLICK_HOOK:
      return action.payload;
    default:
      return state;
  }
};

export const chatRetryHookReducer = (state = null, action) => {
  switch (action.type) {
    case CHAT_RETRY_HOOK:
      return action.payload;
    default:
      return state;
  }
};

export const chatSignOutHookReducer = (state = null, action) => {
  switch (action.type) {
    case CHAT_SIGN_OUT_HOOK:
      return action.payload;
    default:
      return state;
  }
};

export const chatTypingHookReducer = (state = null, action) => {
  switch (action.type) {
    case CHAT_TYPING_HOOK:
      return action.payload;
    default:
      return state;
  }
};

export const chatStateReducer = (state = false, action) => {
  switch (action.type) {
    case CHAT_STATE:
      return action.payload;
    default:
      return state;
  }
};

export const chatSearchShowReducer = (state = false, action) => {
  switch (action.type) {
    case CHAT_SEARCH_SHOW:
      return action.payload;
    default:
      return state;
  }
};

export const chatSearchResultReducer = (state = false, action) => {
  switch (action.type) {
    case CHAT_SEARCH_RESULT:
      if (action.payload.isShowing) {
        return action.payload;
      } else {
        return false;
      }
    default:
      return state;
  }
};

export const chatModalPromptReducer = (state = {
  isShowing: false,
  message: null,
  confirmText: null,
  onApply: e => {
  },
  onCancel: e => {
  }
}, action) => {
  switch (action.type) {
    case CHAT_MODAL_PROMPT_SHOWING:
      return action.payload;
    default:
      return state;
  }
};

export const chatAudioPlayerReducer = (state = null, action) => {
  switch (action.type) {
    case CHAT_AUDIO_PLAYER:
      return action.payload;
    default:
      return state;
  }
};


export const chatAudioRecorderReducer = (state = false, action) => {
  switch (action.type) {
    case CHAT_AUDIO_RECORDER:
      return action.payload;
    default:
      return state;
  }
};