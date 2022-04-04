import React from "react";
import ReactDOM from "react-dom/client";
import {Provider} from "react-redux";
import store from "./store/index";
import "../styles/main.scss";
import Index from "./app";
import {BrowserRouter} from "react-router-dom";
import SupportModule from "./app/SupportModule";


function PodchatJSX(props) {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <SupportModule supportMode={props && props.supportMode}>
          <Index {...props}/>
        </SupportModule>
      </BrowserRouter>
    </Provider>
  );
}

function Podchat(props, elementId) {
  let instance;

  const root = ReactDOM.createRoot(document.getElementById(elementId));
  root.render(
    <Provider store={store}>
      <BrowserRouter>
        <SupportModule supportMode={props && props.supportMode}>
          <Index {...props} wrappedComponentRef={e => instance = e}/>
        </SupportModule>
      </BrowserRouter>
    </Provider>)
  return instance;
}

function DestroyPodchat(elementId) {
  ReactDOM.unmountComponentAtNode(document.getElementById(elementId));
}

export {PodchatJSX, Podchat};

window.Podchat = Podchat;
window.DestroyPodchat = DestroyPodchat;