import { Layout, Breadcrumb, Avatar, Divider, Row, Col, Steps, Button, Modal, Comment, Tooltip, Table, Statistic, Spin, Alert } from 'antd';
import {
  UserOutlined,
  CommentOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useLocation, useHistory } from "react-router-dom";
import { download, itemRender } from "../utils/utils.jsx";
import { useTranslation } from "react-i18next";
import CustomSider from "../components/CustomSider"
import { useState, useEffect } from 'react';

import * as Survey from "survey-react";
import "survey-react/modern.css";
import Question from '../components/Question.js';
import moment from 'moment';
import CustomHeader from '../components/CustomHeader';
import { TooltipTrunc } from '../components/TooltipTrunc.jsx';
import i18n from '../i18n';

const { Content, Footer} = Layout;
const { Step } = Steps;

Survey.StylesManager.applyTheme("modern");

const CompilationViewer = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();

  // Desctructiring state with Spread operator ignores null and undefined, handling these cases for us and allowing for redirection.
  //https://github.com/tc39/proposal-object-rest-spread/blob/master/Spread.md
  const { processinstanceid, controlinstanceid } = {...location.state}
  if (!location.state) history.push("/dashboard")

  const [ processinstance, setProcessinstance ] = useState(null) // This is the current processinstance. 
  const [ controls, setControls ] = useState(null) // This is the current controlinstance.
  const [ currentstage, setCurrentstage ] = useState(null)

  //Pure visualization for Table element.
  const [ files, setFiles ] = useState([]) 
  const [ loadingState, setLoadingState ] = useState(true) //Set loading until data fetching is done.

  const questions = {
    questions: [
    {
        type: "matrix",
        name: "selfassessment",
        title: "Self-Assessment Questionnaire",
        titleLocation: "hidden",
        isRequired: true,
        columns: [
            1, 2, 3, 4
        ],
        rows: [
            {
                value: "r1",
                text: t("r1")
            }, {
                value: "r2",
                text: t("r2")
            }, {
                value: "r3",
                text: t("r3")
            }, {
                value: "r4",
                text: t("r4")
            }
        ],
        cells: {
            "r1": {
                1: t("r1_1"),
                2: t("r1_2"),
                3: t("r1_3"),
                4: t("r1_4")
            },
            "r2": {
              1: t("r2_1"),
              2: t("r2_2"),
              3: t("r2_3"),
              4: t("r2_4")
            },
            "r3": {
              1: t("r3_1"),
              2: t("r3_2"),
              3: t("r3_3"),
              4: t("r3_4")
            },
            "r4": {
              1: t("r4_1"),
              2: t("r4_2"),
              3: t("r4_3"),
              4: t("r4_4")
            },
        }
    }
  ]
  }

  const routes = [
    {
      path: "/history",
      breadcrumbName: t("compilationhistory"),
    },
    {
      path: "/history/process",
      breadcrumbName: processinstance && (processinstance.process.society.name + " - " + processinstance.process.name),
      state: location.state
    },
    {
      path: location.pathname,
      breadcrumbName: t("archivedassessmentview"),
    },
  ];

  const columns = [
    {
        title: t("filename"),
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: t("filetype"),
        dataIndex: 'type',
        key: 'type',
    },
    {
      title: t("filesize"),
      dataIndex: 'size',
      key: 'size',
      render: (size) => <span>{Math.round((size/(1000*1024))*100)/100} MB</span>
    },
    {
      title: t("actions"),
      dataIndex: 'id',
      key: 'id',
      render: (id) => <div>
        <Button style={{marginRight:"1rem"}} onClick={() => fetchFile(id)}>{t("view")}</Button>
      </div>
    },
  ];

  // Load society list at first render.
  useEffect(() => { 
    (async () => {
      const result = await fetch(
        process.env.REACT_APP_API_ENDPOINT + "/processinstances/"+processinstanceid,
        {
          method: "GET",
          mode: "cors",
          credentials: "include",
        }
      );

      const fetchinstance = await fetch(
        process.env.REACT_APP_API_ENDPOINT + "/controlinstances/"+controlinstanceid,
        {
          method: "GET",
          mode: "cors",
          credentials: "include",
        }
      );

      if (result.status === 200 && fetchinstance.status === 200) {
        const processresult = await result.json();
        const fetchinstancersult = await fetchinstance.json()
        setControls(fetchinstancersult)

        if (fetchinstancersult.stage === 3){
          if (fetchinstancersult.hasstage3 === true){ 
            setCurrentstage(2)
          } else {
            setCurrentstage(1)
          }
        } else if (fetchinstancersult.stage === 4){
          if (fetchinstancersult.results.stage2.result === null){
            setCurrentstage(0)
          } else if (fetchinstancersult.results.stage2.result !== null && fetchinstancersult.results.stage3.result === null){
            setCurrentstage(1)
          } else if (fetchinstancersult.results.stage3.result !== null){
            if (fetchinstancersult.hasstage3 === true){ 
              setCurrentstage(2)
            } else {
              setCurrentstage(1)
            }
          }
        } else {
          setCurrentstage(fetchinstancersult.stage)
        }

        delete processresult.controlinstances
        setProcessinstance(processresult)
        setFiles(fetchinstancersult.evidences)
        setLoadingState(false)
      };
    })();
    
  }, [processinstanceid, controlinstanceid]);

  // Create Matrix-Rubric model
  const model = new Survey.Model(questions);
  model.showNavigationButtons = false; // This hides 'Continue' button, but requires that we handle the confirmation logic
  model.showTitle = false;
  model.showHeader = false;
  if (controls && controls.stage !== 0) model.mode = "display"; //If stage is not 0 (stage 1), set visualization as 'display' only.
  
  //This is how you set default values for visualization. Also takes care of updating data.
  controls ? model.setValue("selfassessment",controls.selfassessment) : model.setValue("selfassessment",{"r1":null,"r2":null,"r3":null,"r4":null})

  function comments(data) {
    Modal.info({
      title: t("comments"),
      icon: <CommentOutlined/>,
      maskClosable: true,
      okType: "default",
      okText:t("back"),
      content: (
        <div>
          {controls ? ( 
            data.map((el, index) => (
              <Comment author={<h3 style={{color: "rgba(0, 0, 0, 0.85)"}}>{el.user}</h3>}
                avatar={<Avatar icon={<UserOutlined/>} />}
                content={
                <p>{el.comment}</p>
              }
              datetime={
                <Tooltip title={moment().format('DD/MM/YYYY')}>
                  <span>{moment(el.timestamp).format("DD/MM/YYYY")}</span>
                </Tooltip>
              }
            />
            ))):(<></>)}
        </div>
      ),
      onOk() {},
    });
  }

  //Checks status of step.
  function calculateStatus(key, result){
    if (controls){
      if (result === null && controls.stage < key){
        return "wait";
      } else if (result === null && controls.stage === key){
        return "process";
      } else if (result !== null && result > 40){
        return "finish";
      } else if (result !== null && result <= 40){
        return "error";
      } else if (result === null && controls.stage === 4){
        //Actually means uncompiled because of failure in previous step.
        return "wait"
      }
    }
  }
  
  //Checks if step is disabled or not.
  function calculateDisabled(key, result){
    if (controls){
      if ((controls.stage >= key && controls.stage !== 4) || controls.stage === 3){
        return false;
      } else if (controls.stage === 4){
        if (result !== null){
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    }
  }

  function getResult(step){
    if (controls){
      if (step === 0){
        return controls.results.stage1+"%"
      } else if (step === 1){
        return controls.results.stage2.result+"%"
      } else if (step === 2){
        return controls.results.stage3.result+"%"
      }
    }
  }
  
  function getReason(step){
    if (controls){
      if (step === 0){
        if (controls.results.stage1 >= 60){
          return "selfassessmentok"
        } else {
          return "selfassessmentfailed"
        }
      } else if (step === 1){
        return controls.results.stage2.reason
      } else if (step === 2){
        return controls.results.stage3.reason
      }
    }
  }

  function getCurrentScore(data){

    function sum(arr) {
      return arr.reduce(function (a, b) {
         return a + b;
      }, 0);
   }

    const score = sum(Object.values(data))
    let val = 0

    if ((score/4) < 2){
      val = 20
    } else if ((score/4) >= 2 && (score/4) < 3){
        val = 40
    } else if ((score/4) >= 3 && (score/4) < 4){
        val = 60
    } else if ((score/4) === 4){
        val = 80
    }

  return score/4+ " (" + val + "%)"

  }

  async function exportAssessment(){
    const result = await fetch(
      process.env.REACT_APP_API_ENDPOINT + "/assessment/export/"+controlinstanceid+"/?lang="+i18n.language,
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );

    if (result.status === 200){
      const filename = result.headers.get("Content-Disposition").split("=") // Get the filename from headers
      await result.blob().then(blob => download(blob,filename[1]))
    }
  }

  /*  STAGE 1 FUNCTIONS START HERE */

  function onValueChanged(survey, options) {
  // This has issues. If we use setValue, we have to update the answers with setValue outside 
  // the function otherwise everything will reset to the starting values (null in this case).
  setControls({...controls, selfassessment: survey.data.selfassessment}) 
  // HACK: This is not the expected behaviour. Trigger a render manually every time an answer is set/changed.
  // Keep an eye out on https://github.com/surveyjs/survey-library/issues/3086
  model.render()
  }

  function updateQuestions(index, questionstate){
    setControls({...controls, questions: 
      controls.questions.map((el, i) => {
        if (i === index) {
          return questionstate ;
        } else {
          return el;
        }
      })
    });
  }

  /*  STAGE 1 FUNCTIONS END HERE */

  /*  STAGE 3 FUNCTIONS START HERE */

  async function fetchFile(fileid){

    const idlist = []
    for (const f of controls.evidences){
      idlist.push(f.id)
    }

    // Files was already uploaded!
    const result = await fetch(
    process.env.REACT_APP_API_ENDPOINT + "/assessment/stage3/get/"+controlinstanceid+"/"+fileid,
    {
        method: "GET",
        mode: "cors",
        credentials: "include",
    }
    );

    if (result.status === 200) {
    const filename = result.headers.get("Content-Disposition").split("=") // Get the filename from headers
    await result.blob().then(blob => download(blob,filename[1]))
    }
  }

  /*  STAGE 3 FUNCTIONS END HERE */

  return (
    <Layout style={{minHeight: "100vh"}}>
      <CustomSider selectedMenu="compilationhistory"/>
        <Layout className="site-layout">
        <CustomHeader title={t("appTitle")} breadcrumb={ <Breadcrumb className="flex-center-row" itemRender={itemRender} routes={routes}/>} ></CustomHeader>
          <Content className="content">
            <Spin size="large" spinning={loadingState}>
              {controls && (controls.stage === 3 || controls.stage === 4) ? (
                <Row className="flex-center-row" gutter={16}>
                  <Col span={20}>
                    <Divider className="contenttitle" orientation="left">{t("archivedassessmentview") + " - "+ (controls && controls.control.name)}</Divider>
                  </Col>
                  <Col span={4}>
                    <Button type="primary" style={{width: "100%"}} icon={<DownloadOutlined/>} onClick={() => exportAssessment()}>{t("exportassessment")}</Button>
                  </Col>
                </Row>
              ) : (
                <Divider className="contenttitle" orientation="left">{t("assessmentcompilation")+ " - "+ (controls && controls.control.name)}</Divider>
              )}
            <div className="info-container">
              <Divider className="contenttitle" orientation="left">{processinstance && controls && (processinstance.process.society.name + " - " + processinstance.process.name + " - " + controls.control.name)}</Divider>
              <Row className="flex-center-row" gutter={16}>
                <Col span={24}>
                      {controls && controls.deadline !== null ? (
                        <div className="inner-container">
                          <Alert message={t("deadlinemessage")+ " " + moment(controls.deadline).format("DD/MM/YYYY")} type="warning" showIcon />
                        </div>
                      )
                      :
                      (
                        <></>
                      )}
                    <div className="inner-container">
                      {/*FIXME: This probably need rework for failures*/}
                      <Steps current={currentstage} onChange={(e)=> {setCurrentstage(e)}}>
                        <Step title={t("stage1")} status={controls && calculateStatus(0,controls.results.stage1)} disabled={controls && calculateDisabled(0, controls.results.stage1)} description={t("stage1title")} />
                        <Step title={t("stage2")} status={controls && calculateStatus(1,controls.results.stage2.result)} disabled={controls && calculateDisabled(1, controls.results.stage2.result)} description={t("stage2title")} />
                        {/*FIXME: Hide if no stage 3. */}
                        {controls && controls.hasstage3 === true ? (
                          <Step title={t("stage3")} status={controls && calculateStatus(2,controls.results.stage3.result)} disabled={controls && calculateDisabled(2, controls.results.stage3.result)} description={t("stage3title")} />
                        ) : (
                          <></>
                        )}
                      </Steps>
                      <Row className="flex-center-row" gutter={16}>
                      <Col span={16}>
                        <div className="inner-container" style={controls && controls.stage === currentstage ? {display: "none"} : {}}>
                            <Statistic title={t("reason")} value={t(getReason(currentstage))} />
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="inner-container" style={controls && controls.stage === currentstage ? {display: "none"} : {}}>
                            <Statistic title={t("result")} value={getResult(currentstage)} />
                        </div>
                      </Col>
                    </Row>
                    {controls && controls.stage === 0 && currentstage === 0?
                    (
                      <Row className="flex-center-row" gutter={16}>
                      <Col span={16}>
                        <div className="inner-container" >
                            <Statistic title={t("evaluation")} value={t("pending")} />
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="inner-container" >
                            <Statistic title={t("currentscore")} value={getCurrentScore(controls.selfassessment)} suffix={
                            <Tooltip title={t("selfassessmentscoring")} key="selfassessmentscoring">
                              <Button style={{marginLeft: "0.25rem"}} icon={<QuestionCircleOutlined/>} type="text"></Button>
                            </Tooltip>
                            }/>
                        </div>
                      </Col>
                    </Row>
                    )
                    :
                    (
                      <></>
                    )
                    }
                  </div>
                </Col>
              </Row>
            </div>

            {/* STAGE 1 STARTS HERE */}
            <div className="data-container" style={currentstage === 0 ? {} : {display: "none"}} >
              <Divider className="containertitle" orientation="left">{t("stage1")+" - "+t("stage1title")}</Divider>
              <Survey.Survey model={model} onValueChanged={onValueChanged} />
            </div>
            {/* STAGE 1 ENDS HERE */}

            {/* STAGE 2 STARTS HERE */}
            <div className="data-container" style={currentstage === 1 ? {} : {display: "none"}}>
              <Row className="flex-center-row" gutter={16} style={{margin: "0rem 0rem 1.5rem 0rem"}}>
                <Col span={20}>
                  <Divider className="contenttitle" orientation="left">{t("stage2")+" - "+t("stage2title")}</Divider>
                </Col>
                <Col span={4}>
                  <Button type="primary" disabled={controls && controls.stage2comments.length < 1} icon={<CommentOutlined/>} style={{width:"100%"}} onClick={() => {comments(controls.stage2comments)}} >{t("comments")}</Button>
                </Col>
              </Row>
              {controls ? ( 
                  controls.questions.map((el, index) => (
                    <div key={el.id}>
                        <Question key={el.id} id={el.id} index={index} onChange={updateQuestions} initialiseState={el} editing={false} auth={JSON.parse(window.localStorage.getItem('authlevel')) === 1 && controls.stage === 1}></Question>
                        <Divider style={{margin: "1.5rem 0rem 1.5rem 0rem"}}></Divider>
                    </div>
                  ))):(<></>)}
            </div>
            {/* STAGE 2 ENDS HERE */}

            {/* STAGE 3 STARTS HERE */}
            <div className="data-container" style={(currentstage === 2 && controls.hasstage3 === true) ? {} : {display: "none"}}>
              <Row className="flex-center-row" gutter={16} style={{margin: "0rem 0rem 1.5rem 0rem"}}>
                <Col span={20}>
                  <Divider className="contenttitle" orientation="left">{t("stage3")+" - "+t("stage3title")}</Divider>
                </Col>
                <Col span={4}>
                  <Button type="primary" disabled={controls && controls.stage3comments.length < 1} icon={<CommentOutlined/>} style={{width:"100%"}} onClick={() => {comments(controls.stage3comments)}} >{t("comments")}</Button>
                </Col>
              </Row>
              {controls ? (              
              <div style={{marginBottom:"1.5rem"}}>
                { controls && controls.control.requestedevidences !== null ? 
                (
                <Row className="flex-center-row" gutter={16}>
                  <Col span={24}>
                    <div className="inner-container">
                        <div style={{marginBottom:"0.5rem",color: "rgba(0, 0, 0, 0.45)",fontSize: "14px"}}>{t("requestedevidences")}</div>
                            <div style={{ display: "inline-flex", width: "100%" }}>
                                <TooltipTrunc style={{textAlign: "left", maxWidth: "100%", wordWrap: "break-word", color: "rgba(0, 0, 0, 0.85)", fontSize: "20px"}} text={controls && controls.control.requestedevidences}></TooltipTrunc>
                            </div>
                    </div>
                  </Col>
                </Row>
                )
                :
                (
                <></>
                )
                }
                <div className="inner-container">
                  <Table dataSource={files} columns={columns} rowKey="id" rowClassName={() => 'clickable-pointer'} style={{marginBottom:"1.5rem"}}/>
                </div>
              </div>
              ) : (<></>)}
            </div>
            {/* STAGE 3 ENDS HERE */}
            </Spin>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Deloitte Risk Advisory ©2021</Footer>
        </Layout>
      </Layout>
    );
};

export default CompilationViewer;