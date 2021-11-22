import React, {Component} from "react";
import {connect} from "react-redux";
import {RangeDatePicker} from "jalali-react-datepicker/dist/index";

//strings
import strings from "../constants/localization";

//actions

//UI components
import {withRouter} from "react-router-dom";
import {threadExportMessagesShowing} from "../actions/threadActions";
import Text from "../../../pod-chat-ui-kit/src/typography/Text";
import Heading from "../../../pod-chat-ui-kit/src/typography/Heading";
import Modal, {ModalBody, ModalHeader} from "../../../pod-chat-ui-kit/src/modal";
import {Button, ButtonFloating} from "../../../pod-chat-ui-kit/src/button";
import Container from "../../../pod-chat-ui-kit/src/container";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import {MdDateRange} from "react-icons/md";
import Loading, {LoadingBlinkDots} from "../../../pod-chat-ui-kit/src/loading";

//styling
import style from "../../styles/app/ModalExportMessages.scss";
import {messageExport} from "../actions/messageActions";

@connect(store => {
  return {
    thread: store.thread.thread,
    threadExportMessagesShowing: store.threadExportMessagesShowing
  };
}, null, null, {forwardRef: true})
class ModalShare extends Component {

  constructor(props) {
    super(props);
    this.pickerRef = React.createRef();
    this.linkRef = React.createRef();
    this.openPicker = this.openPicker.bind(this);
    this.rangeSelected = this.rangeSelected.bind(this);
    this.state = {
      rangeSelected: null,
      loading: false
    }
  }

  componentDidMount() {

  }

  openPicker() {
    this.pickerRef.current.setState({isOpenModal: true})
  }

  rangeSelected(data) {
    this.setState({
      rangeSelected: data
    });
  }

  onClose() {
    this.setState({
      rangeSelected: null
    });
    this.props.dispatch(threadExportMessagesShowing(false));
  }

  onCancel() {
    this.setState({
      rangeSelected: null
    });
  }

  onExport() {
    const {rangeSelected} = this.state;
    const fromDateReadable = rangeSelected.start._d.toLocaleDateString('fa-US').replace(/\//g, "-");
    const toDateReadable = rangeSelected.end._d.toLocaleDateString('fa-US').replace(/\//g, "-");
    const {dispatch, thread} = this.props;
    this.setState({
      loading: true
    });
    dispatch(messageExport(thread.id, {
      fromTime: rangeSelected.start._d.getTime(),
      toTime: rangeSelected.end._d.getTime()
    })).then(e => {
      this.setState({
        rangeSelected: null,
        loading: false
      });
      const linkRef = this.linkRef.current;
      linkRef.href = window.URL.createObjectURL(e.result);
      linkRef.download =`talk-export-${fromDateReadable}-${toDateReadable}`;
      linkRef.click();
      window.URL.revokeObjectURL(e.result);
    });
  }

  render() {
    const {threadExportMessagesShowing} = this.props;
    const {rangeSelected, loading} = this.state;
    return <Modal isOpen={threadExportMessagesShowing}>

      <ModalHeader>
        <Heading h3>{strings.exportMessages}</Heading>
      </ModalHeader>

      <ModalBody>
        {rangeSelected ?
          <>
            <Container centerTextAlign>
              <Gap y={10}>
                <Text
                  bold>{strings.rangeSelectedFromDateToDate(rangeSelected.start._d.toLocaleDateString('fa'), rangeSelected.end._d.toLocaleDateString('fa'))}</Text>
              </Gap>
              {loading && <Loading><LoadingBlinkDots size="sm"/></Loading>}
            </Container>
            <Button text onClick={this.onExport.bind(this)}>{strings.export}</Button>
            <Button text onClick={this.onCancel.bind(this)}>{strings.cancel}</Button>
            <Button text onClick={this.onClose.bind(this)}>{strings.close}</Button>
          </>
          :
          <>
            <Text style={{textAlign: "center"}}>{strings.forExportingPleaseEnterDates}</Text>
            <Gap y={5}/>
            <Container className={style.ModalExportMessages__DatePicker}>
              <Container className={style.ModalExportMessages__DatePickerIcon} onClick={this.openPicker}>
                <ButtonFloating className={style.ModalExportMessages__DatePickerIconButton}>
                  <MdDateRange size={style.iconSizeMd} style={{margin: "7px 5px"}}/>
                </ButtonFloating>
              </Container>
              <RangeDatePicker ref={this.pickerRef} onClickSubmitButton={this.rangeSelected}/>
            </Container>
            <Gap y={10}/>
            <Button text onClick={this.onClose.bind(this)}>{strings.close}</Button>
            <a ref={this.linkRef} style={{display: "none"}} href=""/>
          </>
        }
      </ModalBody>
    </Modal>
  }
}

export default withRouter(ModalShare);