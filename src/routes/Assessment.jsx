import { Layout, Breadcrumb, Empty, Divider, Row, Col, Select, Table} from 'antd';
import { useLocation, useHistory } from "react-router-dom";
import { itemRender } from "../utils/utils.jsx";
import { useTranslation } from "react-i18next";
import CustomSider from "../components/CustomSider"
import { useState, useEffect } from 'react';
import moment from "moment";
import CustomHeader from '../components/CustomHeader';

const { Content, Footer} = Layout;
const { Option } = Select;

const Assessment = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();

  const routes = [
    {
      path: location.pathname,
      breadcrumbName: t("assessment"),
    },
  ];

  // Handles fetched society
  const [ societyList, setSocietyList ] = useState(null)

  // Handles selected society
  const [ society, setSociety ] = useState(null)
  
  // Handles processes as key-value, where key is societyid and value is a list of processes.
  const [ processes, setProcesses ] = useState(null) 

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

  return (
    <Layout style={{minHeight: "100vh"}}>
      <CustomSider selectedMenu="assessment"/>
        <Layout className="site-layout">
        <CustomHeader title={t("appTitle")} breadcrumb={ <Breadcrumb className="flex-center-row" itemRender={itemRender} routes={routes}/>} ></CustomHeader>
          <Content className="content">
          <Row className="flex-center-row" gutter={16}>
            <Col span={20}>
              <Divider className="contenttitle" orientation="left">{t("assessment")}</Divider>
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
            <Divider className="containertitle" orientation="left">{t("processlist")}</Divider>
            <Table dataSource={processes} columns={columns} rowKey="id" rowClassName={() => 'clickable-pointer'}
            onRow={(record) => {
              return {
                onClick: () => history.push({pathname: `/assessment/process`, state: {processid: record.id}}),
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

export default Assessment;