import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { UserOutlined, LockOutlined  } from "@ant-design/icons";
import { Layout, Form, Input, Button, Alert } from "antd";

import Logo from "../img/logo.png";
import { useAuth } from "../providers/AuthContext";

const { Content, Footer } = Layout;

const Login = () => {
  const { t } = useTranslation();
  const auth = useAuth();
  const history = useHistory();

  const [showAlert, setShowAlert] = useState(false);

  const onFinish = async (values) => {
    const result = await auth.signin(values.username, values.password);

    if (result) {
      history.push("/dashboard");
    } else {
      setShowAlert(true);
    }
  };

  return (
    <Layout className="Layout">
      <div className="LoginAlertContainer">
        {showAlert && (
          <Alert
            style={{ width: "23rem", marginTop: "2rem" }}
            message={t("wrongusernameorpassword")}
            banner
            closable
          />
        )}
      </div>
      <Content style={{ padding: "0 50px", height: "80vh" }} className="emptycontainer">
        <div className="flex-center-column">
          <img className="Logo" src={Logo} alt="Foo" />
          <Form
            style={{width: "100%"}}
            name="normal_login"
            className="login-form"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: t("loginUsernameFormError") }]}
            >
              <Input
                prefix={<LockOutlined  />}
                size="large"
                placeholder={t("loginUsernamePlaceholder")}
              />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: t("loginPasswordFormError") }]}
            >
              <Input.Password
                prefix={<UserOutlined />}
                size="large"
                placeholder={t("loginPasswordPlaceholder")}
              />
            </Form.Item>
            <Form.Item>
              <Button style={{width: "100%", marginTop: "3rem", borderRadius: 25, boxShadow: "0px 20px 25px -10px rgb(0 0 0 / 25%)"}} type="primary" htmlType="submit">
                Log in with Active Directory
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Deloitte Risk Advisory ©2021
      </Footer>
    </Layout>
  );
};

export default Login;