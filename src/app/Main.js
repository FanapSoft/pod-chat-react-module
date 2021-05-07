// src/list/BoxScene.jss
import React, {Component} from "react";
import {connect} from "react-redux";
import {Route, withRouter} from "react-router-dom";
import {mobileCheck} from "../utils/helpers";

//strings
import {
  ROUTE_THREAD
} from "../constants/routes";

//actions
import {threadInit} from "../actions/threadActions";

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import MainHead from "./MainHead";
import MainMessages from "./MainMessages";
import MainFooter from "./MainFooter";
import MainPinMessage from "./MainPinMessage";
import MainIntro from "./MainIntro";
import MainAudioPlayer from "./MainAudioPlayer";
import MainCallBox from "./MainCallBox";
import MainCallBoxCompacted from "./MainCallBoxCompacted";

//styling
import style from "../../styles/app/Main.scss";
import coverImage from "../../styles/images/Main/cover.jpg";
import {CHAT_CALL_BOX_COMPACTED, CHAT_CALL_BOX_NORMAL} from "../constants/callModes";


@connect(store => {
  return {
    thread: store.thread.thread,
    threadFetching: store.thread.fetching,
    chatRouterLess: store.chatRouterLess,
    chatAudioPlayer: store.chatAudioPlayer,
    chatCallBoxShowing: store.chatCallBoxShowing
  };
})
class Main extends Component {

  constructor(props) {
    super(props);
    this.mainMessagesRef = React.createRef();
    this.mainCallBoxRef = React.createRef();
  }

  componentDidUpdate({location: oldLocation}) {
    const {location, dispatch} = this.props;
    if (mobileCheck()) {
      if (oldLocation.pathname !== "/") {
        if (location.pathname === "/") {
          dispatch(threadInit());
        }
      }
    }
  }

  render() {
    const {thread, chatRouterLess, threadFetching, chatAudioPlayer, history, chatCallBoxShowing} = this.props;
    const {id, pinMessageVO} = thread;
    const {showing: callBoxShowingType} = chatCallBoxShowing;

    if (!id && !threadFetching) {
      return (
        <Container className={style.Main}>
          <Container className={style.Main__Cover} style={{
            backgroundImage: `url("${coverImage}")`
          }}/>
          <MainIntro chatRouterLess={chatRouterLess} history={history}/>
          {
            callBoxShowingType &&
            callBoxShowingType === CHAT_CALL_BOX_COMPACTED &&
            <MainCallBoxCompacted chatCallBoxShowing={chatCallBoxShowing} mainCallBoxRef={this.mainCallBoxRef}/>
          }
          <MainCallBox chatCallBoxShowing={chatCallBoxShowing}  ref={this.mainCallBoxRef}/>
        </Container>
      )
    }

    return (
      <Route path={[ROUTE_THREAD, ""]}
             render={() => {
               return (
                 <Container className={style.Main}>
                   <Container className={style.Main__Cover} style={{
                     backgroundImage: `url("${coverImage}")`
                   }}/>
                   <MainHead thread={thread} chatRouterLess={chatRouterLess} history={history}/>
                   {
                     callBoxShowingType &&
                     callBoxShowingType === CHAT_CALL_BOX_COMPACTED &&
                     <MainCallBoxCompacted chatCallBoxShowing={chatCallBoxShowing} mainCallBoxRef={this.mainCallBoxRef}/>
                   }
                   {
                     chatAudioPlayer &&
                     <MainAudioPlayer thread={thread} chatAudioPlayer={chatAudioPlayer}/>
                   }
                   {
                     pinMessageVO &&
                     <MainPinMessage thread={thread} messageVo={pinMessageVO} mainMessageRef={this.mainMessagesRef}/>
                   }

                   <MainMessages thread={thread} ref={this.mainMessagesRef}/>
                   <MainFooter/>
                   <MainCallBox chatCallBoxShowing={chatCallBoxShowing}  ref={this.mainCallBoxRef}/>

                 </Container>
               )
             }}>
      </Route>
    );
  }
}

export default withRouter(Main);
