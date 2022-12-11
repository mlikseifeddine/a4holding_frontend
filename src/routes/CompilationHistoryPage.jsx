import { Layout, Breadcrumb, Empty, Divider, Row, Col, Tag, Table, Spin, Alert } from 'antd';
import {
  CheckCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useLocation, useHistory } from "react-router-dom";
import { itemRender } from "../utils/utils.jsx";
import { useTranslation } from "react-i18next";
import CustomSider from "../components/CustomSider"
import { useState, useEffect } from 'react';
import moment from 'moment';
import CustomHeader from '../components/CustomHeader';
import { TooltipTrunc } from '../components/TooltipTrunc.jsx';

const { Content, Footer} = Layout;
const CompilationHistoryPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();

  const [ processinstance, setProcessinstance ] = useState(null) // This is actually the list of processinstances.
  const [ controls, setControls ] = useState(null) // This is actually the list of controlinstances.
  const [ loadingState, setLoadingState ] = useState(true) //Set loading until data fetching is done.


  // Desctructiring state with Spread operator ignores null and undefined, handling these cases for us and allowing for redirection.
  //https://github.com/tc39/proposal-object-rest-spread/blob/master/Spread.md
  const { processinstanceid } = {...location.state}
  if (!location.state) history.push("/dashboard")

  useEffect(() => { 
    (async () => {
      const result = await fetch(
        process.env.REACT_APP_API_ENDPOINT + "/processinstances/"+processinstanceid+"/?withdeleted=1",
        {
          method: "GET",
          mode: "cors",
          credentials: "include",
        }
      );

      if (result.status === 200) {
        const processresult = await result.json();
        setControls(processresult.controlinstances)
        delete processresult.controlinstances
        setProcessinstance(processresult)
        setLoadingState(false)
      };
    })();
    
  }, [processinstanceid]);

  const routes = [
    {
      path: "/history",
      breadcrumbName: t("compilationhistory"),
    },
    {
      path: location.pathname,
      breadcrumbName: processinstance && (processinstance.process.society.name + " - " + processinstance.process.name),
    },
  ];

  /* Status value mapper */ 
  const statusMap = {
    0: <Tag key="stage1" color="blue">{t("stage1")}</Tag>,
    1: <Tag key="stage2" color="blue">{t("stage2")}</Tag>,
    2: <Tag key="stage3" color="blue">{t("stage3")}</Tag>,
    3: <Tag key="completed" color="green">{t("completed")}</Tag>,
    4: <Tag key="failed" color="red">{t("failed")}</Tag>,
  };


  const columns = [
      {
        title: t("status"),
        dataIndex: 'auth',
        key: ['auth','stage'],
        width: "100px",
        render: (text, render) => {
          if (render.stage === 0 || render.auth === JSON.parse(window.localStorage.getItem('authlevel')) ){
            return <PlayCircleOutlined style={{ fontSize: '175%'}} className="glow"/>
          } else if (render.actor !== JSON.parse(window.localStorage.getItem('authlevel')) && (render.stage > 0  && render.stage < 3)){
            return <PauseCircleOutlined style={{ fontSize: '175%'}} />
          } else if (render.stage === 3){
            return <CheckCircleOutlined style={{ fontSize: '175%'}} />
          } else if (render.stage === 4){
            return <CloseCircleOutlined style={{ fontSize: '175%'}} />
          }
        }},
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
        title: t("deadline"),
        dataIndex: 'deadline',
        key: 'deadline',
        render: deadline => (deadline !== null ? <Tag key="deadlinetag" color="yellow">{moment(deadline).format("DD/MM/YYYY")}</Tag> : <span>{"//"}</span>)
      },
      {
        title: t("stage"),
        dataIndex: 'stage',
        key: 'stage',
        render: stage => stage > 0  && stage < 3 ? 
        (<div>
          <Tag key="inprogress" color="blue">{t("inprogress")}</Tag>
          {statusMap[stage]}
        </div>
          ) 
        : 
        (statusMap[stage])
        },
        {
          title: t("score"),
          dataIndex: 'score',
          key: 'score',
          render: score => (<span>{score === null ? "TBD" : (score+"%")}</span>)
        },
  ];

  return (
    <Layout style={{minHeight: "100vh"}}>
      <CustomSider selectedMenu="compilationhistory"/>
        <Layout className="site-layout">
        <CustomHeader title={t("appTitle")} breadcrumb={ <Breadcrumb className="flex-center-row" itemRender={itemRender} routes={routes}/>} ></CustomHeader>
          <Content className="content">
          <Spin size="large" spinning={loadingState}>
          <Row className="flex-center-row" gutter={16}>
            <Divider className="contenttitle" orientation="left">{processinstance && (processinstance.process.society.name + " - " + processinstance.process.name)}</Divider>
          </Row>
          <div className="info-container">
            <Divider className="contenttitle" orientation="left">{t("processinfo")}</Divider>
            <div className="inner-container" style={{marginBottom: "0rem"}}>
                <Alert message={t("archivedprocess")+ " " + (processinstance && (new Date(processinstance.process.createdAt).getFullYear()+(new Date(processinstance.process.createdAt).getMonth()+1 <= 6 ? " (Q1-Q2)" : " (Q3-Q4)")))} type="info" showIcon />
            </div>
            <Row className="flex-center-row" gutter={16}>
              <Col span={16}>
              <div className="inner-container">
                  <div style={{marginBottom:"0.5rem",color: "rgba(0, 0, 0, 0.45)",fontSize: "14px"}}>{t("processdescription")}</div>
                      <div style={{ display: "inline-flex", width: "100%" }}>
                          <TooltipTrunc style={{textAlign: "left", maxWidth: "100%", wordWrap: "break-word", color: "rgba(0, 0, 0, 0.85)", fontSize: "20px"}} text={processinstance && processinstance.process.description}></TooltipTrunc>
                      </div>
                  </div>
              </Col>
              <Col span={8}>
              <div className="inner-container">
                  <div style={{marginBottom:"0.5rem",color: "rgba(0, 0, 0, 0.45)",fontSize: "14px"}}>{t("domainmanager")}</div>
                      <div style={{ display: "inline-flex", width: "100%" }}>
                          <TooltipTrunc style={{textAlign: "left", maxWidth: "100%", wordWrap: "break-word", color: "rgba(0, 0, 0, 0.85)", fontSize: "20px"}} text={processinstance && processinstance.compiledby.name}></TooltipTrunc>
                      </div>
                  </div>
              </Col>
            </Row>
          </div>
          {controls ? 
          <div className="data-container">
            <Divider className="containertitle" orientation="left">{t("controlslist")}</Divider>
            <Table dataSource={controls} columns={columns} rowKey="id" rowClassName={() => 'clickable-pointer'}
            onRow={(record) => {
                return {
                  onClick: () => history.push({pathname:`/history/process/control`, state: {...location.state, controlinstanceid: record.id}}),
                  };

            }}/>
            </div>
            :
            <Empty className="emptycontainer" description={t("emptyAssessment")}></Empty>
            }
            </Spin>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Deloitte Risk Advisory ©2021</Footer>
        </Layout>
      </Layout>
    );
};

export default CompilationHistoryPage;