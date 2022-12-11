import { Layout, Breadcrumb, Empty, Divider, Row, Col, Select, Form, Modal, Table, Button, Input, message } from 'antd';
import {
  PlusOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { useHistory, useLocation } from "react-router-dom";
import { itemRender } from "../utils/utils.jsx";
import { useTranslation } from "react-i18next";
import CustomSider from "../components/CustomSider"
import { useState, useEffect } from 'react';
import moment from "moment";
import CustomHeader from '../components/CustomHeader';

const { Content, Footer} = Layout;
const { Option } = Select;

const Controls = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();

  const [ cloneControlForm ] = Form.useForm()

  const routes = [
    {
      path: location.pathname,
      breadcrumbName: t("controls"),
    },
  ];

  // Handles fetched society
  const [ societyList, setSocietyList ] = useState(null)

  // Handles selected society
  const [ society, setSociety ] = useState(null)
  
  // Handles processes as key-value, where key is societyid and value is a list of processes.
  const [ controls, setControls ] = useState(null) 

  const [ showCloneControl, setShowCloneControl ] = useState(false);


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

    // Load controls list at first render.
    useEffect(() => {
        if (society){
            (async () => {
                const controlsresult = await fetch(
                    process.env.REACT_APP_API_ENDPOINT + "/controls/bysociety/"+society,
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
            })();
        }
    }, [society]);
  
 
  const columns = [
        {
            title: t("controlname"),
            dataIndex: 'name',
            key: 'name',
            width: "20%",
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
            width: "10%",
            render: updatedAt => ( moment(updatedAt).format("DD/MM/YYYY"))
        },
  ];

  
    /* Opens and displays new Model for adding controls. */ 
  const CloneControlModal = (props) => {
      const { t } = useTranslation();
      const form = props.form;

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
          <Form.Item label={t("controlname")} name="name" rules={[{required: true, message: t("emptyField")}]}>
              <Input />
          </Form.Item>
          <Form.Item label={t("controldescription")} name="description" rules={[{required: true, message: t("emptyField")}]}>
              <Input />
          </Form.Item>
          <Form.Item label={t("control")} name="control" rules={[{required: true, message: t("emptyField")}]}>
          <Select placeholder={t("selectcontrol")} style={{ width: "100%" }} allowClear>
              {controls && controls.map(cont => ( 
                  <Option key={cont.id}>{cont.name}</Option> 
              ))}
              </Select>
          </Form.Item>
          </Form>
      </Modal>
      );
  };

  async function onFinishCloneControl(values){

      const controlinfo = await fetch(
      process.env.REACT_APP_API_ENDPOINT + "/controls/"+values.control,
      {
          method: "GET",
          mode: "cors",
          credentials: "include",
      }
      );

      if (controlinfo.status === 200) {
          const control = await controlinfo.json()

          const risks = []
          for (const r of control.risks){
            risks.push(r.id)
          }

          const data = {
            control: {
                name : values.name,
                description: values.description,
            },
            questions: control.questions,
            hasStage3: control.hasstage3,
            selectedRisks: risks,
            society: society
        }

        const result = await fetch(
          process.env.REACT_APP_API_ENDPOINT + "/controls/new",
          {
            method: "PUT",
            mode: "cors",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );

        if (result.status === 200) {
          const fetchedresult = await result.json()
          message.success(t("newcontrolsuccess"));
          history.push({pathname:`/controls/editcontrol`,state: {...location.state, controlid: fetchedresult.id, society: society}})
        } else {
          message.error(t("newcontrolerror"));
        }
      };
    };

  return (
    <Layout style={{minHeight: "100vh"}}>
      <CustomSider selectedMenu="controls" isOpen={true}/>
        <Layout className="site-layout">
        <CustomHeader title={t("appTitle")} breadcrumb={ <Breadcrumb className="flex-center-row" itemRender={itemRender} routes={routes}/>} ></CustomHeader>
          <Content className="content">
          <Row className="flex-center-row" gutter={16}>
            <Col span={20}>
              <Divider className="contenttitle" orientation="left">{t("controls")}</Divider>
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
                        <Divider className="contenttitle" orientation="left">{t("controlslist")}</Divider>
                    </Col>
                    <Col span={3}>
                    <Button icon={<CopyOutlined />} type="primary" style={{width:"100%"}} onClick= {() => {setShowCloneControl(true)}}> {t("clonecontrol")}</Button>
                    </Col>
                    <Col span={3}>
                    <Button icon={<PlusOutlined />} type="primary" style={{width:"100%"}} onClick= {() => history.push({pathname:`/controls/newcontrol`,state: {...location.state, society: society}})} >{t("newcontrol")}</Button>
                    </Col>
                </Row>
            <Table dataSource={controls} columns={columns} rowKey="id" rowClassName={() => 'clickable-pointer'}
            onRow={(record) => {
                return {
                onClick: () => history.push({pathname:`/controls/editcontrol`,state: {...location.state, controlid: record.id, society: society}}),
                };}}/>
            </div>
            :
            <Empty className="emptycontainer" description={t("emptycontrols")}></Empty>
            }
          </Content>
          <CloneControlModal visible={showCloneControl} form={cloneControlForm} onFinish={onFinishCloneControl}
                onCancel={() => {
                cloneControlForm.resetFields()
                setShowCloneControl(false)}}
          />
          <Footer style={{ textAlign: 'center' }}>Deloitte Risk Advisory ©2021</Footer>
        </Layout>
      </Layout>
    );
};

export default Controls;