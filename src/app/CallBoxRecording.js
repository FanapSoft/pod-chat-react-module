import React from "react";

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import Avatar, {AvatarImage} from "../../../pod-chat-ui-kit/src/avatar";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import Gap from "../../../pod-chat-ui-kit/src/gap";

//Styles
import style from "../../styles/app/CallBoxRecording.scss";
import {avatarNameGenerator, avatarUrlGenerator} from "../utils/helpers";
import strings from "../constants/localization";

export default function ({call}) {
  return <Container className={style.CallBoxRecording}>
    <Avatar>
      <AvatarImage src={avatarUrlGenerator(call.recording.image, avatarUrlGenerator.SIZES.SMALL)}
                   customSize="20px"/>
    </Avatar>
    <Gap x={2}/>
    <Text size="xs" invert>{strings.isRecordingCallSession(call.recording.name)}</Text>
  </Container>
}