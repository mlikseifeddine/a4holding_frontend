import { Layout, Breadcrumb, Row, Col, Divider, Empty, Select, Button, Statistic, List, Modal, Descriptions, Table, Tooltip, Spin } from 'antd';
import {
  HistoryOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useHistory, useLocation } from "react-router-dom";
import { itemRender } from "../utils/utils.jsx";
import { useTranslation } from "react-i18next";
import CustomSider from '../components/CustomSider'
import CustomHeader from '../components/CustomHeader';
import { useEffect, useState } from 'react';
import { useAuth } from '../providers/AuthContext.jsx';
import moment from 'moment';
import { TooltipTrunc } from '../components/TooltipTrunc.jsx';

const { Content, Footer } = Layout;
const { Option } = Select;

const Results = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();

  const auth = useAuth();

  useEffect(() => {
      if (auth.user === undefined) auth.checkAuth();
    }, [auth]);

  const routes = [
    {
      path: location.pathname,
      breadcrumbName: t("resultsriskmaps"),
    },
  ];

  //TODO: Set button redirect
  const columns = [
    {
      title: t("riskname"),
      dataIndex: ['risk','name'],
      key: 'name',
      width:"10%",
      sorter: (a, b) => { return a.name.localeCompare(b.name)},
    },
    {
      title: t("riskdescription"),
      dataIndex: ['risk','description'],
      key: 'description',
      width:"40%",
      sorter: (a, b) => { return a.description.localeCompare(b.description)},
      ellipsis: {
        showTitle: false,
      },
      render: description => (
        <Tooltip placement="topLeft" title={description}>
          {description}
        </Tooltip>
      ),
    },
    {
      title: t("netprobability"),
      dataIndex: 'netprobability',
      key: 'netprobability',
      render: netprobability => (netprobability !== null ? <span>{netprobability}</span> : "N/A")
    },
    {
      title: t("netrisk"),
      dataIndex: 'netrisk',
      key: 'netrisk',
      render: netrisk => (netrisk !== null ? <span>{netrisk}</span> : "N/A")
    },
    {
      title: t("updatedat"),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: updatedAt => ( moment(updatedAt).format("DD/MM/YYYY"))
    },
    {
      title: t("view"),
      dataIndex: ['id'],
      key: 'id',
      render: (text,record) => ( <Button icon={<RightOutlined/>} disabled={!record.completed} type="primary" onClick={() => {
        Modal.destroyAll()
        history.push({pathname: `/results/overview`, state: {riskinstanceid: record.id}})
      }}>{t("view")}</Button>)
    },
  ];

  // Handles fetched society
  const [ societyList, setSocietyList ] = useState(null);

  // Handles selected society
  const [ society, setSociety ] = useState(null);

  // Handles Risk Instances
  const [ riskinstances, setRiskinstances ] = useState(null);

  const [ loadingState, setLoadingState ] = useState(true) //Set loading until data fetching is done.
  
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
          process.env.REACT_APP_API_ENDPOINT + "/risks/"+society,
          {
          method: "GET",
          mode: "cors",
          credentials: "include",
          }
      );

      if (result.status === 200) {
          const risklist = await result.json();
          const riskinstances = []
          for (const r of risklist){
            const ri = await fetch(
              process.env.REACT_APP_API_ENDPOINT + "/riskinstances/last/"+r.id,
              {
              method: "GET",
              mode: "cors",
              credentials: "include",
              }
            );

            if (ri.status === 200){
              riskinstances.push(await ri.json())
            }
          }
          setRiskinstances(riskinstances);
          setLoadingState(false)
      };
      })()
  };
}, [society]);

