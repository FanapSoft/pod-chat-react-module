import React from "react";
import {BrowserRouter} from "react-router-dom";
import ReactDOM from "react-dom/client";
import {Provider} from "react-redux";
import {serverConfig} from "./constants/connection";
import store from "./store/index";
import "../styles/main.scss";
import "../styles/layout/defualt.scss";
import Index from "./app";
import {auth, retry} from "podauth/src/auth";
import SupportModule from "./app/SupportModule";

function renderPodchat(token) {
  const root = ReactDOM.createRoot(document.getElementById("app"));
  root.render(<Provider store={store}>
    <BrowserRouter>
      <SupportModule>
        <Index token={token} {...serverConfig(true)} onRetryHook={e => {
          return retry();
        }}/>
      </SupportModule>
    </BrowserRouter>
  </Provider>);
}

auth({
  clientId: "88413l69cd4051a039cf115ee4e073",
  scope: "social:write",
  ssoBaseUrl: "https://accounts.pod.ir/oauth2",
  onNewToken: renderPodchat
});


function DestroyPodchat(elementId) {
  ReactDOM.unmountComponentAtNode(document.getElementById(elementId));
}

window.DestroyPodchat = DestroyPodchat;
window.RenderPodchat = renderPodchat;