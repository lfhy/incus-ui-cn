import type { FC } from "react";
import { useEffect, useState } from "react";
import MenuItem from "components/forms/FormMenuItem";
import { Button, useListener, useNotify } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import { hasDiskError, hasNetworkError } from "util/instanceValidation";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import { useSupportedFeatures } from "context/useSupportedFeatures";

export const MAIN_CONFIGURATION = "Main configuration";
export const DISK_DEVICES = "Disk";
export const NETWORK_DEVICES = "Network";
export const GPU_DEVICES = "GPU";
export const PROXY_DEVICES = "Proxy";
export const OTHER_DEVICES = "Other";
export const RESOURCE_LIMITS = "Resource limits";
export const SECURITY_POLICIES = "Security policies";
export const SNAPSHOTS = "Snapshots";
export const MIGRATION = "Migration";
export const BOOT = "Boot";
export const CLOUD_INIT = "Cloud init";
export const YAML_CONFIGURATION = "YAML configuration";

interface Props {
  active: string;
  setActive: (val: string) => void;
  isDisabled: boolean;
  formik: InstanceAndProfileFormikProps;
}

const ProfileFormMenu: FC<Props> = ({
  active,
  setActive,
  isDisabled,
  formik,
}) => {
  const notify = useNotify();
  const [isDeviceExpanded, setDeviceExpanded] = useState(true);
  const { hasMetadataConfiguration } = useSupportedFeatures();

  const disableReason = isDisabled
    ? "请先输入名称，再添加自定义配置"
    : undefined;

  const menuItemProps = {
    active,
    setActive,
    disableReason,
  };

  const resize = () => {
    updateMaxHeight("form-navigation", "p-bottom-controls");
  };
  useEffect(resize, [notify.notification?.message]);
  useListener(window, resize, "resize", true);

  return (
    <div className="p-side-navigation--accordion form-navigation">
      <nav aria-label="配置文件表单导航">
        <ul className="p-side-navigation__list">
          <MenuItem
            label={MAIN_CONFIGURATION}
            displayLabel="主配置"
            {...menuItemProps}
          />
          <li className="p-side-navigation__item">
            <Button
              type="button"
              className="p-side-navigation__accordion-button"
              aria-expanded={isDeviceExpanded ? "true" : "false"}
              onClick={() => {
                if (!isDisabled) {
                  setDeviceExpanded(!isDeviceExpanded);
                }
              }}
              disabled={isDisabled}
              title={disableReason}
            >
              设备
            </Button>
            <ul
              className="p-side-navigation__list"
              aria-expanded={isDeviceExpanded ? "true" : "false"}
            >
              <MenuItem
                label={DISK_DEVICES}
                displayLabel="磁盘"
                hasError={hasDiskError(formik)}
                {...menuItemProps}
              />
              <MenuItem
                label={NETWORK_DEVICES}
                displayLabel="网络"
                hasError={hasNetworkError(formik)}
                {...menuItemProps}
              />
              <MenuItem
                label={GPU_DEVICES}
                displayLabel="GPU"
                {...menuItemProps}
              />
              <MenuItem
                label={PROXY_DEVICES}
                displayLabel="代理"
                {...menuItemProps}
              />
              {hasMetadataConfiguration && (
                <MenuItem
                  label={OTHER_DEVICES}
                  displayLabel="其它"
                  {...menuItemProps}
                />
              )}
            </ul>
          </li>
          <MenuItem
            label={RESOURCE_LIMITS}
            displayLabel="资源限制"
            {...menuItemProps}
          />
          <MenuItem
            label={SECURITY_POLICIES}
            displayLabel="安全策略"
            {...menuItemProps}
          />
          <MenuItem label={SNAPSHOTS} displayLabel="快照" {...menuItemProps} />
          <MenuItem label={MIGRATION} displayLabel="迁移" {...menuItemProps} />
          <MenuItem label={BOOT} displayLabel="启动" {...menuItemProps} />
          <MenuItem
            label={CLOUD_INIT}
            displayLabel="Cloud 初始化"
            {...menuItemProps}
          />
        </ul>
      </nav>
    </div>
  );
};

export default ProfileFormMenu;
