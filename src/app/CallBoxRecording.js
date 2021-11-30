import React from "react";

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import Avatar, {AvatarImage} from "../../../pod-chat-ui-kit/src/avatar";
import {Text} from "../../../pod-chat-ui-kit/src/typography";

//Styles
import style from "../../styles/app/CallBoxRecording.scss";
import {avatarNameGenerator, avatarUrlGenerator} from "../utils/helpers";

export default function ({call}) {
  return <Container>
    <Avatar>
      <AvatarImage src={avatarUrlGenerator(call.recording.image)}
                   customSize="20px"/>
    </Avatar>
    <Text>Is recording call</Text>

  </Container>
}