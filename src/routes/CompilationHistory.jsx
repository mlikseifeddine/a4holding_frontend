import { Layout, Breadcrumb, Empty, Divider, Row, Col, Select, Table, Checkbox, Modal, Button, Alert} from 'antd';
import {
  RightOutlined,
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

const CompilationHistory = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();

  const routes = [
    {
      path: location.pathname,
      breadcrumbName: t("compilationhistory"),
    },
  ];

  // Handles fetched society
  const [ societyList, setSocietyList ] = useState(null)

  // Handles selected society
  const [ society, setSociety ] = useState(null)
  
  // Handles processes as key-value, where key is societyid and value is a list of processes.
  const [ processes, setProcesses ] = useState(null) 

  // Handles table filtering.
  const [showDeleted, setShowDeleted ] = useState(false)

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
        const options = []
        for (let soc of societies){
            options.push({"key": soc.id, "title": soc.name})
        }
        setSocietyList(options)
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
            process.env.REACT_APP_API_ENDPOINT + "/societies/"+society+"/processes?withdeleted=1",
            {
            method: "GET",
            mode: "cors",
            credentials: "include",
            }
        );

        if (result.status === 200) {
            const processesList = await result.json();
            setProcesses(processesList)
            console.log(processesList)
        };
        })()
    };
  }, [society]);
  
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

  const previouscolumn = [
    {
      title: t("processname"),
      dataIndex: ['process','name'],
      key: 'name',
      sorter: (a, b) => { return a.name.localeCompare(b.name)},
    },
    {
      title: t("processdescription"),
      dataIndex: ['process','description'],
      key: 'description',
      sorter: (a, b) => { return a.description.localeCompare(b.description)},
    },
    {
      title: t("domainmanager"),
      dataIndex: 'compiledby',
      key: 'compiledby',
      render: compiledby => ( compiledby.name )
    },
    {
      title: t("createdAt"),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: createdAt => ( moment(createdAt).format("DD/MM/YYYY"))
    },
    {
      title: t("updatedat"),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: updatedAt => ( moment(updatedAt).format("DD/MM/YYYY"))
    },
    {
      title: t("term"),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: createdAt => (new Date(createdAt).getFullYear()+(new Date(createdAt).getMonth()+1 <= 6 ? " (Q1-Q2)" : " (Q3-Q4)"))
    },
    {
      title: t("view"),
      dataIndex: ['id'],
      key: 'id',
      render: (text,record) => ( <Button icon={<RightOutlined/>} type="primary" onClick={() => {
        Modal.destroyAll();
        history.push({pathname: `/history/process`, state: {processinstanceid: record.id}})
      }}>{t("view")}</Button>)
    },
  ];

  async function previousCompilations(processid){
    
    let pi = []

    const result = await fetch(
      process.env.REACT_APP_API_ENDPOINT + "/processinstances/byprocess/"+processid+"/?withdeleted=1",
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );

    if (result.status === 200){
      pi = await result.json()
      pi.splice(0,1)
    }

    Modal.info({
      title: t("previouscompilations"),
      width: "80%",
      content: (
      <div>
        <Alert style={{marginBottom:"1.5rem", marginTop:"1.5rem"}} message={t("editprocesswarning")} description={t("previouscompilationwarning")} type="info" showIcon />
        <div className="inner-container" style={{height: "100%", marginLeft: "0px", marginRight: "0px"}}> 
          <Table dataSource={pi} columns={previouscolumn} rowKey="id" />
        </div>
      </div>
      ),
      onOk() {},
    });
  }

  return (
    <Layout style={{minHeight: "100vh"}}>
      <CustomSider selectedMenu="compilationhistory"/>
        <Layout className="site-layout">
        <CustomHeader title={t("appTitle")} breadcrumb={ <Breadcrumb className="flex-center-row" itemRender={itemRender} routes={routes}/>} ></CustomHeader>
          <Content className="content">
          <Row className="flex-center-row" gutter={16}>
            <Col span={20}>
              <Divider className="contenttitle" orientation="left">{t("compilationhistory")}</Divider>
            </Col>
            <Col span={4}>
              <Select value={society} placeholder={t("selectSociety")} style={{ width: "100%" }} onChange={(e) => {
                window.localStorage.setItem('lastsocietyselected', e);
                setSociety(e)
                }} allowClear>
              {societyList && societyList.map(stat => ( 
                <Option key={stat.key}>{stat.title}</Option> 
              ))}
              </Select>
            </Col>
          </Row>
          {society ? 
          <div className="data-container">
            <Row className="flex-center-row" gutter={16} style={{margin: "0rem 0rem 1.5rem 0rem"}}>
              <Col span={21}>
                <Divider className="contenttitle" orientation="left" >{t("processlist")}</Divider>
              </Col>
              <Col span={3}>
                <Checkbox value={showDeleted} className="flex-center-row" onChange={(e) => setShowDeleted(e.target.checked)} style={{ width: "100%" }} >{t("viewdeleted")}</Checkbox>
              </Col>
            </Row>
            <Table dataSource={processes ? (showDeleted ? processes : processes.filter((p) => p.deletedAt === null)) : (null)} 
            columns={columns} rowKey="id" 
            //rowClassName={() => 'clickable-pointer'}
            rowClassName={(record, index) => record.deletedAt === null ? 'table-row-light clickable-pointer' :  'table-row-dark clickable-pointer'}
            onRow={(record) => {
              return {
                onClick: () => previousCompilations(record.id)
              };
            }}/>
            </div>
            :
            <Empty className="emptycontainer" description={t("emptyAssessment")}></Empty>
            }
          </Content>
          <Footer style={{ textAlign: 'center' }}>Deloitte Risk Advisory ©2021</Footer>
        </Layout>
      </Layout>
    );
};

export default CompilationHistory;