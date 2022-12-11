import { Button, Typography, Row, Col, Input, Radio, Modal, Form, Empty} from "antd";
import {
    DeleteOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const { TextArea } = Input;
const { Paragraph } = Typography;

const Question = (props) => {
    const { onChange, onDelete, index, initialiseState, editing, auth } = props;
    const { t } = useTranslation();
    const [state, setState] = useState(
      initialiseState
    );

    const [ showNotesModal, setShowNotesModal ] = useState(false);

    const [ notesForm ] = Form.useForm()
   
    useEffect(() => {
      onChange(index, state);
      // eslint-disable-next-line
    }, [state,index]);

    /* Handle fast typers by deferring changes until typing is complete.*/
    let timer = null
    const deferStateChange = e => {

      clearTimeout(timer)
      timer = setTimeout(triggerChange, 1000)

      function triggerChange() {
        setState({...state, question: e.target.value})
      }
    }

        /* Opens and displays new Model for process editing. */ 
        const NotesModal = (props) => {
          const { t } = useTranslation();
          const form = props.form;
  
          if (showNotesModal){
            form.setFieldsValue({
                notes: state && state.notes,
            })
          }

          return (
          <Modal
              centered
              title={t("notes")}
              okText={t("send")}
              cancelText={t("back")}
              onOk={() => form.submit()}
              onCancel={() => {setShowNotesModal(false)}}
              {...props}
          >
              <Form
              name="complex-form-add"
              form={form}
              layout="vertical"
              onFinish={props.onFinish}
              >
              <Form.Item name="notes">
                  <TextArea autoSize showCount maxLength={200}/>
              </Form.Item>
              </Form>
          </Modal>
          );
      };
  
      function onNotesModalFinish(values){
        setState({...state, notes: values.notes})
        setShowNotesModal(false)
      }

      function NotesModalRO() {
        Modal.info({
          title: t("notes"),
          maskClosable: true,
          okType: "default",
          okText:t("back"),
          content: (
            <div>
              {state && state.notes === null ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span>{t("emptynotes")}</span>
              }/>
                ) : (
                  <span>{state.notes}</span>
                )}
            </div>
          ),
          onOk() {},
        });
      }

  
    return (
      <div style={{marginBottom:"1.5rem"}}>
        <h3 style={{marginBottom:"0.5rem"}} strong="false">{t("question")+" "+(index+1)}</h3>
        <Row>
          <Col span={editing ? 22 : 16} >
            <div style={{ display: "inline-flex", width: "100%" }}>
            {editing ? 
              <TextArea style={{marginBottom:"0px", width: "100%"}} size="large" autoSize onChange={(deferStateChange)} defaultValue={state.question} ></TextArea>
            :
              <Paragraph style={{marginBottom:"0px", fontSize:"18px"}} strong={false}>{state.question || ""}</Paragraph>
            }
            </div>
          </Col>
          {editing ? 
            <Col className="flex-center-row" span={2}>
                <Button type="text" icon={<DeleteOutlined style={{fontSize: "1.5rem"}}/>} 
                onClick={() => {
                    onDelete(index);
                    setState({
                    question: null,
                    value: null,
                    notes: null,
                    });
                }}
                />
            </Col>
          :
          <>
            <Col className="flex-center-row" span={6} style={auth === false ? {pointerEvents: "none"} : {}}>
              <Radio.Group onChange={(e) => {setState({...state, value: e.target.value })}} value={state.value}>
                <Radio value={1}>{t("yes")}</Radio>
                <Radio value={2}>{t("no")}</Radio>
                <Radio value={3}>{t("na")}</Radio>
              </Radio.Group>
            </Col>
            <Col className="flex-center-row" span={2}>
                <Button
                disabled={auth === false && state.notes === null ? true : false}
                onClick={() => {
                  if (auth === false){
                    NotesModalRO()
                  } else if (auth === true){
                    setShowNotesModal(true)
                  }                
                }}
                >{t("notes")}</Button> 
          </Col>
          </>
          }
          </Row>
          <NotesModal visible={showNotesModal} form={notesForm} onFinish={onNotesModalFinish} />
      </div>
    );
  
};

export default Question;