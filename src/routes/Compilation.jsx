import { Layout, Breadcrumb, Avatar, Divider, Row, Col, Steps, Button, message, Modal, Comment, Tooltip, Upload, Table, Form, Input, Radio, Space, Statistic, Spin, DatePicker, Alert } from 'antd';
import {
  UserOutlined,
  CommentOutlined,
  UploadOutlined,
  SendOutlined,
  StopOutlined,
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
import { uuid } from 'uuidv4';
import CustomHeader from '../components/CustomHeader';
import { TooltipTrunc } from '../components/TooltipTrunc.jsx';
import i18n from '../i18n';

const { Content, Footer} = Layout;
const { Step } = Steps;
const { TextArea } = Input;
Survey.StylesManager.applyTheme("modern");

const Compilation = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();

  // Desctructiring state with Spread operator ignores null and undefined, handling these cases for us and allowing for redirection.
  //https://github.com/tc39/proposal-object-rest-spread/blob/master/Spread.md
  const { processid, controlinstanceid } = {...location.state}
  if (!location.state) history.push("/dashboard")

  const [ processinstance, setProcessinstance ] = useState(null) // This is the current processinstance. 
  const [ controls, setControls ] = useState(null) // This is the current controlinstance.
  const [ currentstage, setCurrentstage ] = useState(null)

  //Pure visualization for Table element.
  const [ files, setFiles ] = useState([]) 
  const [ deletedfiles, setDeletedfiles ] = useState([]) //Queried for deletion.
  const [ addedfiles, setAddedfiles ] = useState([]) //Queried for adding.
  const [ tableLoading, setTableLoading ] = useState(false)
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
      path: "/assessment",
      breadcrumbName: t("assessment"),
    },
    {
      path: "/assessment/process",
      breadcrumbName: processinstance && (processinstance.process.society.name + " - " + processinstance.process.name),
      state: location.state
    },
    {
      path: location.pathname,
      breadcrumbName: t("assessmentcompilation"),
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
        <Button type="danger" style={JSON.parse(window.localStorage.getItem('authlevel')) === 1 && controls.stage === 2 ? {} : {display: "none"}} 
        onClick={() => removeFileHandler(id)}>{t("remove")}</Button>
      </div>
    },
  ];

  // Load society list at first render.
  useEffect(() => { 
    (async () => {
      const result = await fetch(
        process.env.REACT_APP_API_ENDPOINT + "/processinstances/last/"+processid,
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
    
  }, [processid, controlinstanceid]);

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

  async function onSetStage1(data){
    // This snippet checks that all fields have been set.
    for ( const value of Object.values(controls.selfassessment)){
      if (value === null || value === undefined || value < 1 || value > 4){
        return message.error(t("allquestionsneeded"))
      }
    }

    model.doComplete() // This tells the modal that we're done.

    const result = await fetch(
      process.env.REACT_APP_API_ENDPOINT + "/assessment/stage1/set/"+controlinstanceid,
      {
        method: "PUT",
        mode: "cors",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (result.status === 200) {
      history.goBack();
      message.success(t("assessmentsubmitsuccess"))
    } else {
      message.error(t("assessmentsubmiterror"))
    }

  }

  async function onCompleteStage1Modal(data) {
    Modal.confirm({
      title: t("send"),
      icon: <SendOutlined style={{color: "#9C844C"}}/>,
      maskClosable: true,
      okType: "default",
      okButtonProps: {type: "primary"},
      cancelText:t("back"),
      okText:t("send"),
      onOk: () => {onSetStage1(data)},
      content: (
        <div>
          <div style={{marginBottom: "1.5rem", marginTop: "1.5rem"}}>
            <span>{t("requestconfirmation")}</span>
          </div>
        </div>
      ),
    });
  }

  /*  STAGE 1 FUNCTIONS END HERE */
  /*  STAGE 2 FUNCTIONS START HERE */

  async function onUpdateStage2(comm, dead) {
    
    // This snippet checks that all fields have been set.
    for (const quest of controls.questions){
      if (quest.value === null){
        return message.error(t("allquestionsneeded"))
      }
    } 

    const result = await fetch(
      process.env.REACT_APP_API_ENDPOINT + "/assessment/stage2/update/"+controlinstanceid,
      {
        method: "PUT",
        mode: "cors",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({questions: controls.questions, comment: comm, deadline: dead}),
      }
    );

    if (result.status === 200) {
      history.goBack();
      message.success(t("assessmentsubmitsuccess"))
    } else {
      message.error(t("assessmentsubmiterror"))
    }
  }

  async function onSetStage2(reason, passed) {
      if (reason === null || reason === undefined){
        return message.error(t("allquestionsneeded"))
      }


    const result = await fetch(
      process.env.REACT_APP_API_ENDPOINT + "/assessment/stage2/set/"+controlinstanceid,
      {
        method: "PUT",
        mode: "cors",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({passed: passed, reason: reason}),
      }
    );

    if (result.status === 200) {
      history.goBack();
      message.success(t("assessmentsubmitsuccess"))
    } else {
      message.error(t("assessmentsubmiterror"))
    }
  }

  async function onUpdateStage2Modal() {
    let comment = ''

    Modal.confirm({
      title: t("send"),
      icon: <SendOutlined style={{color: "#9C844C"}}/>,
      maskClosable: true,
      okType: "default",
      okButtonProps: {type: "primary"},
      cancelText:t("back"),
      okText:t("send"),
      onOk: () => {onUpdateStage2(comment)},
      content: (
        <div>
            <div style={{marginBottom: "1.5rem"}}>
              <span>{t("canaddcomment")}</span>
              <Form name="comment-form" fields={[{ name: ["comment"]} ]} >
                  <Form.Item name="comment">
                      <TextArea size="large" autoSize showCount maxLength={200} style={{marginBottom:"0px", marginTop:"1rem"}} onChange={(e) => comment = e.target.value}></TextArea>
                  </Form.Item>
              </Form>
          </div>
        </div>
      ),
    });
  }

  async function onRequestReviewStage2Modal() {
    let comment = ''
    let deadline = ''

    Modal.confirm({
      title: t("reviewrequest"),
      icon: <SendOutlined/>,
      maskClosable: true,
      okType: "default",
      okButtonProps: {type: "primary"},
      cancelText:t("back"),
      okText:t("send"),
      onOk: () => {onUpdateStage2(comment, deadline)},
      content: (
        <div>
            <div style={{marginBottom: "1.5rem"}}>
              <span>{t("canaddcomment")}</span>
              <Form name="comment-form" fields={[{ name: ["comment"]} ]} >
                  <Form.Item name="comment">
                      <TextArea size="large" autoSize showCount maxLength={200} style={{marginBottom:"0px", marginTop:"1rem"}} onChange={(e) => comment = e.target.value}></TextArea>
                  </Form.Item>
              </Form>
              <span>{t("canadddeadline")}</span>
              <Form name="deadline-form" fields={[{ name: ["comment"]} ]} >
                  <Form.Item style={{width: "100%"}} name="deadline">
                      <DatePicker placeholder={t("selectdate")} size="large" style={{width: "100%", marginBottom:"0px", marginTop:"1rem"}} format="DD/MM/YYYY" onChange={(e) => deadline = e}></DatePicker>
                  </Form.Item>
              </Form>
          </div>
        </div>
      ),
    });
  }

  async function onRejectStage2Modal() {
    let reason = null
    //FIXME: Automatick check on NA??

    Modal.confirm({
      title: t("reject"),
      icon: <StopOutlined style={{color: "#f5222d"}}/>,
      maskClosable: true,
      okType: "default",
      okButtonProps: {type: "primary"},
      cancelText:t("back"),
      okText:t("send"),
      onOk: () => {onSetStage2(reason, false)},
      content: (
        <div>
          <div style={{marginBottom: "1.5rem", marginTop: "1.5rem"}}>
            <Radio.Group onChange={(e) => reason = e.target.value}>
              <Space direction="vertical">
                <Radio value={"withdefaults"}>{t("withdefaults")}</Radio>
                <Radio value={"nafalse"}>{t("nafalse")}</Radio>
              </Space>
            </Radio.Group>
          </div>
        </div>
      ),
    });
  }

  async function onCompleteStage2Modal() {
    let reason = null
    //FIXME: Automatick check on NA??

    Modal.confirm({
      title: t("send"),
      icon: <SendOutlined style={{color: "#9C844C"}}/>,
      maskClosable: true,
      okType: "default",
      okButtonProps: {type: "primary"},
      cancelText:t("back"),
      okText:t("send"),
      onOk: () => {onSetStage2(reason, true)},
      content: (
        <div>
          <div style={{marginBottom: "1.5rem", marginTop: "1.5rem"}}>
            <Radio.Group onChange={(e) => reason = e.target.value}>
              <Space direction="vertical">
                <Radio value={"nodefaults"}>{t("nodefaults")}</Radio>
                <Radio value={"natrue"}>{t("natrue")}</Radio>
              </Space>
            </Radio.Group>
          </div>
        </div>
      ),
    });
  }

  /*  STAGE 2 FUNCTIONS END HERE */
  /*  STAGE 3 FUNCTIONS START HERE */

  function removeFileHandler(fileid){

    const idlist = []
    for (const f of controls.evidences){
      idlist.push(f.id)
    }

    const newfilelist = [...files]
    const newdeletedfilelist = [...deletedfiles]
    const newaddedfileslist = [...addedfiles]

    if (idlist.includes(fileid)){
      //Set for removal: query backend for remote deletion.
      for (const f of newfilelist){
        if (fileid === f.id){
          newfilelist.splice(newfilelist.indexOf(f),1)
          newdeletedfilelist.push(fileid)
          setFiles(newfilelist)
          setDeletedfiles(newdeletedfilelist)
          return message.success(t("filequeuedforremoval"))
        } 
      }
    } else {
      //Remove from added list: it's just locally uploaded.
      for (const f of newfilelist){
        if (fileid === f.id){
          newfilelist.splice(newfilelist.indexOf(f),1)
          for (const a of newaddedfileslist){
            if (fileid === f.id) newaddedfileslist.splice(newaddedfileslist.indexOf(a),1)
          }
          setFiles(newfilelist)
          setAddedfiles(newaddedfileslist)
          return message.success(t("filequeuedforremoval"))
        } 
      }
    }
  }

  async function fetchFile(fileid){

    const idlist = []
    for (const f of controls.evidences){
      idlist.push(f.id)
    }

    if (idlist.includes(fileid)){
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
    } else {
      //File was not uploaded yet!
      for (const f of addedfiles){
        if (fileid === f.id){
          download(f.file,f.file.name)
        } 
      }
    }
  }

  async function onUpdateStage3(comm, dead) {

    // This will be empty if we're sending data as Compliance team.
    const data = new FormData();
    for (const f of addedfiles){
      data.append("files", f.file)
    };
    data.append('comment',comm)
    data.append('deadline',dead)
    setTableLoading(true)

    const deleteresult = await fetch(
      process.env.REACT_APP_API_ENDPOINT + "/assessment/stage3/update/"+controlinstanceid,
      {
        method: "DELETE",
        mode: "cors",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({files: deletedfiles}),
      }
    );

    /* Update call takes care of adding comment. */
    const addresult = await fetch(
      process.env.REACT_APP_API_ENDPOINT + "/assessment/stage3/update/"+controlinstanceid,
      {
        method: "POST",
        mode: "cors",
        credentials: "include",
        body: data,
      }
    );

    if ((deleteresult.status === 200 || deleteresult.status === 204) && addresult.status === 200) {
      setTableLoading(false)
      history.goBack();
      message.success(t("assessmentsubmitsuccess"))
    } else {
      setTableLoading(false)
      message.error(t("assessmentsubmiterror"))
    }
  }
  
  async function onSetStage3(reason, passed) {

    const data = {passed: passed}
    if (reason) data.reason = reason

    const result = await fetch(
    process.env.REACT_APP_API_ENDPOINT + "/assessment/stage3/set/"+controlinstanceid,
    {
      method: "PUT",
      mode: "cors",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (result.status === 200) {
    history.goBack();
    message.success(t("assessmentsubmitsuccess"))
  } else {
    message.error(t("assessmentsubmiterror"))
  }
  }

  async function onUpdateStage3Modal() {
    let comment = ''

    Modal.confirm({
      title: t("send"),
      icon: <SendOutlined style={{color: "#9C844C"}}/>,
      maskClosable: true,
      okType: "default",
      okButtonProps: {type: "primary"},
      cancelText:t("back"),
      okText:t("send"),
      onOk: () => {onUpdateStage3(comment)},
      content: (
        <div>
            <div style={{marginBottom: "1.5rem"}}>
              <span>{t("canaddcomment")}</span>
              <Form name="comment-form" fields={[{ name: ["comment"]} ]} >
                  <Form.Item name="comment">
                      <TextArea size="large" autoSize showCount maxLength={200} style={{marginBottom:"0px", marginTop:"1rem"}} onChange={(e) => comment = e.target.value}></TextArea>
                  </Form.Item>
              </Form>
          </div>
        </div>
      ),
    });
  }

  async function onRequestReviewStage3Modal() {
    let comment = ''
    let deadline = ''

    Modal.confirm({
      title: t("reviewrequest"),
      icon: <SendOutlined/>,
      maskClosable: true,
      okType: "default",
      okButtonProps: {type: "primary"},
      cancelText:t("back"),
      okText:t("send"),
      onOk: () => {onUpdateStage3(comment, deadline)},
      content: (
        <div>
            <div style={{marginBottom: "1.5rem"}}>
              <span>{t("canaddcomment")}</span>
              <Form name="comment-form" fields={[{ name: ["comment"]} ]} >
                  <Form.Item name="comment">
                      <TextArea size="large" autoSize showCount maxLength={200} style={{marginBottom:"0px", marginTop:"1rem"}} onChange={(e) => comment = e.target.value}></TextArea>
                  </Form.Item>
              </Form>
              <span>{t("canadddeadline")}</span>
              <Form name="deadline-form" fields={[{ name: ["comment"]} ]} >
                  <Form.Item style={{width: "100%"}} name="deadline">
                      <DatePicker placeholder={t("selectdate")} size="large" style={{width: "100%", marginBottom:"0px", marginTop:"1rem"}} format="DD/MM/YYYY" onChange={(e) => deadline = e}></DatePicker>
                  </Form.Item>
              </Form>
          </div>
        </div>
      ),
    });
  }

  async function onRejectStage3Modal() {
    let reason = null
    //FIXME: Automatick check on NA??

    Modal.confirm({
      title: t("reject"),
      icon: <StopOutlined style={{color: "#f5222d"}}/>,
      maskClosable: true,
      okType: "default",
      okButtonProps: {type: "primary"},
      cancelText:t("back"),
      okText:t("send"),
      onOk: () => {onSetStage3(reason, false)},
      content: (
        <div>
          <div style={{marginBottom: "1.5rem", marginTop: "1.5rem"}}>
            <Radio.Group onChange={(e) => reason = e.target.value}>
              <Space direction="vertical">
                <Radio value={"evidencesnotsufficient"}>{t("evidencesnotsufficient")}</Radio>
                <Radio value={"evidencesnonexistent"}>{t("evidencesnonexistent")}</Radio>
              </Space>
            </Radio.Group>
          </div>
        </div>
      ),
    });
  }

  async function onCompleteStage3Modal() {
    //FIXME: Automatick check on NA??

    Modal.confirm({
      title: t("send"),
      icon: <SendOutlined style={{color: "#9C844C"}}/>,
      maskClosable: true,
      okType: "default",
      okButtonProps: {type: "primary"},
      cancelText:t("back"),
      okText:t("send"),
      onOk: () => {onSetStage3(false,true)},
      content: (
        <div>
          <div style={{marginBottom: "1.5rem", marginTop: "1.5rem"}}>
            <span>{t("requestconfirmation")}</span>
          </div>
        </div>
      ),
    });
  }

  /*  STAGE 3 FUNCTIONS END HERE */

  return (
    <Layout style={{minHeight: "100vh"}}>
      <CustomSider selectedMenu="assessment"/>
        <Layout className="site-layout">
        <CustomHeader title={t("appTitle")} breadcrumb={ <Breadcrumb className="flex-center-row" itemRender={itemRender} routes={routes}/>} ></CustomHeader>
          <Content className="content">
            <Spin size="large" spinning={loadingState}>
              {controls && (controls.stage === 3 || controls.stage === 4) ? (
                <Row className="flex-center-row" gutter={16}>
                  <Col span={20}>
                    <Divider className="contenttitle" orientation="left">{(controls && controls.score === null ? t("assessmentcompilation") : t("assessmentcompleted") )+ " - "+ (controls && controls.control.name)}</Divider>
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
              {controls && controls.stage === 0 & controls.auth === JSON.parse(window.localStorage.getItem('authlevel')) ? (
              <div className="endpage-buttons" style={controls && controls.stage === 0 ? {} : {display: "none"}} >              
                <Button onClick={() => history.goBack()}>
                    {t("back")}
                </Button>
                <Button type="primary" onClick={() => {onCompleteStage1Modal(model.data)}} style={{ marginLeft: "1rem" }} >
                    {t("send")}
                </Button>
              </div>
              )
              :
              (
              <></>
              )
              }
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
              {controls && controls.stage === 1 & controls.auth === JSON.parse(window.localStorage.getItem('authlevel')) ? (
              <div className="endpage-buttons" style={controls && controls.stage === 1 ? {} : {display: "none"}} >  
              <Button onClick={() => history.goBack()}>
                  {t("back")}
              </Button>
              {JSON.parse(window.localStorage.getItem('authlevel')) === 0 ? (
                <>
              <Button className="warning-btn" onClick={() => {onRequestReviewStage2Modal()}} style={{ marginLeft: "1rem" }}>
              {t("reviewrequest")}
              </Button>
              <Button type="danger" onClick={() => {onRejectStage2Modal()}} style={{ marginLeft: "1rem" }}>
                  {t("reject")}
              </Button>
              </>
              ) : (
                <></>
              )}
              <Button type="primary" onClick={() => {JSON.parse(window.localStorage.getItem('authlevel')) === 1 ? onUpdateStage2Modal() : onCompleteStage2Modal()}} style={{ marginLeft: "1rem" }} >
                  {t("send")}
              </Button>
            </div>
              )
              :
              (
              <></>
              )
              }
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
                  <Table dataSource={files} columns={columns} loading={tableLoading} rowKey="id" rowClassName={() => 'clickable-pointer'} style={{marginBottom:"1.5rem"}}/>
                <Upload 
                accept=".txt, .csv, .pdf, .png, .jpeg, .jpg, .md, .svg, .mp4"
                style={{ width: "100%"}} 
                fileList={files}
                showUploadList={false}
                multiple={false} 
                beforeUpload={file => {
                  if (file.size/(1000*1024) > 5.0 ){
                    // File is too heavy, abort
                    message.error(t("errorFileSizeExceeded"))
                    return false;
                  } else {
                    //FIXME: This has issues with multiple loading due to state racing. Either disable multiple uploads or intercept state updates using useRef.
                    console.log("Payload executed, data is halfway up");
                    const newuuid = uuid()
                    
                    //Add to file list or table visualization
                    const newfilelist = [...files]
                    newfilelist.push({id: newuuid , name: file.name, type: file.type, size: file.size}) 
                    setFiles(newfilelist)
                    
                    //Add to added list
                    const newaddedfileslist = [...addedfiles]
                    newaddedfileslist.push({id: newuuid, file: file})
                    setAddedfiles(newaddedfileslist)

                    message.success(t("filequeuedforadding"))
                    return false; // Prevent upload for queue creation.
                  }
                }}>
                {controls && controls.stage === 2 & controls.auth === JSON.parse(window.localStorage.getItem('authlevel')) ? (
                  <Button type="primary" style={JSON.parse(window.localStorage.getItem('authlevel')) === 0 ? {display: "none"} : { width: "100%"}} icon={<UploadOutlined />}>
                    Upload (Max 5Mb)
                  </Button>
                  )
                  :
                  (
                  <></>
                  )
                  }
                </Upload>
                </div>
              </div>
              ) : (<></>)}
              {controls && controls.stage === 2 & controls.auth === JSON.parse(window.localStorage.getItem('authlevel')) ? (
              <div className="endpage-buttons" style={controls && controls.stage === 2 ? {} : {display: "none"}} >  
                <Button onClick={() => history.goBack()}>
                    {t("back")}
                </Button>
                {JSON.parse(window.localStorage.getItem('authlevel')) === 0 ? (
                  <>
                <Button className="warning-btn" onClick={() => {onRequestReviewStage3Modal()}} style={{ marginLeft: "1rem" }}>
                {t("reviewrequest")}
                </Button>
                <Button type="danger" onClick={() => {onRejectStage3Modal()}} style={{ marginLeft: "1rem" }}>
                    {t("reject")}
                </Button>
                </>
                ) : (
                  <></>
                )}
                <Button type="primary" onClick={() => {JSON.parse(window.localStorage.getItem('authlevel')) === 1 ? onUpdateStage3Modal() : onCompleteStage3Modal()}} style={{ marginLeft: "1rem" }} >
                    {t("send")}
                </Button>
              </div>
              )
              :
              (
              <></>
              )
              }
            </div>
            {/* STAGE 3 ENDS HERE */}
            </Spin>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Deloitte Risk Advisory ©2021</Footer>
        </Layout>
      </Layout>
    );
};

export default Compilation;