import type { FC } from "react";
import { Icon, Tooltip } from "@canonical/react-components";
import { useSettings } from "context/useSettings";
import { UI_VERSION } from "util/version";

const Version: FC = () => {
  const { data: settings } = useSettings();

  const serverVersion = settings?.environment?.server_version;
  if (!serverVersion) {
    return null;
  }

  const isOutdated = false;

  return (
    <>
      <span className="server-version p-text--small">
        {isOutdated && (
          <Tooltip
            message="你正在使用较旧的服务器版本。更新 LXD 服务器可获得最新特性。"
            tooltipClassName="version-warning"
            zIndex={1000}
          >
            <Icon name="warning" className="version-warning-icon" />
          </Tooltip>
        )}
        版本 {serverVersion}-ui-{UI_VERSION}
      </span>
    </>
  );
};

export default Version;
