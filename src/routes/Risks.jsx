import { Layout, Breadcrumb, Empty, Divider, Row, Col, Select, message, Form, Input, Modal, Table, Button, Radio, Collapse, Alert } from 'antd';
import {
  PlusOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useLocation } from "react-router-dom";
import { itemRender } from "../utils/utils.jsx";
import { useTranslation } from "react-i18next";
import CustomSider from "../components/CustomSider"
import { useState, useEffect } from 'react';
import moment from "moment";
import CustomHeader from '../components/CustomHeader';

const { Content, Footer} = Layout;
const { Option } = Select;
const { Panel } = Collapse;

const Risks = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const [ newRiskForm ] = Form.useForm();
  const [ editRiskForm ] = Form.useForm();

  const routes = [
    {
      path: location.pathname,
      breadcrumbName: t("risks"),
    },
  ];

  // Handles fetched society
  const [ societyList, setSocietyList ] = useState(null)

  // Handles selected society
  const [ society, setSociety ] = useState(null)
  
  // Handles processes as key-value, where key is societyid and value is a list of processes.
  const [ risks, setRisks ] = useState(null) 
  
  // Handles processes as key-value, where key is societyid and value is a list of processes.
  const [ editrisk, setEditrisk ] = useState(null) 

  const [ showNewRisk, setShowNewRisk] = useState(false); // Handles newrisk modal state
  const [ showEditRisk, setShowEditRisk ] = useState(false); // Handles editrisk modal state

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

  useEffect(() => {
      if (society){
        (async () => {
        const result = await fetch(
            process.env.REACT_APP_API_ENDPOINT + "/risks/"+society,
            {
            method: "GET",
            mode: "cors",
            credentials: "include",
            }
        );

        if (result.status === 200) {
            const riskslist = await result.json();
            setRisks(riskslist)
        };
        })()
    };
  }, [society]);
  
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

      /* Opens and displays new Model for user creation. */ 
      const NewRiskModal = (props) => {
        const { t } = useTranslation();
        const form = props.form;

        return (
        <Modal
            centered
            title={t("newrisk")}
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
            <Form.Item label={t("riskname")} name="name" rules={[{required: true, message: t("emptyField")}]}>
                <Input />
            </Form.Item>
            <Form.Item label={t("riskdescription")} name="description" rules={[{required: true, message: t("emptyField")}]}>
                <Input />
            </Form.Item>
            <Form.Item label={t("inherentprobability")} name="probability" rules={[{required: true, message: t("emptyField")}]}>
                <Radio.Group>
                    <Radio value={1}>1</Radio>
                    <Radio value={2}>2</Radio>
                    <Radio value={3}>3</Radio>
                    <Radio value={4}>4</Radio>
                </Radio.Group>
            </Form.Item>
            <Form.Item label={t("impact")} name="impact" rules={[{required: true, message: t("emptyField")}]}>
                <Radio.Group>
                    <Radio value={1}>1</Radio>
                    <Radio value={2}>2</Radio>
                    <Radio value={3}>3</Radio>
                    <Radio value={4}>4</Radio>
                </Radio.Group>
            </Form.Item>
            </Form>
        </Modal>
        );
    };

    /* Handles creation of new users: called on new user Modal confirmation. */ 
    async function onNewFinish(values) {
    
        const result = await fetch(
            process.env.REACT_APP_API_ENDPOINT + "/risks/"+society,
            {
              method: "PUT",
              mode: "cors",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(values),
            }
          );

          if (result.status === 200) {
            message.success(t("newrisksuccess"));
            newRiskForm.resetFields()
            const result = await fetch(
              process.env.REACT_APP_API_ENDPOINT + "/risks/"+society,
              {
              method: "GET",
              mode: "cors",
              credentials: "include",
              }
            );
    
            if (result.status === 200) {
                const riskslist = await result.json();
                setRisks(riskslist)
            };
            setShowNewRisk(false);
          } else {
            message.error(t("newriskerror"));
            newRiskForm.resetFields()
            setShowNewRisk(false);
          }
    }

    /* Opens and displays editing Model for user creation. */ 
    const EditRiskModal = (props) => {
        const { t } = useTranslation();
        let { form } = props;

        //ANTd developers forgot how to make a functional modal+form, and initialValues is broken af. 
        // So setting it here works, but inside the form doesnt??? Can't pick up state??? Hello???
        if (showEditRisk){
          form.setFieldsValue({
              name: editrisk && editrisk.name,
              description: editrisk && editrisk.description,
              probability: editrisk && editrisk.probability,
              impact: editrisk && editrisk.impact
          })
        }

        const controlscolumn = [
          {
              title: t("controlname"),
              dataIndex: 'name',
              key: 'name',
              width: "25%",
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
              width: "25%",
              render: updatedAt => ( moment(updatedAt).format("DD/MM/YYYY"))
          },
      ]; 
  

        return (
        <Modal
            centered
            width="40%"
            destroyOnClose={true}
            title={t("editrisk")}
            okText={t("send")}
            cancelText={t("back")}
            onOk={() => form.submit()}
            {...props}
        >
            <Form
            name="complex-form-add"
            form={form}
            preserve={false}
            layout="vertical"
            onFinish={props.onFinish}
            >
            <Form.Item label={t("riskname")} name="name" rules={[{required: true, message: t("emptyField")}]}>
                <Input/>
            </Form.Item>
            <Form.Item label={t("riskdescription")} name="description" rules={[{required: true, message: t("emptyField")}]}>
                <Input />
            </Form.Item>
            <Form.Item label={t("inherentprobability")} name="probability" rules={[{required: true, message: t("emptyField")}]}>
                <Radio.Group >
                    <Radio value={1}>1</Radio>
                    <Radio value={2}>2</Radio>
                    <Radio value={3}>3</Radio>
                    <Radio value={4}>4</Radio>
                </Radio.Group>
            </Form.Item>
            <Form.Item label={t("impact")} name="impact" rules={[{required: true, message: t("emptyField")}]}>
                <Radio.Group >
                    <Radio value={1}>1</Radio>
                    <Radio value={2}>2</Radio>
                    <Radio value={3}>3</Radio>
                    <Radio value={4}>4</Radio>
                </Radio.Group>
            </Form.Item>
            </Form>
            <Divider/>

            <div style={{marginTop:"1.5rem"}}>
              <Collapse defaultActiveKey={[]}>
                <Panel header={t("connectedcontrols")+" "+t("viewonly")} key="1">
                  <Table dataSource={editrisk && editrisk.controls} columns={controlscolumn} rowKey="id" />
                </Panel>
            </Collapse>
            </div>
            <Divider/>
            <div className="inner-container">
              <Button icon={<DeleteOutlined/>} style={{width: "100%"}} type="danger" onClick={() => {
                setShowEditRisk(false)
                confirmDelete(editrisk.id)
              }}>{t("deleterisk")}</Button>
            </div>
        </Modal>
        );
    };

    /* Handles creation of new users: called on new user Modal confirmation. */ 
    async function onEditFinish(values) {
    
        const result = await fetch(
            process.env.REACT_APP_API_ENDPOINT + "/risks/edit/"+editrisk.id,
            {
              method: "PUT",
              mode: "cors",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(values),
            }
          );

          if (result.status === 200) {
            message.success(t("editrisksuccess"));
            editRiskForm.resetFields()
            const result = await fetch(
              process.env.REACT_APP_API_ENDPOINT + "/risks/"+society,
              {
              method: "GET",
              mode: "cors",
              credentials: "include",
              }
            );
    
            if (result.status === 200) {
                const riskslist = await result.json();
                setRisks(riskslist)
            };
            setShowEditRisk(false);
          } else {
            message.error(t("editriskerror"));
            editRiskForm.resetFields()
          }
    }

    function confirmDelete(id){
      let password = ''
      Modal.confirm({
        title: t("confirmdelete"),
        icon: <ExclamationCircleOutlined style={{color: "#f5222d"}}/>,
        width:"40%",
        content: (
          <div style={{paddingTop: "24px"}}>
          <Form name="delete-form">
              <Alert style={{marginBottom:"1.5rem"}} icon={<ExclamationCircleOutlined/>} message={t("editprocesswarning")} description={t("deleteriskswarning")} type="error" showIcon/>
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
          deleteRisk(password, id)
        },
      });
    }

    async function deleteRisk(pass, id){

      const delresult = await fetch(
          process.env.REACT_APP_API_ENDPOINT + "/risks/delete/"+id,
          {
              method: "DELETE",
              mode: "cors",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({password: pass}),
          }
          );

      if (delresult.status === 200) {
          message.success(t("deleterisksuccess"));
          editRiskForm.resetFields()
          const result = await fetch(
            process.env.REACT_APP_API_ENDPOINT + "/risks/"+society,
            {
            method: "GET",
            mode: "cors",
            credentials: "include",
            }
          );
  
          if (result.status === 200) {
              const riskslist = await result.json();
              setRisks(riskslist)
          };
      } else {
          message.error(t("deleteriskerror"));
          editRiskForm.resetFields()
      }
    }

  return (
    <Layout style={{minHeight: "100vh"}}>
      <CustomSider selectedMenu="risks" isOpen={true}/>
        <Layout className="site-layout">
          <CustomHeader title={t("appTitle")} breadcrumb={ <Breadcrumb className="flex-center-row" itemRender={itemRender} routes={routes}/>} ></CustomHeader>
          <Content className="content">
          <Row className="flex-center-row" gutter={16}>
            <Col span={20}>
              <Divider className="contenttitle" orientation="left">{t("risks")}</Divider>
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
                    <Col span={21}>
                        <Divider className="contenttitle" orientation="left">{t("riskslist")}</Divider>
                    </Col>
                    <Col span={3}>
                        <Button icon={<PlusOutlined />} style={{width:"100%"}} type="primary" onClick={() => setShowNewRisk(true)} >{t("newrisk")}</Button>
                    </Col>
                </Row>
            <Table dataSource={risks} columns={columns} rowKey="id" rowClassName={() => 'clickable-pointer'}
            onRow={(record) => {
              return {
                onClick: () => {
                    setEditrisk(record)
                    setShowEditRisk(true)
                },
              };
            }}/>
            </div>
            :
            <Empty className="emptycontainer" description={t("emptyrisk")}></Empty>
            }
          </Content>
          <NewRiskModal visible={showNewRisk} form={newRiskForm} onFinish={onNewFinish}
                onCancel={() => {
                newRiskForm.resetFields()
                setShowNewRisk(false)}}
                />
          <EditRiskModal visible={showEditRisk} form={editRiskForm} onFinish={onEditFinish}
                onCancel={() => {
                editRiskForm.resetFields()
                setShowEditRisk(false)}}
                />
          <Footer style={{ textAlign: 'center' }}>Deloitte Risk Advisory ©2021</Footer>
        </Layout>
      </Layout>
    );
};

export default Risks;