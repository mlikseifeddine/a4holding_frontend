import { Layout, Breadcrumb, Row, Col, Divider, Result } from 'antd';
import { useLocation } from "react-router-dom";
import { itemRender } from "../utils/utils.jsx";
import { useTranslation } from "react-i18next";
import CustomSider from '../components/CustomSider'
import CustomHeader from '../components/CustomHeader';
import { useEffect } from 'react';
import { useAuth } from '../providers/AuthContext.jsx';
import wip from '../img/wip.png'

const { Content, Footer } = Layout;

const Dashboard = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const auth = useAuth();

  useEffect(() => {
      if (auth.user === undefined) auth.checkAuth();
    }, [auth]);

  const routes = [
    {
      path: location.pathname,
      breadcrumbName: t("dashboard"),
    },
  ];

  return (
    <Layout style={{minHeight: "100vh"}}>
      <CustomSider selectedMenu="dashboard"/>
        <Layout className="site-layout">
        <CustomHeader title={t("appTitle")} breadcrumb={ <Breadcrumb className="flex-center-row" itemRender={itemRender} routes={routes}/>} ></CustomHeader>
          <Content className="content">
          <Row className="flex-center-row" gutter={16}>
            <Col span={24}>
              <Divider className="contenttitle" orientation="center">{t("welcome")+", "+auth.user.name}</Divider>
            </Col>
          </Row>
          <div className="inner-container flex-center-column" style={{height: "100%"}}>
            <Result
              title={t("wip")}
              icon={<img src={wip} alt="wip" style={{maxWidth:"50%"}}></img>}
            />
          </div> 
          </Content>
          <Footer style={{ textAlign: 'center' }}>Deloitte Risk Advisory ©2021</Footer>
        </Layout>
      </Layout>
    );
};

export default Dashboard;