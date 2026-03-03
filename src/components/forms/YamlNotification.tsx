import type { FC } from "react";
import { useState } from "react";
import { Notification } from "@canonical/react-components";
import DocLink from "components/DocLink";

const loadClosed = (entity: string) => {
  const saved = localStorage.getItem(`yamlNotificationClosed${entity}`);
  return Boolean(saved);
};

const saveClosed = (entity: string) => {
  localStorage.setItem(`yamlNotificationClosed${entity}`, "yes");
};

interface Props {
  entity: string;
  docPath: string;
}

const YamlNotification: FC<Props> = ({ entity, docPath }) => {
  const [closed, setClosed] = useState(loadClosed(entity));
  const entityLabel =
    entity === "instance" ? "实例" : entity === "profile" ? "配置文件" : entity;

  if (closed) {
    return null;
  }

  const handleClose = () => {
    saveClosed(entity);
    setClosed(true);
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
      // ensure the Yaml editor is resized after the notification is closed
    }, 250);
  };

  return (
    <Notification
      severity="information"
      title="YAML 配置"
      onDismiss={handleClose}
      actions={[
        <DocLink docPath={docPath} key="learn-more-link">
          了解更多{entityLabel}相关信息
        </DocLink>,
      ]}
    >
      这是该{entityLabel}的 YAML 表示。
    </Notification>
  );
};

export default YamlNotification;
