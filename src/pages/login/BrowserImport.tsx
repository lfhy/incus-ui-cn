import type { FC } from "react";
import { useState } from "react";
import {
  Button,
  Col,
  Notification,
  Row,
  Tabs,
} from "@canonical/react-components";

const FIREFOX = "Firefox";
const CHROME_LINUX = "Chrome (Linux)";
const CHROME_WINDOWS = "Chrome (Windows)";
const EDGE = "Edge";
const MACOS = "macOS";
const TABS: string[] = [FIREFOX, CHROME_LINUX, CHROME_WINDOWS, EDGE, MACOS];

interface Props {
  sendPfx?: () => void;
}

const BrowserImport: FC<Props> = ({ sendPfx }) => {
  const [activeTab, handleTabChange] = useState(FIREFOX);

  const windowsDialogSteps = (
    <>
      <li className="p-list__item">
        这会打开证书管理对话框。点击 <code>Import...</code>，然后点击{" "}
        <code>Next</code> 并选择刚下载的 <code>incus-ui.pfx</code>{" "}
        文件。输入密码； 如果未设置密码可留空。然后点击 <code>Next</code>。
      </li>
      <li className="p-list__item">
        选择 <code>Automatically select the certificate store</code>，点击{" "}
        <code>Next</code>，再点击 <code>Finish</code>。
      </li>
      <li className="p-list__item">
        重启浏览器并打开 Incus UI，选择 Incus UI 证书。
      </li>
    </>
  );

  const downloadPfx = (
    <li className="p-list__item u-clearfix">
      下载用于导入浏览器的 <code>.pfx</code> 文件。
      {sendPfx && (
        <div className="u-float-right--large">
          <Button onClick={sendPfx}>下载 pfx</Button>
        </div>
      )}
    </li>
  );

  return (
    <Row>
      <Col size={8}>
        <Tabs
          links={TABS.map((tab) => ({
            label: tab,
            active: tab === activeTab,
            onClick: () => {
              handleTabChange(tab);
            },
          }))}
        />

        {activeTab === FIREFOX && (
          <div role="tabpanel" aria-label="firefox">
            <ul className="p-list--divided u-no-margin--bottom">
              {downloadPfx}
              <li className="p-list__item">
                将以下链接粘贴到地址栏：
                <div className="p-code-snippet u-no-margin--bottom">
                  <pre className="p-code-snippet__block">
                    <code>about:preferences#privacy</code>
                  </pre>
                </div>
              </li>
              <li className="p-list__item">
                下拉到证书区域，点击 <code>View Certificates</code> 按钮。
              </li>
              <li className="p-list__item">
                在弹窗中点击 <code>Your certificates</code>，然后点击{" "}
                <code>Import</code>。
              </li>
              <li className="p-list__item">
                选择刚下载的 <code>.pfx</code>{" "}
                文件。输入密码；如果未设置密码可留空。
              </li>
              <li className="p-list__item">
                重启浏览器并打开 Incus UI，选择 Incus UI 证书。
              </li>
            </ul>
          </div>
        )}

        {activeTab === CHROME_LINUX && (
          <div role="tabpanel" aria-label="chrome linux">
            <ul className="p-list--divided u-no-margin--bottom">
              {downloadPfx}
              <li className="p-list__item">
                粘贴到地址栏：
                <div className="p-code-snippet u-no-margin--bottom">
                  <pre className="p-code-snippet__block">
                    <code>chrome://settings/certificates</code>
                  </pre>
                </div>
              </li>
              <li className="p-list__item">
                点击 <code>Import</code> 按钮并选择刚下载的{" "}
                <code>incus-ui.pfx</code> 文件。输入密码；如果未设置密码可留空。
              </li>
              <li className="p-list__item">
                重启浏览器并打开 Incus UI，选择 Incus UI 证书。
              </li>
            </ul>
          </div>
        )}

        {activeTab === CHROME_WINDOWS && (
          <div role="tabpanel" aria-label="chrome windows">
            <ul className="p-list--divided u-no-margin--bottom">
              {downloadPfx}
              <li className="p-list__item">
                粘贴到地址栏：
                <div className="p-code-snippet u-no-margin--bottom">
                  <pre className="p-code-snippet__block">
                    <code>chrome://settings/security</code>
                  </pre>
                </div>
              </li>
              <li className="p-list__item">
                下拉到 <code>Advanced settings</code>，点击{" "}
                <code>Manage device certificates</code>
              </li>
              {windowsDialogSteps}
            </ul>
          </div>
        )}

        {activeTab === EDGE && (
          <div role="tabpanel" aria-label="edge windows">
            <ul className="p-list--divided u-no-margin--bottom">
              {downloadPfx}
              <li className="p-list__item">
                Paste into the address bar:
                <div className="p-code-snippet u-no-margin--bottom">
                  <pre className="p-code-snippet__block">
                    <code>edge://settings/privacy</code>
                  </pre>
                </div>
              </li>
              <li className="p-list__item">
                Scroll to the <code>Security</code> section and click{" "}
                <code>Manage Certificates</code>
              </li>
              {windowsDialogSteps}
            </ul>
          </div>
        )}

        {activeTab === MACOS && (
          <div role="tabpanel" aria-label="safari macos">
            <ul className="p-list--divided u-no-margin--bottom">
              <li className="p-list__item">
                <Notification
                  severity="caution"
                  className="u-no-margin--bottom"
                >
                  证书必须设置密码保护。macOS 上空密码会导致导入失败。
                </Notification>
              </li>
              {downloadPfx}
              <li className="p-list__item">
                在 Mac 上打开“钥匙串访问”，选择“登录”钥匙串。
              </li>
              <li className="p-list__item">
                将 <code>incus-ui.pfx</code> 文件拖入“钥匙串访问”应用。
              </li>
              <li className="p-list__item">
                如果提示输入名称和密码，请填写这台电脑管理员用户的名称和密码。
              </li>
              <li className="p-list__item">
                重启浏览器并打开 Incus UI，选择 Incus UI 证书。
              </li>
            </ul>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default BrowserImport;
