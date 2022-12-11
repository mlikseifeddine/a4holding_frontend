import { Layout, Breadcrumb, Divider, Table, Button, Form, message, Input, Checkbox, Result, Row, Col, Modal, Spin, Alert } from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useLocation, useHistory } from "react-router-dom";
import { itemRender } from "../utils/utils.jsx";
import { useTranslation } from "react-i18next";
import CustomSider from "../components/CustomSider"
import Question from "../components/Question"
import { useState, useEffect } from 'react';
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import CustomHeader from '../components/CustomHeader';

const { Content, Footer} = Layout;

const EditControl = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const history = useHistory();

    // Desctructiring state with Spread operator ignores null and undefined, handling these cases for us and allowing for redirection.
    //https://github.com/tc39/proposal-object-rest-spread/blob/master/Spread.md
    const { controlid, society } = {...location.state}
    if (!location.state) history.push("/dashboard")

    const [ risks, setRisks ] = useState(null)
    const [ selectedRisks, setSelectedRisks ] = useState([])
    const [ questions, setQuestions ] = useState([]);
    const [ name, setName ] = useState();
    const [ description, setDescription ] = useState();
    const [ hasStage3, setHasStage3 ] = useState(true);
    const [ processes, setProcesses ] = useState();
    const [ requestedEvidences, setRequestedEvidences ] = useState();
    const [ loadingState, setLoadingState ] = useState(true) //Set loading until data fetching is done.

    const routes = [
        {
            path: "/controls",
            breadcrumbName: t("controls"),
        },
        {
            path: location.pathname,
            breadcrumbName: t("editcontrol"),
        },
    ];

    const columns = [
        {
            title: t("riskname"),
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => { return a.name.localeCompare(b.name)},
        },
        {
            title: t("riskdescription"),
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => { return a.description.localeCompare(b.description)},
        },
        {
            title: t("inherentprobability"),
            dataIndex: 'probability',
            key: 'probability',
        },
        {
            title: t("impact"),
            dataIndex: 'impact',
            key: 'impact',
        },
        {
            title: t("updatedat"),
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: updatedAt => ( moment(updatedAt).format("DD/MM/YYYY"))
        },
        ];

        // Load society list at first render.
        useEffect(() => {
            (async () => {
                const controlinfo = await fetch(
                process.env.REACT_APP_API_ENDPOINT + "/controls/"+controlid,
                {
                    method: "GET",
                    mode: "cors",
                    credentials: "include",
                }
                );
        
                if (controlinfo.status === 200) {
                    const control = await controlinfo.json()
                    setName(control.name)
                    setDescription(control.description)
                    setHasStage3(control.hasstage3)
                    const fetchedrisks = []
                    for (const r of control.risks){
                        fetchedrisks.push(r.id)
                    }
                    setSelectedRisks(fetchedrisks)
                    setQuestions(control.questions)
                    setProcesses(control.processes)
                    setRequestedEvidences(control.requestedevidences)

                    const risksinfo = await fetch(
                    process.env.REACT_APP_API_ENDPOINT + "/risks/"+society,
                    {
                        method: "GET",
                        mode: "cors",
                        credentials: "include",
                    }
                    );
                    if (risksinfo.status === 200) {
                        setRisks(await risksinfo.json())
                        setLoadingState(false)
                    }
                };
            })();
            }, [controlid, society]);

    function onQuestionChange(index, questionState) {
        setQuestions(
          questions.map((el, i) => {
            if (i === index) {
              return questionState ;
            } else {
              return el;
            }
          })
        );
      }
    
      function onQuestionDelete(index) {
        const newQuestions = questions;
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
      }

    /* Handle fast typers by deferring changes until typing is complete.*/
    const deferStateChange = (e, type) => {
      let timer = null

      const triggerChange = () => {
        const val = e.target.value
        if (type === 'description'){
            setDescription(val)
        } else if (type === 'name'){
            setName(val)
        } else if (type === 'requestedevidences'){
            setRequestedEvidences(val)
        }
      }

      clearTimeout(timer)
      timer = setTimeout(triggerChange, 1000)
    }

    async function onControlSave(){

        // This piece validates that all fields have actually been compiled.
        if (description === undefined || description === "" || questions.length < 1){
            return message.error(t("fieldsStillEmpty"));
        } else if (questions.length > 0){
            for (const ques of questions){
                if (ques.question === null || ques.question === "")
                return message.error(t("fieldsStillEmpty"));
            }
        }

        const data = {
            control: {
                name : name,
                description: description,
            },
            questions: questions,
            hasStage3: hasStage3,
            selectedRisks: selectedRisks,
            requestedevidences: requestedEvidences,
            society: society,
        }


        Modal.confirm({
            title: (t("editcontrolconfirm")),
            content: (
              <div>
                <p>{t("editcontrolconfirmtext")}</p>
              </div>
            ),
            onOk() {sendData()},
            cancelText:t("back"),
          });
        

        async function sendData(){
            const result = await fetch(
                process.env.REACT_APP_API_ENDPOINT + "/controls/edit/"+controlid,
                {
                method: "PUT",
                mode: "cors",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                }
            );

            if (result.status === 200) {
                message.success(t("editcontrolsuccess"));
                history.goBack()
            } else {
                message.error(t("editcontrolerror"));
            }
        }
    }

    /* Handles selected "risks" rows. */
    function onTableSelectionChange(selectedRowKeys) {
        setSelectedRisks(selectedRowKeys);
    }

    const processescolumns = [
        {
            title: t("controlname"),
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => { return a.name.localeCompare(b.name)},
        },
        {
            title: t("controldescription"),
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => { return a.description.localeCompare(b.description)},
        },
        {
            title: t("updatedat"),
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: updatedAt => ( moment(updatedAt).format("DD/MM/YYYY"))
        },
    ]; 

    function ProcessesListModal() {
        Modal.info({
          title: t("processes"),
          icon: <EyeOutlined/>,
          width:"60%",
          maskClosable: true,
          okType: "default",
          okText:t("back"),
          content: (
            <Table dataSource={processes && processes} columns={processescolumns} rowKey="id" />
          ),
          onOk() {},
        });
      }

      function confirmDelete(){
        let password = ''
        
        Modal.confirm({
          title: t("confirmdelete"),
          icon: <ExclamationCircleOutlined style={{color: "#f5222d"}}/>,
          width:"40%",
          content: (
            <div style={{paddingTop: "24px"}}>
            <Form name="delete-form">
                <Alert style={{marginBottom:"1.5rem"}} icon={<ExclamationCircleOutlined/>} message={t("editprocesswarning")} description={t("deletecontrolwarning")} type="error" showIcon/>
                <div style={{marginBottom:"1rem", fontSize: "18px"}}>{t("deletecheck")}</div>
                <Form.Item name="fieldvalue">
                    <Input.Password className="deleteinput" onChange={(e) => password = e.target.value}/>
                </Form.Item>         
            </Form>
            </div>
          ),
          okText: t("confirm"),
          okType: 'danger',
          cancelText: t("back"),
          onOk() {
            deleteControl(password, controlid)
          },
        });
      }

      async function deleteControl(pass, id){
        const delresult = await fetch(
            process.env.REACT_APP_API_ENDPOINT + "/controls/delete/"+id,
            {
                method: "DELETE",
                mode: "cors",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({password: pass}),
            }
            );
  
        if (delresult.status === 200) {
            message.success(t("deletecontrolsuccess"));
            history.goBack()
        } else {
            message.error(t("deletecontrolerror"));
        }
      }
    

    //Imagine not being able to control an input component without needing to create a whole fucking form for a single input when <input> works just fine...
    return (
        <Layout style={{minHeight: "100vh"}}>
            <CustomSider selectedMenu="controls" isOpen={true}/>
            <Layout className="site-layout">
            <CustomHeader title={t("appTitle")} breadcrumb={ <Breadcrumb className="flex-center-row" itemRender={itemRender} routes={routes}/>} ></CustomHeader>
                <Content className="content">
                    <Spin size="large" spinning={loadingState}>
                    <Row className="flex-center-row" gutter={16}>
                        <Col span={18}>
                            <Divider className="contenttitle" orientation="left">{t("editcontrol")}</Divider>
                        </Col>
                        <Col span={3}>
                            <Button type="danger" style={{width: "100%"}} icon={<DeleteOutlined/>} onClick={() => {confirmDelete()}}>{t("deletecontrol")}</Button>
                        </Col>
                        <Col span={3}>
                            <Button type="primary" style={{width: "100%"}} icon={<EyeOutlined/>} onClick={() => {ProcessesListModal()}}>{t("viewprocesses")}</Button>
                        </Col>
                    </Row>
                    <div className="data-container">
                        <Divider className="containertitle" orientation="left">{t("info")}</Divider>
                        <div style={{marginBottom: "1.5rem"}}>
                            <h3 style={{marginBottom:"0.5rem"}} strong="false">{t("controlname")}</h3>
                            <Form name="name-form" fields={[{ name: ["name"], value: name} ]} >
                                <Form.Item name="name">
                                    <Input style={{marginBottom:"0px"}} size="large" onChange={(e) => deferStateChange(e, "name")} ></Input>
                                </Form.Item>
                            </Form>
                        </div>
                        <div style={{marginBottom: "1.5rem"}}>
                            <h3 style={{marginBottom:"0.5rem"}} strong="false">{t("controldescription")}</h3>
                            <Form name="description-form" fields={[{ name: ["description"], value: description} ]} >
                                <Form.Item name="description">
                                    <Input style={{marginBottom:"0px"}} size="large" onChange={(e) => deferStateChange(e, "description")} ></Input>
                                </Form.Item>
                            </Form>
                        </div>
                        <div className="flex-center-row" style={{marginBottom: "1.5rem", justifyContent: "initial"}}>
                            <Checkbox checked={hasStage3} style={{marginRight: "1rem"}} onChange={(e) => {setHasStage3(e.target.checked)}}/>
                            <h3 style={{marginBottom:"0px"}} strong="false">{t("stage3question")}</h3>
                        </div>
                        {hasStage3 ? (
                        <div  className="inner-container" style={{marginBottom: "1.5rem"}}>
                            <h3 style={{marginBottom:"0.5rem"}} strong="false">{t("requestedevidences")}</h3>
                            <Form name="requestedevidences-form" fields={[{ name: ["requestedevidences"], value: requestedEvidences} ]} >
                                <Form.Item name="requestedevidences">
                                    <Input style={{marginBottom:"0px"}} size="large" onChange={(e) => deferStateChange(e, "requestedevidences")} ></Input>
                                </Form.Item>
                            </Form>
                        </div>
                        ) : (
                            <></>
                        )}
                    </div>
                    <div className="data-container">
                    <Divider className="containertitle" orientation="left">{t("stage2")+" - "+t("stage2title")}</Divider>
                        {questions.length > 0 ? (
                            questions.map((el, index) => (
                                <>
                                <Question key={el.id} id={el.id} index={index} initialiseState={el} onChange={onQuestionChange} onDelete={onQuestionDelete} editing={true}></Question>
                                <Divider style={{margin: "1.5rem 0rem 1.5rem 0rem"}}></Divider>
                                </>
                                ))
                            ) : (
                            <Result title={t("stage2noquestions")} subTitle={t("stage2noquestionssubtitle")}
                                extra={
                                <Button key="2" type="primary" onClick={() => setQuestions([...questions, { id: uuidv4(), question: null, value: null, notes: null }])} >
                                    {t("add")+" "+t("question").toLowerCase()}
                                </Button>
                                }
                            />
                            )}
                            {questions.length > 0 && (
                            <Button style={{ marginTop: "1rem" }} key="2" type="primary" onClick={() => setQuestions([...questions, { id: uuidv4(), question: null, value: null, notes: null }])} icon={<PlusOutlined />} >{t("add")+" "+t("question").toLowerCase()}</Button>
                            )}
                    </div>
                    <div className="data-container">
                        <Divider className="containertitle" orientation="left">{t("connectedrisks")}</Divider>
                        <Table dataSource={risks} columns={columns} rowKey="id" 
                            rowSelection={{
                            type: "checkbox",
                            onChange: onTableSelectionChange,
                            selectedRowKeys:selectedRisks
                            }}/>
                    </div>
                    <div className="endpage-buttons">
                        <Button onClick={() => history.goBack()}>
                            {t("back")}
                        </Button>
                        <Button type="primary"onClick={onControlSave} style={{ marginLeft: "1rem" }} >
                            {t("save")}
                        </Button>
                    </div>
                    </Spin>
                </Content>
                <Footer style={{ textAlign: 'center' }}>Deloitte Risk Advisory ©2021</Footer>
            </Layout>
        </Layout>
    );
};

export default EditControl;