import { Layout, Breadcrumb, Empty, Divider, Row, Col, Select, Table, Button, Modal, Form, Input, message } from 'antd';
import {
  PlusOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { useLocation, useHistory } from "react-router-dom";
import { itemRender } from "../utils/utils.jsx";
import { useTranslation } from "react-i18next";
import CustomSider from "../components/CustomSider"
import { useState, useEffect } from 'react';
import moment from "moment";
import CustomHeader from '../components/CustomHeader';

const { Content, Footer} = Layout;
const { Option } = Select;

const Processes = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const history = useHistory();

    const [ newProcessForm ] = Form.useForm();
    const [ cloneProcessForm ] = Form.useForm()

    const routes = [
        {
            path: location.pathname,
            breadcrumbName: t("processes"),
        },
    ];

    const [ societyList, setSocietyList ] = useState(null) // Handles fetched society
    const [ society, setSociety ] = useState(null) // Handles selected society  
    const [ userlist, setUserlist ] = useState(null) // Handles userlist  
    const [ processes, setProcesses ] = useState(null) // Handles processes as key-value, where key is societyid and value is a list of processes.
    const [ showNewProcess, setShowNewProcess] = useState(false); // Handles newprocess modal state
    const [ showCloneProcess, setShowCloneProcess ] = useState(false); // Handles cloneprocess modal state

    // Load society list at first render.
    useEffect(() => {
    (async () => {
        const result = await fetch(
        process.env.REACT_APP_API_ENDPOINT + "/societies",
        {
            method: "GET",
            mode: "cors",
            credentials: "include",
        }
        );

        if (result.status === 200) {
        const societies = await result.json();
        setSocietyList(societies)
        if(window.localStorage.getItem('lastsocietyselected') !== null && window.localStorage.getItem('lastsocietyselected') !== 'undefined'){
          setSociety(window.localStorage.getItem('lastsocietyselected'))
        }
        };
    })();
    }, []);

    // This loads the society's relative processess dynamically once a society is selected..
    //TODO: Check for deleted?
    useEffect(() => {
        if (society){
        (async () => {
        const result = await fetch(
            process.env.REACT_APP_API_ENDPOINT + "/societies/"+society+"/processes?withdeleted=0",
            {
            method: "GET",
            mode: "cors",
            credentials: "include",
            }
        );
        if (result.status === 200) {
            const processesList = await result.json();
            setProcesses(processesList)
        };
        })()
    };
    }, [society]);

    // This loads the first time NewProcessModal is opened.
    async function getUserlist(){
        if ((!userlist && showNewProcess) || (!userlist && showCloneProcess)){
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
  
    const columns = [
        {
            title: t("processname"),
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => { return a.name.localeCompare(b.name)},
        },
        {
            title: t("processdescription"),
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => { return a.description.localeCompare(b.description)},
        },
        {
            title: t("domainmanager"),
            dataIndex: 'domainmanager',
            key: 'domainmanager',
            render: domainmanager => ( domainmanager.name )
        },
        {
            title: t("updatedat"),
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: updatedAt => ( moment(updatedAt).format("DD/MM/YYYY"))
        },
    ];

    /* Opens and displays new Model for user creation. */ 
    const NewProcessModals = (props) => {
        const { t } = useTranslation();
        const form = props.form;

        getUserlist()

        return (
        <Modal
            centered
            title={t("newprocess")}
            okText={t("send")}
            cancelText={t("back")}
            onOk={() => form.submit()}
            {...props}
        >
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
            <Select placeholder={t("selectdomainmanager")} style={{ width: "100%" }} allowClear>
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

    /* Handles creation of new users: called on new user Modal confirmation. */ 
    async function onNewFinish(values) {

        const data = {processData:{
            "name" : values.name,
            "description": values.description,
            },
            "domainmanager": values.domainmanager,
            "society": society
        } 
    
        const result = await fetch(
            process.env.REACT_APP_API_ENDPOINT + "/processes/"+society,
            {
              method: "PUT",
              mode: "cors",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            }
          );

          if (result.status === 200) {
            const newprocess = await result.json()
            message.success(t("newprocesssuccess"));
            newProcessForm.resetFields()
            setShowNewProcess(false);
            history.push({pathname:`/processes/processpage`,state: {society: society, processid: newprocess.id}})
          } else {
            message.error(t("newprocesserror"));
            newProcessForm.resetFields()
            setShowNewProcess(false);
          }
    }

        /* Opens and displays new Model for adding controls. */ 
  const CloneProcessModal = (props) => {
    const { t } = useTranslation();
    const form = props.form;

    getUserlist()

    return (
    <Modal
        width="50%"
        title={t("clonecontrol")}
        okText={t("send")}
        cancelText={t("back")}
        onOk={() => form.submit()}
        {...props}
    >
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
        <Form.Item label={t("process")} name="process" rules={[{required: true, message: t("emptyField")}]}>
        <Select placeholder={t("selectprocess")} style={{ width: "100%" }} allowClear>
            {processes && processes.map(proc => ( 
                <Option key={proc.id}>{proc.name}</Option> 
            ))}
        </Select>
        </Form.Item>
            <Form.Item label={t("domainmanager")} name="domainmanager" rules={[{required: true, message: t("emptyField")}]}>
            <Select placeholder={t("selectdomainmanager")} style={{ width: "100%" }} allowClear>
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

async function onFinishCloneProcess(values){

    const data = {processData:{
        "name" : values.name,
        "description": values.description,
        },
        "domainmanager": values.domainmanager,
        "society": society,
    } 

    const result = await fetch(
        process.env.REACT_APP_API_ENDPOINT + "/processes/"+society,
        {
          method: "PUT",
          mode: "cors",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (result.status === 200) {
        const newproc = await result.json()

        const controlsresult = await fetch(
            process.env.REACT_APP_API_ENDPOINT + "/controls/byprocess/"+values.process,
            {
                method: "GET",
                mode: "cors",
                credentials: "include",
            }
        );
    
        if (controlsresult.status === 200) {
            const clonedcontrols = await controlsresult.json()
            let data = [];

            for (const cont of clonedcontrols){
                data.push(cont.id)
            }
    
            const addedcontrols = await fetch(
                process.env.REACT_APP_API_ENDPOINT + "/processes/controls/"+newproc.id,
                {
                    method: "PUT",
                    mode: "cors",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                }
            );
            if (addedcontrols.status === 200) {
                message.success(t("setprocessescontrolssuccess"));
                cloneProcessForm.resetFields()
                setShowCloneProcess(false);
                history.push({pathname:`/processes/processpage`,state: {society: society, processid: newproc.id}})
            } else {
                message.error(t("setprocessescontrolserror"));
                cloneProcessForm.resetFields()
                setShowCloneProcess(false);
            }

        };

      } else {
        message.error(t("newprocesserror"));
        cloneProcessForm.resetFields()
        setShowCloneProcess(false);
      }
  };

    return (
        <Layout style={{minHeight: "100vh"}}>
            <CustomSider selectedMenu="processes" isOpen={true}/>
            <Layout className="site-layout">
            <CustomHeader title={t("appTitle")} breadcrumb={ <Breadcrumb className="flex-center-row" itemRender={itemRender} routes={routes}/>} ></CustomHeader>
                <Content className="content">
                <Row className="flex-center-row" gutter={16}>
                <Col span={20}>
                    <Divider className="contenttitle" orientation="left">{t("processes")}</Divider>
                </Col>
                <Col span={4}>
                    <Select value={society} placeholder={t("selectSociety")} style={{ width: "100%" }} onChange={(e) => {
                        window.localStorage.setItem('lastsocietyselected', e);
                        setSociety(e)
                    }} allowClear>
                        {societyList && societyList.map(stat => ( 
                        <Option key={stat.id}>{stat.name}</Option> 
                        ))}
                    </Select>
                </Col>
                </Row>
                {society ? 
                <div className="data-container" style={{height: "100%"}}>
                <Row className="flex-center-row" gutter={16} style={{margin: "0rem 0rem 1.5rem 0rem"}}>
                    <Col span={18}>
                        <Divider className="contenttitle" orientation="left">{t("processlist")}</Divider>
                    </Col>
                    <Col span={3}>
                        <Button icon={<CopyOutlined />} type="primary" style={{width:"100%"}} onClick= {() => {setShowCloneProcess(true)}}> {t("cloneprocess")}</Button>
                    </Col>
                    <Col span={3}>
                        <Button icon={<PlusOutlined />} type="primary" style={{width:"100%"}} onClick={() => setShowNewProcess(true)} >{t("newprocess")}</Button>
                    </Col>
                </Row>
                <Table dataSource={processes} columns={columns} rowKey="id" rowClassName={() => 'clickable-pointer'}
                onRow={(record) => {
                    return {
                    onClick: () => history.push({pathname:`/processes/processpage`,state: {society: society, processid: record.id}}),
                    };
                }}/>
                </div>
                :
                <Empty className="emptycontainer" description={t("emptyprocesses")}></Empty>
                }
                </Content>
                <NewProcessModals visible={showNewProcess} form={newProcessForm} onFinish={onNewFinish} 
                onCancel={() => {
                newProcessForm.resetFields()
                setShowNewProcess(false)}}
                />
                <CloneProcessModal visible={showCloneProcess} form={cloneProcessForm} onFinish={onFinishCloneProcess}
                onCancel={() => {
                cloneProcessForm.resetFields()
                setShowCloneProcess(false)}}
                />
                <Footer style={{ textAlign: 'center' }}>Deloitte Risk Advisory ©2021</Footer>
            </Layout>
        </Layout>
    );
};

export default Processes;