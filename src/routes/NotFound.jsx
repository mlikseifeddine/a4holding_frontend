import React from 'react';
import { Result, Button } from 'antd';
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

const NotFound = () => {
  const { t } = useTranslation();
  const history = useHistory();
  
  return (
  <div style={{minHeight: "100vh"}} className="flex-center-column">
    <Result
      status="404"
      title="404"
      className="flex-center-column"
      subTitle={t("pagenotfound")}
      extra={<Button type="primary" onClick={() => { history.push("/dashboard") }}>{t("backto")} {t("dashboard")}</Button>}
    />
  </div>
  )
};

export default NotFound;