import type { FC } from "react";
import { useState } from "react";
import {
  Button,
  Col,
  CustomLayout,
  Icon,
  Row,
  Spinner,
} from "@canonical/react-components";
import BrowserImport from "pages/login/BrowserImport";
import { Navigate } from "react-router-dom";
import { useAuth } from "context/auth";
import PasswordModal from "pages/login/PasswordModal";

interface Certs {
  crt: string;
  pfx: string;
}

const CertificateGenerate: FC = () => {
  const [isGenerating, setGenerating] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [certs, setCerts] = useState<Certs | null>(null);
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <Spinner className="u-loader" text="加载中..." isMainComponent />;
  }

  if (isAuthenticated) {
    return <Navigate to="/ui" replace={true} />;
  }

  const closeModal = () => {
    setModalOpen(false);
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const createCert = (password: string) => {
    closeModal();
    setGenerating(true);

    const worker = new Worker(
      new URL("../../util/certificate?worker", import.meta.url),
      { type: "module" },
    );

    worker.onmessage = (event: MessageEvent<Certs>) => {
      setCerts(event.data);
      setGenerating(false);
      worker.terminate();
    };

    worker.onerror = (error) => {
      console.error("Web Worker error:", error);
      setGenerating(false);
      worker.terminate();
    };

    worker.postMessage(password);
  };

  const downloadBase64 = (name: string, base64: string) => {
    const linkSource = `data:application/octet-stream;base64,${base64}`;
    const downloadLink = document.createElement("a");

    downloadLink.href = linkSource;
    downloadLink.download = name;
    downloadLink.click();
  };

  const downloadText = (name: string, text: string) => {
    const data = encodeURIComponent(text);
    const linkSource = `data:text/plain;charset=utf-8,${data}`;
    const downloadLink = document.createElement("a");

    downloadLink.href = linkSource;
    downloadLink.download = name;
    downloadLink.click();
  };

  const crtFileName = `incus-ui.crt`;

  return (
    <CustomLayout
      mainClassName="certificate-generate"
      header={
        <div className="p-panel__header is-sticky">
          <h1 className="p-panel__title">设置 Incus UI</h1>
        </div>
      }
    >
      <Row className="u-no-margin--left">
        <Col size={12}>
          <ol className="p-stepped-list--detailed">
            <li className="p-stepped-list__item">
              <Row>
                <Col size={3}>
                  <h2 className="p-stepped-list__title p-heading--5">生成</h2>
                </Col>
                <Col size={6}>
                  <div className="p-stepped-list__content">
                    <p>创建新的证书</p>
                  </div>
                </Col>
                <Col size={3}>
                  {isModalOpen && (
                    <PasswordModal
                      onClose={closeModal}
                      onConfirm={createCert}
                    />
                  )}
                  <Button
                    onClick={openModal}
                    appearance="positive"
                    disabled={isGenerating || certs !== null}
                    hasIcon={isGenerating}
                    aria-label={`${isGenerating ? "生成中" : "生成"}证书`}
                  >
                    {isGenerating && (
                      <Icon
                        className="is-light u-animation--spin"
                        name="spinner"
                      />
                    )}
                    <span>{isGenerating ? "生成中" : "生成"}</span>
                  </Button>
                  {certs !== null && <Icon name="success" />}
                </Col>
              </Row>
            </li>
            <li className="p-stepped-list__item">
              <Row>
                <Col size={3}>
                  <h2 className="p-stepped-list__title p-heading--5">信任</h2>
                </Col>
                <Col size={8}>
                  <div className="p-stepped-list__content">
                    <Row>
                      <Col size={6}>
                        <p>
                          下载 <code>.crt</code> 文件并将其添加到 Incus 信任存储
                        </p>
                      </Col>
                      {certs && (
                        <Col size={2}>
                          <Button
                            className="download-crt"
                            onClick={() => {
                              downloadText(crtFileName, certs.crt);
                            }}
                          >
                            下载&nbsp;crt
                          </Button>
                        </Col>
                      )}
                    </Row>
                    <div className="p-code-snippet">
                      <pre className="p-code-snippet__block--icon">
                        <code>
                          incus config trust add-certificate Downloads/
                          {crtFileName}
                        </code>
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
                <Col size={8}>
                  <BrowserImport
                    sendPfx={
                      certs
                        ? () => {
                            downloadBase64(`incus-ui.pfx`, certs.pfx);
                          }
                        : undefined
                    }
                  />
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

export default CertificateGenerate;
