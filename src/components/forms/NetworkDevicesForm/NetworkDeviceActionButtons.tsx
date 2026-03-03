import { Button, Icon } from "@canonical/react-components";
import type { FC } from "react";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import { ensureEditMode } from "util/instanceEdit";
import {
  addNicDevice,
  addNoneDevice,
  focusNicDevice,
  removeNicDevice,
} from "util/formDevices";
import type { LxdNicDevice, LxdNoneDevice } from "types/device";
import { isNicDevice, isNoneDevice } from "util/devices";
import type { InheritedNetwork } from "util/configInheritance";

interface Props {
  readOnly: boolean;
  formik: InstanceAndProfileFormikProps;
  index: number;
  device?: LxdNicDevice | LxdNoneDevice;
  inheritedDevice?: InheritedNetwork;
}

const NetworkDeviceActionButtons: FC<Props> = ({
  readOnly,
  formik,
  index,
  device,
  inheritedDevice,
}: Props) => {
  const isPurelyInherited = inheritedDevice && !device;
  const hasNicOverride = inheritedDevice && device && isNicDevice(device);
  const hasNoneOverride = inheritedDevice && device && isNoneDevice(device);
  const isLocal = !inheritedDevice && device;

  const isDisabled = !!formik.values.editRestriction;

  const getEditTitle = () => {
    if (formik.values.editRestriction) return formik.values.editRestriction;
    if (isPurelyInherited || hasNoneOverride) return "创建覆盖";
    if (hasNicOverride) return "编辑覆盖";
    return "编辑网络";
  };
  const editTitle = getEditTitle();

  const onEdit = () => {
    ensureEditMode(formik);
    if (isPurelyInherited || hasNoneOverride) {
      const newDeviceIndex = formik.values.devices.length;
      addNicDevice({
        formik,
        deviceName: inheritedDevice.key,
        deviceNetworkName: inheritedDevice.network?.network ?? "",
      });
      focusNicDevice(newDeviceIndex);
    } else {
      focusNicDevice(index);
    }
  };

  const clearOverride = () => {
    ensureEditMode(formik);
    removeNicDevice({ formik, deviceName: device?.name || "" });
  };

  const detachInherited = () => {
    ensureEditMode(formik);
    addNoneDevice(inheritedDevice?.key || "", formik);
  };

  const detachOverridden = () => {
    ensureEditMode(formik);
    addNoneDevice(device?.name || "", formik);
  };

  return (
    <div className="network-device-actions">
      {(readOnly || isPurelyInherited) && (
        <Button
          onClick={onEdit}
          type="button"
          appearance="base"
          title={editTitle}
          className="u-no-margin--top"
          hasIcon
          dense
          disabled={isDisabled}
        >
          <Icon name="edit" />
          <span>编辑</span>
        </Button>
      )}

      {isPurelyInherited && (
        <Button
          className="u-no-margin--top"
          onClick={detachInherited}
          type="button"
          appearance="base"
          hasIcon
          dense
          title={formik.values.editRestriction || "卸载网络"}
          disabled={isDisabled}
        >
          <Icon name="disconnect" />
          <span>卸载</span>
        </Button>
      )}

      {hasNicOverride && (
        <>
          <Button
            className="u-no-margin--top"
            onClick={clearOverride}
            type="button"
            appearance="base"
            hasIcon
            dense
            title={formik.values.editRestriction || "清除覆盖"}
            disabled={isDisabled}
          >
            <Icon name="close" />
            <span>清除</span>
          </Button>
          <Button
            className="u-no-margin--top"
            onClick={detachInherited}
            type="button"
            appearance="base"
            hasIcon
            dense
            title={formik.values.editRestriction || "卸载网络"}
            disabled={isDisabled}
          >
            <Icon name="disconnect" />
            <span>卸载</span>
          </Button>
        </>
      )}

      {hasNoneOverride && (
        <Button
          className="u-no-margin--top"
          onClick={clearOverride}
          type="button"
          appearance="base"
          hasIcon
          dense
          title={formik.values.editRestriction || "重新挂载继承网络"}
          disabled={isDisabled}
        >
          <Icon name="connected" />
          <span>重新挂载</span>
        </Button>
      )}

      {isLocal && (
        <Button
          className="u-no-margin--top"
          onClick={detachOverridden}
          type="button"
          appearance="base"
          hasIcon
          dense
          title={formik.values.editRestriction || "卸载网络"}
          disabled={isDisabled}
        >
          <Icon name="disconnect" />
          <span>卸载</span>
        </Button>
      )}
    </div>
  );
};

export default NetworkDeviceActionButtons;
