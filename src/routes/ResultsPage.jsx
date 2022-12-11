import { Layout, Breadcrumb, Statistic, Button, Divider, Row, Col, Table, Tag, Modal, Descriptions, Spin, Tooltip} from 'antd';
import { useLocation, useHistory } from "react-router-dom";
import { itemRender } from "../utils/utils.jsx";
import { useTranslation } from "react-i18next";
import CustomSider from "../components/CustomSider"
import { useState, useEffect } from 'react';
import CustomHeader from '../components/CustomHeader';
import {
    RightOutlined,
    HistoryOutlined,
  } from '@ant-design/icons';
import moment from 'moment';
import { TooltipTrunc } from '../components/TooltipTrunc.jsx';

const { Content, Footer} = Layout;

const ResultsPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();

  const [ riskinstance, setRiskinstance] = useState(null)
  const [ loadingState, setLoadingState ] = useState(true) //Set loading until data fetching is done.

  const routes = [
    {
        path: "/results",
        breadcrumbName: t("resultsriskmaps"),
    },
    {
      path: location.pathname,
      breadcrumbName:riskinstance && riskinstance.risk.name + " - " +t("evaluation") + " " + (new Date(riskinstance.createdAt).getFullYear()+(new Date(riskinstance.createdAt).getMonth()+1 <= 6 ? " (Q1-Q2)" : " (Q3-Q4)")),
    },
  ];
  
  // Desctructiring state with Spread operator ignores null and undefined, handling these cases for us and allowing for redirection.
  //https://github.com/tc39/proposal-object-rest-spread/blob/master/Spread.md
  const { riskinstanceid } = {...location.state}
  if (!location.state) history.push("/dashboard")

  // Load society list at first render.
  useEffect(() => {
    (async () => {
      const result = await fetch(
        process.env.REACT_APP_API_ENDPOINT + "/riskinstances/"+riskinstanceid,
        {
          method: "GET",
          mode: "cors",
          credentials: "include",
        }
      );

      if (result.status === 200) {
        setRiskinstance(await result.json())
        setLoadingState(false)
      };
    })();
  }, []);

  /* Status value mapper */ 
  const statusMap = {
    20: <Tag key="stage1" color="red">20% - {t("failed")}</Tag>,
    40: <Tag key="stage2" color="red">40% - {t("failed")}</Tag>,
    60: <Tag key="stage3" color="green">60% - {t("completed")}</Tag>,
    80: <Tag key="completed" color="green">60% - {t("completed")}</Tag>,
  };


  const columns = [
    {
        title: t("processname"),
        dataIndex: ['processinstance','process','name'],
        key: 'name',
        sorter: (a, b) => { return a.name.localeCompare(b.name)},
      },
      {
        title: t("processdescription"),
        dataIndex: ['processinstance','process','description'],
        key: 'description',
        sorter: (a, b) => { return a.description.localeCompare(b.description)},
      },
      {
        title: t("controlname"),
        dataIndex: ['control','name'],
        key: 'name',
        sorter: (a, b) => { return a.name.localeCompare(b.name)},
      },
      {
        title: t("controldescription"),
        dataIndex: ['control','description'],
        key: 'description',
        sorter: (a, b) => { return a.description.localeCompare(b.description)},
      },
      {
        title: t("updatedat"),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: updatedAt => (moment(updatedAt).format("DD/MM/YYYY"))
      },
    {
        title: t("score"),
        dataIndex: 'score',
        key: 'score',
        render: score => (score !== null ? statusMap[score] : <span>TBD</span>)
    },
    {
        title: t("view"),
        dataIndex: ['id'],
        key: 'id',
        render: (text, record) => ( <Button icon={<RightOutlined/>} disabled={!(record.score !== null)} type="primary" onClick={() => history.push({pathname:`/assessment/process/compilation`, state: {...location.state, processid: record.processinstance.process.id ,controlinstanceid: record.id}})}>{t("view")}</Button>)
    },
  ];

  const previouscolumns = [
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

  function riskInfo(){
    Modal.info({
      title: t("riskinfo"),
      width: "60%",
      content: (
      <div className="inner-container" style={{height: "100%", marginLeft: "0px", marginRight: "0px"}}>
        <Descriptions bordered >
          <Descriptions.Item label={t("riskname")} span={12} >{riskinstance && riskinstance.risk.name}</Descriptions.Item>
          <Descriptions.Item label={t("riskdescription")} span={12}>{riskinstance && riskinstance.risk.description}</Descriptions.Item>
          <Descriptions.Item label={t("inherentprobability")} span={12}>{riskinstance && riskinstance.risk.probability}</Descriptions.Item>
          <Descriptions.Item label={t("impact")} span={12}>{riskinstance && riskinstance.risk.impact}</Descriptions.Item>
        </Descriptions>
      </div>
      ),
      onOk() {},
    });
  }

  async function previousCompilations(){
    
    let ri = []

    const result = await fetch(
      process.env.REACT_APP_API_ENDPOINT + "/riskinstances/history/"+riskinstance.risk.id,
      {
      method: "GET",
      mode: "cors",
      credentials: "include",
      }
    );

    if (result.status === 200){
      ri = await result.json()
    }

    Modal.info({
      title: t("otherresults"),
      width: "80%",
      content: (
      <div className="inner-container" style={{height: "100%", marginLeft: "0px", marginRight: "0px"}}> 
        <Table dataSource={ri} columns={previouscolumns} rowKey="id" />
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
                <Col span={16}>
                    <Divider className="contenttitle" orientation="left">
                    {<TooltipTrunc style={{textAlign: "left", maxWidth: "100%", wordWrap: "break-word", color: "rgba(0, 0, 0, 0.85)", fontSize: "24px", marginBottom: "0rem"}} 
                    text={
                        riskinstance && riskinstance.risk.name + " - " + riskinstance.risk.description }
                ></TooltipTrunc>}
                    </Divider>
                </Col>
                <Col span={4}>
                    <Button icon={<RightOutlined />} style={{width:"100%"}} onClick={() => riskInfo()}> {t("riskinfo")}</Button>
                </Col>
                <Col span={4}>
                        <Button icon={<HistoryOutlined />} style={{width:"100%"}} onClick={() => {
                        previousCompilations();
                        }}>{t("otherresults")}</Button>
                    </Col>
            </Row>
            {riskinstance ? 
            <>
            <div className="info-container">
                <Divider className="contenttitle" orientation="left">{t("evaluationresults") + " - "+(new Date(riskinstance.createdAt).getFullYear()+(new Date(riskinstance.createdAt).getMonth()+1 <= 6 ? " (Q1-Q2)" : " (Q3-Q4)"))}</Divider>
                <div className="inner-container">
                    <Row>
                        <Col span={8}>
                            <div className="inner-container flex-center-row">
                                <Statistic title={t("netrisk")} value={riskinstance.netrisk === null ? "N/A" : riskinstance.netrisk} valueStyle={{ fontSize: "26px", textAlign: "center" }} />
                            </div>
                        </Col>
                        <Col span={8}>
                            <div className="inner-container flex-center-row">
                                <Statistic title={t("netprobability")} value={riskinstance.netprobability === null ? "N/A" : riskinstance.netprobability} valueStyle={{ fontSize: "26px", textAlign: "center" }} />
                            </div>
                        </Col>
                        <Col span={8}>
                            <div className="inner-container flex-center-row">
                                <Statistic title={t("robustnessvalue")} value="" valueStyle={{ color: '#cf1322', fontSize: "26px", textAlign: "center" }} />
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
            <div className="data-container">
                <Divider className="containertitle" orientation="left">{t("riskmaps")}</Divider>
                <Row>
                <Col span={12} style={{display: "flex"}}>
                    <div className="inner-container" style={{textAlignLast: "center", width: "100%"}}>
                        <Divider className="containertitle" orientation="left">{t("inherentrisk")}</Divider>
                        <div className="inner-container flex-center-row" style={{textAlignLast: "center"}}>
                            {riskinstance.completed ? 
                            <img alt="risk map" style={{maxWidth: "90%"}}/>
                            :
                            <></>
                            }
                        </div>
                    </div>
                </Col>
                <Col span={12} style={{display: "flex"}}>
                    <div className="inner-container" style={{textAlignLast: "center", width: "100%"}}>
                    <Divider className="containertitle" orientation="left">{t("impact")}</Divider>
                        <div className="inner-container flex-center-row" style={{textAlignLast: "center"}}>
                            {riskinstance.completed ? 
                            <img alt="risk map" style={{maxWidth: "90%"}}/>
                            :
                            <></>
                            }
                        </div>
                    </div>
                </Col>       
                </Row>
            </div>
            <div className="data-container">
                <Divider className="containertitle" orientation="left">{t("riskinstanceassessments")}</Divider>
                <Table columns={columns} dataSource={riskinstance && riskinstance.controlinstances} />
            </div>
        </>
        :
        <div className="data-container flex-center-row" style={{height:"100%"}}>
            <Spin size="large" spinning={loadingState}/>
        </div>
        }
          </Content>
          <Footer style={{ textAlign: 'center' }}>Deloitte Risk Advisory ©2021</Footer>
        </Layout>
      </Layout>
    );
};

export default ResultsPage;