function getRobustness(data){

  function sum(arr) {
    return arr.reduce(function (a, b) {
       return a + b;
    }, 0);
 }

  const val = []
  for (const c of data){
    val.push(c.score)
  }

  const score = sum(val)/val.length
  return isNaN(score) ? "TBD" : score

}

  function riskInfo(risk){
    Modal.info({
      title: t("riskinfo"),
      width: "60%",
      content: (
      <div className="inner-container" style={{height: "100%", marginLeft: "0px", marginRight: "0px"}}>
        <Descriptions bordered >
          <Descriptions.Item label={t("riskname")} span={12} >{risk.name}</Descriptions.Item>
          <Descriptions.Item label={t("riskdescription")} span={12}>{risk.description}</Descriptions.Item>
          <Descriptions.Item label={t("inherentprobability")} span={12}>{risk.probability}</Descriptions.Item>
          <Descriptions.Item label={t("impact")} span={12}>{risk.impact}</Descriptions.Item>
        </Descriptions>
      </div>
      ),
      onOk() {},
    });
  }

  async function previousCompilations(riskid){
    
    let ri = []

    const result = await fetch(
      process.env.REACT_APP_API_ENDPOINT + "/riskinstances/history/"+riskid,
      {
      method: "GET",
      mode: "cors",
      credentials: "include",
      }
    );

    if (result.status === 200){
      ri = await result.json()
      ri.splice(0,1)
    }

    Modal.info({
      title: t("previousresults"),
      width: "80%",
      content: (
      <div className="inner-container" style={{height: "100%", marginLeft: "0px", marginRight: "0px"}}> 
        <Table dataSource={ri} columns={columns} rowKey="id" />
      </div>
      ),
      onOk() {},
    });
  }

  return (
    <Layout style={{minHeight: "100vh"}}>
      <CustomSider selectedMenu="resultsriskmaps"/>
        <Layout className="site-layout">
        <CustomHeader title={t("appTitle")} breadcrumb={ <Breadcrumb className="flex-center-row" itemRender={itemRender} routes={routes}/>} ></CustomHeader>
          <Content className="content">
          <Row className="flex-center-row" gutter={16}>
            <Col span={20}>
              <Divider className="contenttitle" orientation="left">{t("resultsriskmaps")}</Divider>
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
            <>
            {riskinstances ?  
              <List dataSource={riskinstances}
              pagination={{
                pageSize: 5,
              }}
              renderItem={item => (
                <div className="info-container">
                <Row className="flex-center-row" gutter={16} style={{margin: "0rem 0rem 1.5rem 0rem"}}>
                    <Col span={16}>
                        <Divider className="contenttitle riskdivider" orientation="left">{<TooltipTrunc style={{textAlign: "left", maxWidth: "100%", wordWrap: "break-word", color: "rgba(0, 0, 0, 0.85)", fontSize: "24px", marginBottom: "0rem"}} text={item.risk.name + " - " + item.risk.description }></TooltipTrunc>}</Divider>
                    </Col>
                    <Col span={4}>
                        <Button icon={<RightOutlined />} style={{width:"100%"}} onClick={() => riskInfo(item.risk)}> {t("riskinfo")}</Button>
                    </Col>
                    <Col span={4}>
                        <Button icon={<HistoryOutlined />} style={{width:"100%"}} onClick={() => {
                        previousCompilations(item.risk.id);
                        }}>{t("previousresults")}</Button>
                    </Col>
                </Row>
                <Row>
                    <Col span={16} style={{display: "flex"}}>
                        <div className="inner-container" style={{width: "100%"}}>
                            <Row>
                                <Col span={8}>
                                    <div className="inner-container flex-center-row">
                                        <Statistic title={t("netrisk")} value={item.netrisk === null ? "N/A" : item.netrisk} valueStyle={{ fontSize: "26px", textAlign: "center" }} />
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div className="inner-container flex-center-row">
                                        <Statistic title={t("netprobability")} value={item.netprobability === null ? "N/A" : item.netprobability} valueStyle={{ fontSize: "26px", textAlign: "center" }} />
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div className="inner-container flex-center-row">
                                        <Statistic title={t("robustnessvalue")} value={
                                          getRobustness(item.controlinstances.filter(c => c.score !== null))
                                        } valueStyle={{ color: '#cf1322', fontSize: "26px", textAlign: "center" }} />
                                    </div>
                                </Col>
                            </Row>
                            <div className="btn-container" >
                              <Button icon={<RightOutlined />} disabled={!item.completed} type="primary" onClick={() => history.push({pathname: `/results/overview`, state: {riskinstanceid: item.id}})}> {t("viewresults")}</Button>
                            </div>
                        </div>
                    </Col>
                    <Col span={8} style={{display: "flex"}}>
                        <div className="inner-container flex-center-row" style={{textAlignLast: "center", width: "100%"}}>
                          {item.completed ? 
                            <img alt="risk map" style={{maxWidth: "90%"}}/>
                          :
                          <Statistic title={<h1 style={{fontSize: "2rem"}}>{t("completedcontrols")}</h1>} value={
                            item.controlinstances.filter(c => c.score !== null).length+"/"+item.controlinstances.length
                          } valueStyle={(item.controlinstances.filter(c => c.score !== null).length === item.controlinstances.length) && (item.controlinstances.length !== 0) && (item.completed !== null) ? { color: '#3f8600', fontSize: "38px" } : { color: '#cf1322', fontSize: "38px" }} />
                          }
                        </div>
                    </Col>
                  </Row>
                </div> 
              )}
            />
            :
            <div className="data-container flex-center-row" style={{height:"100%"}}>
              <Spin size="large" spinning={loadingState} />
            </div>
            }
            </>
            :
            <Empty className="emptycontainer" description={t("emptyresults")}></Empty>
            }
          </Content>
          <Footer style={{ textAlign: 'center' }}>Deloitte Risk Advisory ©2021</Footer>
        </Layout>
      </Layout>
    );
};

export default Results;