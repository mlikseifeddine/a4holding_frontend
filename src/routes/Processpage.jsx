import { Layout, Breadcrumb, Empty, Divider, Row, Col, Select, Table, Button, Form, Input, Modal, message, Spin, Alert, Typography, Collapse } from 'antd';
import {
  SnippetsOutlined,
  FormOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useLocation, useHistory } from "react-router-dom";
import { itemRender } from "../utils/utils.jsx";
import { useTranslation } from "react-i18next";
import CustomSider from "../components/CustomSider"
import { useState, useEffect } from 'react';
import moment from "moment";
import ControlHandlerHelper from '../components/ControlHandlerHelper';
import CustomHeader from '../components/CustomHeader';
import { TooltipTrunc } from '../components/TooltipTrunc.jsx';

const { Content, Footer} = Layout;
const { Option } = Select;
const { Paragraph } = Typography;
const { Panel } = Collapse;

const Processpage = (props) => {
    const { t } = useTranslation();
    const location = useLocation();
    const history = useHistory();
    
    // Desctructiring state with Spread operator ignores null and undefined, handling these cases for us and allowing for redirection.
    //https://github.com/tc39/proposal-object-rest-spread/blob/master/Spread.md
    const { society, processid } = {...location.state}
    if (!location.state) history.push("/dashboard")

    const [ editProcessForm ] = Form.useForm();
    
    const [ processes, setProcesses ] = useState(null) // Handles processes 
    const [ controls, setControls ] = useState(null) // Handles process controls 
    const [ userlist, setUserlist ] = useState(null) // Handles userlist  
    const [ showEditProcess, setShowEditProcess ] = useState(false); // Handles editprocess modal state
    const [ showControlsModal, setShowControlsModal ] = useState(false); // Handlecs controls modal state
    const [ loadingState, setLoadingState ] = useState(true) //Set loading until data fetching is done.
    
    const routes = [
        {
            path: "/processes",
            breadcrumbName: t("processes"),
        },
        {
            path: location.pathname,
            breadcrumbName: processes && (processes.society.name + " - " + processes.name),
        },
    ];

    // Load controls list at first render.
    useEffect(() => {
    (async () => {
        const processresult = await fetch(
        process.env.REACT_APP_API_ENDPOINT + "/processes/"+processid,
        {
            method: "GET",
            mode: "cors",
            credentials: "include",
        }
        );

        if (processresult.status === 200) {
        const fetchedprocess = await processresult.json();
        
        const controlsresult = await fetch(
            process.env.REACT_APP_API_ENDPOINT + "/controls/byprocess/"+processid,
            {
                method: "GET",
                mode: "cors",
                credentials: "include",
            }
        );
        
        if (controlsresult.status === 200) {
            const fetchedcontrols = await controlsresult.json();
            setProcesses(fetchedprocess)
            setControls(fetchedcontrols)
            setLoadingState(false)
        }
    }
    })();
    }, [processid]);

  
    const columns = [
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

    const riskcolumns = [
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

    // This loads the first time NewProcessModal is opened.
    async function getUserlist(){
        if (!userlist && showEditProcess){
        (async () => {
            const result = await fetch(
                process.env.REACT_APP_API_ENDPOINT + "/users/"+society,
            {
                method: "GET",
                mode: "cors",
                credentials: "include",
            }
            );

            if (result.status === 200) {
            const users = await result.json();
            setUserlist(users)
            };
            })();
        }
    }

    /* Opens and displays new Model for process editing. */ 
    const EditProcessModal = (props) => {
        const { t } = useTranslation();
        const form = props.form;

        getUserlist()
        if (showEditProcess){
            form.setFieldsValue({
                name: processes && processes.name,
                description: processes && processes.description,
                domainmanager: processes && processes.domainmanager.id
            })
        }

        return (
        <Modal
            centered
            title={t("editprocess")}
            okText={t("send")}
            cancelText={t("back")}
            onOk={() => form.submit()}
            {...props}
        >
            <Alert style={{marginBottom:"1.5rem"}} message={t("editprocesswarning")} description={t("editprocesswarningtext")} type="warning" showIcon/>
            <Form
            name="complex-form-add"
            form={form}
            layout="vertical"
            onFinish={props.onFinish}
            >
            <Form.Item label={t("processname")} name="name" rules={[{required: true, message: t("emptyField")}]}>
                <Input />
            </Form.Item>
            <Form.Item label={t("processdescription")} name="description" rules={[{required: true, message: t("emptyField")}]}>
                <Input />
            </Form.Item>
            <Form.Item label={t("domainmanager")} name="domainmanager" rules={[{required: true, message: t("emptyField")}]}>
            <Select placeholder={t("selectuser")} style={{ width: "100%" }} allowClear>
                {userlist &&                        
                    userlist.filter((user) => user.auth === 1)
                    .map((user) => ( <Option key={user.id}>{user.name}</Option>  
                ))}
                </Select>
            </Form.Item>
            </Form>
        </Modal>
        );
    };

    /* Opens and displays new Model for adding controls. */ 
    const ControlsModal = (props) => {
        const { t } = useTranslation();
        let value = null;

    /* 
    ** This is used as a reflection of what is saved in ControlHandlerHelper. 
    ** State gets lifted here so that we can retrieveit without accidental re-renders. 
    ** Gets cleaned everytime modal is opened and/or closed.
    */ 
    function lift(payload){
        value = payload;
    }
        
        return (
        <Modal
            width="50%"
            title={t("handlecontrols")}
            okText={t("send")}
            cancelText={t("back")}
            onOk={() => onControlsFinish(value)}
            {...props}
        >
            <ControlHandlerHelper processid={processid} society={society} statelifter={lift}/>
        </Modal>
        );
    };

    /* Handles creation of new users: called on new user Modal confirmation. */ 
    async function onEditFinish(values) {

        const data = {processData:{
            "name" : values.name,
            "description": values.description,
            },
            "domainmanager": values.domainmanager,
        } 
    
        const result = await fetch(
            process.env.REACT_APP_API_ENDPOINT + "/processes/edit/"+processes.id,
            {
              method: "PUT",
              mode: "cors",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            }
          );

          if (result.status === 200) {
            message.success(t("editprocesssuccess"));
            editProcessForm.resetFields()
            setShowEditProcess(false);
            //FIXME: This is fugly
            history.go(0)//Refreshes page
          } else {
            message.error(t("editprocesserror"));
            editProcessForm.resetFields()
            setShowEditProcess(false);
          }
    }

    /* Handles creation of new users: called on new user Modal confirmation. */ 
    async function onControlsFinish(values) {

        let data = [];
        for (const cont of values){
            data.push(cont.id)
        }

        const result = await fetch(
            process.env.REACT_APP_API_ENDPOINT + "/processes/controls/"+processid,
            {
                method: "PUT",
                mode: "cors",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }
            );

            if (result.status === 200) {
            message.success(t("setprocessescontrolssuccess"));
            setShowControlsModal(false);

            // Update state by fetching new controls.
            const controlsresult = await fetch(
                process.env.REACT_APP_API_ENDPOINT + "/controls/byprocess/"+processid,
                {
                    method: "GET",
                    mode: "cors",
                    credentials: "include",
                }
            );
            
            if (controlsresult.status === 200) {
                const fetchedcontrols = await controlsresult.json();
                setControls(fetchedcontrols)
    
            }

            } else {
            message.error(t("setprocessescontrolserror"));
            setShowControlsModal(false);
            }
    }

    function Controlinfo(cont) {
        Modal.info({
          title: t("controlinfo") + " (" + cont[0].name + " - " + cont[0].description + ")",
          icon: <EyeOutlined/>,
          width:"60%",
          maskClosable: true,
          okType: "default",
          okText:t("back"),
          content: (
              <div>
                  <div className="inner-container" style={{height: "100%", marginLeft: "0px", marginRight: "0px"}}>
                    <h3 style={{marginBottom:"1rem"}} strong="false" >{t("stage2")+ " - " + t("stage2title")}</h3>
                    <Collapse accordion>
                        <Panel header={t("showquestions")} key="1">
                            {cont[0].questions.map((el, index) => (
                                <div style={{marginBottom:"1.5rem"}}>
                                    <h3 style={{marginBottom:"0.5rem"}} strong="false">{t("question")+" "+(index+1)}</h3>
                                    <div style={{ display: "inline-flex", width: "100%" }}>
                                        <Paragraph style={{marginBottom:"0px", fontSize:"16px"}} strong={false}>{el.question}</Paragraph>
                                    </div>
                                    <Divider style={{margin: "1.5rem 0rem 0rem 0rem"}}></Divider>
                                </div>       
                            ))}
                        </Panel>
                    </Collapse>
                </div>
                <div className="inner-container" style={{height: "100%", marginLeft: "0px", marginRight: "0px"}}>
                    <h3 style={{marginBottom:"1rem"}} strong="false" >{t("impactedrisks")}</h3>
                    <Collapse accordion>
                        <Panel header={t("showrisks")} key="1">
                            <Table dataSource={cont[0].risks} columns={riskcolumns} rowKey="id" />
                        </Panel>
                    </Collapse>
                </div>
                <div className="inner-container" style={{height: "100%", marginLeft: "0px", marginRight: "0px"}}>
                    <h3 style={{marginBottom:"1rem"}} strong="false" >{t("linkedprocesses")}</h3>
                    <Collapse accordion>
                        <Panel header={t("showprocesses")} key="1">
                            <Table dataSource={cont[0].processes} columns={processescolumns} rowKey="id" />
                        </Panel>
                    </Collapse>
                </div>
            </div>
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
                <Alert style={{marginBottom:"1.5rem"}} icon={<ExclamationCircleOutlined/>} message={t("editprocesswarning")} description={t("deleteprocesswarning")} type="error" showIcon/>
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
            deleteProcess(password, processid);
          },
        });
      }

      async function deleteProcess(pass, id){
        const delresult = await fetch(
            process.env.REACT_APP_API_ENDPOINT + "/process/delete/"+id,
            {
                method: "DELETE",
                mode: "cors",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({password: pass}),
            }
            );
  
        if (delresult.status === 200) {
            message.success(t("deleteprocesssuccess"));
            history.goBack()
        } else {
            message.error(t("deleteprocesserror"));
        }
      }

    return (
        <Layout style={{minHeight: "100vh"}}>
            <CustomSider selectedMenu="processes" isOpen={true}/>
            <Layout className="site-layout">
            <CustomHeader title={t("appTitle")} breadcrumb={ <Breadcrumb className="flex-center-row" itemRender={itemRender} routes={routes}/>} ></CustomHeader>
                <Content className="content">
                <Spin size="large" spinning={loadingState}>
                    <Row className="flex-center-row" gutter={16}>
                        <Col span={21}>
                            <Divider className="contenttitle" orientation="left">{processes && (processes.society.name + " - " + processes.name)}</Divider>
                        </Col>
                        <Col span={3}>
                            <Button type="danger" style={{width: "100%"}} icon={<DeleteOutlined/>} onClick={() => {confirmDelete()}}>{t("deleteprocess")}</Button>
                        </Col>
                    </Row>
                        <div className="info-container">
                            <Row className="flex-center-row" gutter={16} style={{margin: "0rem 0rem 1.5rem 0rem"}}>
                                <Col span={20}>
                                <Divider className="contenttitle" orientation="left">{t("processinfo")}</Divider>
                                </Col>
                                <Col span={4}>
                                    <Button icon={<FormOutlined />} type="primary" style={{width: "100%"}} onClick={() => setShowEditProcess(true)} >{t("edit")}</Button>
                                </Col>
                            </Row>
                            <Row className="flex-center-row" gutter={16}>
                            <Col span={16}>
                            <div className="inner-container">
                                <div style={{marginBottom:"0.5rem",color: "rgba(0, 0, 0, 0.45)",fontSize: "14px"}}>{t("processdescription")}</div>
                                    <div style={{ display: "inline-flex", width: "100%" }}>
                                        <TooltipTrunc style={{textAlign: "left", maxWidth: "100%", wordWrap: "break-word", color: "rgba(0, 0, 0, 0.85)", fontSize: "20px"}} text={processes && processes.description}></TooltipTrunc>
                                    </div>
                                </div>
                            </Col>
                            <Col span={8}>
                            <div className="inner-container">
                                <div style={{marginBottom:"0.5rem",color: "rgba(0, 0, 0, 0.45)",fontSize: "14px"}}>{t("domainmanager")}</div>
                                    <div style={{ display: "inline-flex", width: "100%" }}>
                                        <TooltipTrunc style={{textAlign: "left", maxWidth: "100%", wordWrap: "break-word", color: "rgba(0, 0, 0, 0.85)", fontSize: "20px"}} text={processes && processes.domainmanager.name}></TooltipTrunc>
                                    </div>
                                </div>
                            </Col>
                            </Row>
                        </div>
                    {controls ? 
                    <div className="data-container" style={{height: "100%"}}>
                    <Row className="flex-center-row" gutter={16} style={{margin: "0rem 0rem 1.5rem 0rem"}}>
                        <Col span={20}>
                            <Divider className="contenttitle" orientation="left">{t("controlslist")}</Divider>
                        </Col>
                        <Col span={4}>
                            <Button icon={<SnippetsOutlined />} type="primary" style={{width:"100%"}} onClick= {() => setShowControlsModal(true)} >{t("handlecontrols")}</Button>
                        </Col>
                    </Row>
                    <Table dataSource={controls} columns={columns} rowKey="id" rowClassName={() => 'clickable-pointer'}
                    onRow={(record) => {
                        return {
                            onClick: () => Controlinfo(controls && controls.filter(cont => cont.id === record.id)),
                        };
                    }}/>
                    </div>
                    :
                    <Empty className="emptycontainer" description={t("emptyprocesses")}></Empty>
                    }
                    </Spin>
                </Content>
                <EditProcessModal visible={showEditProcess} form={editProcessForm} onFinish={onEditFinish} 
                onCancel={() => {
                editProcessForm.resetFields()
                setShowEditProcess(false)}}
                />
                <ControlsModal visible={showControlsModal}
                onCancel={() => {
                setShowControlsModal(false)}}
                />
                <Footer style={{ textAlign: 'center' }}>Deloitte Risk Advisory ©2021</Footer>
            </Layout>
        </Layout>
    );
};

export default Processpage;