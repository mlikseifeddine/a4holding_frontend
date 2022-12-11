import { Modal, PageHeader, message, Dropdown, Menu, Button, Typography, Tag} from 'antd';
import {
    GlobalOutlined,
    LogoutOutlined,
    UserOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons';
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../providers/AuthContext";
import i18n from '../i18n';
import { useEffect } from 'react';

const { Title, Paragraph } = Typography;

const CustomHeader = (props) => {
    const { title, breadcrumb  } = props;
    const { t } = useTranslation();
    const history = useHistory();
    const auth = useAuth();

    useEffect(() => {
        if (auth.user === undefined) auth.checkAuth();
        i18n.changeLanguage(window.localStorage.getItem('i18nextLng'))
      }, [auth]);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        window.localStorage.setItem('i18nextLng', lng);
      }

    const menu_language = (
    <Menu>
        <Menu.Item key="0">
        <Button type="link" onClick={() => changeLanguage("it-IT")} >Italiano</Button>
        </Menu.Item>
        <Menu.Item key="1">
        <Button type="link" onClick={() => changeLanguage("en-US")} >English</Button>
        </Menu.Item>
    </Menu>
    );

    const menu_user = (
    <Menu>
        <Menu.Item key="0">
        <Button type="link" icon={<LogoutOutlined/>} onClick={() => onLogOutConfirmationRequest()} >Log Out</Button>
        </Menu.Item>
    </Menu>
    );
    
    
    async function onLogOutConfirmationRequest() {

        const onFinish = async () => {
            const result = await auth.signout();
        
            if (result) {
              history.push("/login");
            } else {
              message.error("Could not sign out")
            }
          };
    
        Modal.confirm({
          title: t("logout"),
          icon: <LogoutOutlined style={{color: "#9C844C"}}/>,
          maskClosable: true,
          okType: "default",
          okButtonProps: {type: "primary"},
          cancelText:t("back"),
          okText:t("logout"),
          onOk: () => {onFinish()},
          content: (
            <div>
                <div style={{marginBottom: "1.5rem"}}>
                  <span>{t("logoutconfirmation")}</span>
              </div>
            </div>
          ),
        });
    }

    function info() {
      Modal.info({
        title: t("helpboxtitle"),
        width: "60%",
        content: (
          <div>
          <div style={{marginTop:"2.5rem"}}>
            <Title level={3}>{t("dms")}</Title>
            <Paragraph>{t("dmsubtitle")}</Paragraph>
            <Paragraph>
              <ul>
                {t("dmtext",{returnObjects: true}).map((text)=> (
                  <li><Paragraph>{text}</Paragraph></li>
                ))}
              </ul>
            </Paragraph>
          </div>
          <div style={{marginTop:"2.5rem"}}>
            <Title level={3}>{t("cms")}</Title>
            <Paragraph>{t("cmsubtitle")}</Paragraph>
            <Paragraph>
              <ul>
                {t("cmtext",{returnObjects: true}).map((text)=> (
                  <li><Paragraph>{text}</Paragraph></li>
                ))}
              </ul>
            </Paragraph>
          </div>
          </div>
        ),
        onOk() {},
      });
    }

    return (
        <PageHeader 
        className="pageheader" 
        title={title}
        subTitle={breadcrumb} 
        extra={[ 
        <div key="2" className="flex-center-row">
            {/* FIXME: Improve navbar layout. */}
            {auth.user && auth.user.auth === 1 ? 
            <Tag key="dm" color="red">{t("domainmanager")}</Tag>
            :
            <Tag key="cm" color="green">{t("compliancemanager")}</Tag>
            }
            <Dropdown overlay={menu_user} trigger={['click']} >
                <Button type="link" icon={ <UserOutlined />}>{auth.user.name}</Button>
            </Dropdown>
            <Dropdown overlay={menu_language} trigger={['click']} >
                <Button type="link" icon={ <GlobalOutlined />}/>
            </Dropdown>
            <Button type="link" onClick={() => info()} icon={ <QuestionCircleOutlined />}/>
        </div>
        ]}
        />
    );
};

export default CustomHeader;