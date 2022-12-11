import React from 'react';
import { Result, Button } from 'antd';
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

const Unauthorized = () => {
  const { t } = useTranslation();
  const history = useHistory();
  
  return (
  <div style={{minHeight: "100vh"}} className="flex-center-column">
    <Result
      status="403"
      title="403"
      className="flex-center-column"
      subTitle={t("unauthorized")}
      extra={<Button type="primary" onClick={() => { history.push("/dashboard") }}>{t("backto")} {t("dashboard")}</Button>}
    />
  </div>
  )
};

export default Unauthorized;