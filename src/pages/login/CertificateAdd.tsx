import type { FC } from "react";
import {
  Col,
  CustomLayout,
  Notification,
  Row,
  Spinner,
  useNotify,
} from "@canonical/react-components";
import { Navigate } from "react-router-dom";
import { useAuth } from "context/auth";
import CertificateAddForm from "pages/login/CertificateAddForm";
import NotificationRow from "components/NotificationRow";

const CertificateAdd: FC = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const notify = useNotify();

  if (isAuthLoading) {
    return <Spinner className="u-loader" text="加载中..." isMainComponent />;
  }

  if (isAuthenticated) {
    return <Navigate to="/ui" replace={true} />;
  }

  return (
    <CustomLayout
      mainClassName="certificate-generate"
      header={
        <div className="p-panel__header is-sticky">
          <h1 className="p-panel__title">添加已有证书</h1>
        </div>
      }
    >
      {notify.notification ? (
        <NotificationRow />
      ) : (
        <Row>
          <Notification severity="caution">
            浏览器中必须存在并已选择客户端证书。
            <br />
          </Notification>
        </Row>
      )}
      <Row className="u-no-margin--left">
        <Col size={12}>
          <ol className="p-stepped-list--detailed">
            <li className="p-stepped-list__item">
              <Row>
                <Col size={3}>
                  <h2 className="p-stepped-list__title p-heading--5">
                    创建令牌
                  </h2>
                </Col>
                <Col size={6}>
                  <div className="p-stepped-list__content">
                    <p>在命令行生成令牌</p>
                    <div className="p-code-snippet">
                      <pre className="p-code-snippet__block--icon">
                        <code>incus config trust add incus-ui</code>
                      </pre>
                    </div>
                  </div>
                </Col>
              </Row>
            </li>
            <li className="p-stepped-list__item">
              <Row>
                <Col size={3}>
                  <h2 className="p-stepped-list__title p-heading--5">导入</h2>
                </Col>
                <Col size={6}>
                  <div className="p-stepped-list__content">
                    <CertificateAddForm />
                  </div>
                </Col>
              </Row>
            </li>
            <li className="p-stepped-list__item u-no-margin--bottom">
              <Row>
                <Col size={3}>
                  <h2 className="p-stepped-list__title p-heading--5">完成</h2>
                </Col>
                <Col size={6}>
                  <div className="p-stepped-list__content">
                    <p>开始使用 Incus UI。</p>
                  </div>
                </Col>
              </Row>
            </li>
          </ol>
        </Col>
      </Row>
    </CustomLayout>
  );
};

export default CertificateAdd;
