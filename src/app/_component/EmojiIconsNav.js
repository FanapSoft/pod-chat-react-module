// src/list/BoxScene.jss
import React, {Component} from "react";
import ReactDOM from "react-dom";
import classnames from "classnames";
import Strings from "../../constants/localization";
import isElementVisible from "../../utils/dom";
import Cookies from "js-cookie";
import {emojiCookieName} from "../../constants/emoji";

//strings

//actions

//components
import Container from "../../../../pod-chat-ui-kit/src/container";
import {
  FaRegSmileBeam,
  FaRegClock,
  FaCity
} from "react-icons/fa";
import {
  GiFruitTree
} from "react-icons/gi";
import {
  IoIosBuild
} from "react-icons/io";
import {
  FiHash
} from "react-icons/fi";

//styling
import style from "../../../styles/modules/EmojiIconsNav.scss";

function haveFrequentlyUsed() {
  return !!Cookies.get(emojiCookieName);
}

export default class EmojiIconsNav extends Component {

  constructor(props) {
    super(props);
    this.scrollMoved = false;
    this.state = {
      currentActiveTab: "recent"
    }
  }

  handleNavScrollManipulations(scrollerRef) {
    const keys = Object.keys(Strings.emojiCatNames);
    keys.unshift('recent');
    for (const key of keys) {
      isElementVisible(document.getElementById(key), e => {
        if (!this.scrollMoved) {
          return;
        }
        this.setState({
          currentActiveTab: key
        });
      }, {root: ReactDOM.findDOMNode(scrollerRef.current)}, key === "recent" ? () => {
        this.setState({
          currentActiveTab: 'people'
        });
      } : null)
    }
  }

  onScroll(e, target) {
    this.scrollMoved = true;
  }

  onNavClick(currentActiveTab) {
    document.getElementById(currentActiveTab).scrollIntoView();
  }

  render() {
    const {currentActiveTab} = this.state;
    const classNames = classnames({
      [style.EmojiIconsNav]: true
    });
    const itemClassNames = classnames({
      [style.EmojiIconsNav__Item]: true
    });
    const iconsConfig = (nav) => ({
      size: style.iconSizeMd,
      color: nav === currentActiveTab ? style.colorAccent : style.colorBackgroundDark
    });
    const correctEmojiCatName = [
      {nav: "people", icon: <FaRegSmileBeam {...iconsConfig("people")}/>},
      {nav: "nature", icon: <GiFruitTree {...iconsConfig("nature")}/>},
      {nav: "things", icon: <IoIosBuild {...iconsConfig("things")}/>},
      {nav: "cityAndTraffic", icon: <FaCity {...iconsConfig("cityAndTraffic")}/>},
      {nav: "numbersClockAndLang", icon: <FiHash {...iconsConfig("numbersClockAndLang")}/>},
    ];
    if (haveFrequentlyUsed()) {
      correctEmojiCatName.unshift({nav: "recent", icon: <FaRegClock {...iconsConfig("recent")}/>});
    }
    return (
      <Container className={classNames}>
        {
          correctEmojiCatName.map(correctEmojiCat => (
            <Container className={itemClassNames}
                       onClick={this.onNavClick.bind(this, correctEmojiCat.nav)}>
              {correctEmojiCat.icon}
              {correctEmojiCat.nav === currentActiveTab &&
              <Container className={style.EmojiIconsNav__ActiveItem}/>}
            </Container>
          ))
        }
      </Container>
    )
  }
}