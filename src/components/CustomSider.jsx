import { Layout, Menu} from 'antd';
import {
  AreaChartOutlined,
  FormOutlined,
  DashboardOutlined,
  TableOutlined,
  UserOutlined,
  WarningOutlined,
  SnippetsOutlined,
  ProjectOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from 'react';
import logo from "../img/logo.png"

const { Sider } = Layout;
const { SubMenu } = Menu;

const CustomSider = (props) => {
    const { selectedMenu, isOpen } = props;
    const { t } = useTranslation();
    const history = useHistory();

    // Handles collapsed state locally, refers value in LocalStorage
    const [ collapsed, setCollapsed ] = useState(JSON.parse(window.sessionStorage.getItem('collapsedState')))

    const onCollapse = collapsed => {
        window.sessionStorage.setItem('collapsedState', collapsed);
        setCollapsed( collapsed );
    };

    return (
        <Sider theme="light" collapsible collapsed={collapsed} onCollapse={onCollapse}
        style={{ 
        overflow: 'auto', 
        height: '100vh', 
        position: 'sticky', 
        top: 0, 
        left: 0, 
        zIndex: 1, 
        boxShadow:'0px 2px 8px 0px rgb(0 0 0 / 15%)'}}>
            <div style={collapsed ? {width:'75%', height: '64px'} : {}} className="sidebar-logo">
                <img src={logo} alt="A4 sider logo" style={{maxWidth: "100%", maxHeight: "100%"}} className="flex-center-column"/>
            </div>
            <Menu mode="inline" defaultSelectedKeys={[selectedMenu]} defaultOpenKeys={isOpen && !collapsed ? ["sub1"] : []}>
                <Menu.Item key="dashboard" onClick={() => { history.push("/dashboard") }} icon={<DashboardOutlined />}>
                {t("dashboard")}
                </Menu.Item>
                <Menu.Item key="assessment" onClick={() => { history.push("/assessment") }} icon={<FormOutlined />}>
                {t("assessment")}
                </Menu.Item>
                {JSON.parse(window.localStorage.getItem('authlevel')) === 0 ? (
                <Menu.Item key="resultsriskmaps" onClick={() => { history.push("/results") }} icon={<AreaChartOutlined />}>
                {t("resultsriskmaps")}
                </Menu.Item>
                ) : (
                <></>
                )}
                <Menu.Item key="compilationhistory" onClick={() => { history.push("/history") }} icon={<HistoryOutlined />}>
                {t("compilationhistory")}
                </Menu.Item>
                {JSON.parse(window.localStorage.getItem('authlevel')) === 0 ? (
                <SubMenu key="sub1" icon={<TableOutlined />} title={t("registry")}>
                    <Menu.Item key="processes" onClick={() => history.push('/processes')} icon={<ProjectOutlined />} >{t("processes")}</Menu.Item>
                    <Menu.Item key="controls" onClick={() => history.push('/controls')} icon={<SnippetsOutlined />} >{t("controls")}</Menu.Item>
                    <Menu.Item key="risks" onClick={() => history.push('/risks')} icon={<WarningOutlined />} >{t("risks")}</Menu.Item>
                    <Menu.Item key="users" onClick={() => history.push('/users')} icon={<UserOutlined />} >{t("users")}</Menu.Item>
                </SubMenu>
                ) : (
                <></>
                )}
            </Menu>
        </Sider>
    );
};

export default CustomSider;