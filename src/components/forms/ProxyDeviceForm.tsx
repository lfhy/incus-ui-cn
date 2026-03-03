import type { FC } from "react";
import {
  Button,
  Icon,
  Input,
  Label,
  Select,
  useNotify,
  Spinner,
} from "@canonical/react-components";
import type { LxdProxyDevice } from "types/device";
import type { InstanceAndProfileFormikProps } from "./instanceAndProfileFormValues";
import { getInheritedProxies } from "util/configInheritance";
import ScrollableForm from "components/ScrollableForm";
import RenameDeviceInput from "components/forms/RenameDeviceInput";
import ConfigurationTable from "components/ConfigurationTable";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import classnames from "classnames";
import {
  addNoneDevice,
  deduplicateName,
  findNoneDeviceIndex,
  removeDevice,
} from "util/formDevices";
import { getInheritedDeviceRow } from "components/forms/InheritedDeviceRow";
import { deviceKeyToLabel } from "util/devices";
import { ensureEditMode } from "util/instanceEdit";
import NewProxyBtn from "components/forms/NewProxyBtn";
import ConfigFieldDescription from "pages/settings/ConfigFieldDescription";
import { optionEnabledDisabled } from "util/instanceOptions";
import { getProxyAddress } from "util/proxyDevices";
import { useProfiles } from "context/useProfiles";
import type { CreateInstanceFormValues } from "pages/instances/CreateInstance";

interface Props {
  formik: InstanceAndProfileFormikProps;
  project: string;
}

const ProxyDeviceForm: FC<Props> = ({ formik, project }) => {
  const notify = useNotify();

  const {
    data: profiles = [],
    isLoading: isProfileLoading,
    error: profileError,
  } = useProfiles(project);

  if (profileError) {
    notify.failure("加载配置文件失败", profileError);
  }

  const inheritedProxies = getInheritedProxies(formik.values, profiles);

  const existingDeviceNames: string[] = [];
  existingDeviceNames.push(...inheritedProxies.map((item) => item.key));
  existingDeviceNames.push(...formik.values.devices.map((item) => item.name));

  const addProxy = () => {
    const copy = [...formik.values.devices];
    const isNATEnabled =
      formik.values.entityType !== "profile" &&
      (formik.values as CreateInstanceFormValues).instanceType !== "container";
    copy.push({
      type: "proxy",
      name: deduplicateName("proxy", 1, existingDeviceNames),
      nat: String(isNATEnabled),
    });
    formik.setFieldValue("devices", copy);
  };

  const hasCustomProxy = formik.values.devices.some(
    (item) => item.type === "proxy",
  );

  const getProxyDeviceFormRows = (
    label: string,
    fieldName: string,
    index: number,
    options: {
      label: string;
      value: string;
      disabled?: boolean;
    }[],
    value?: string,
    help?: string,
    onChange?: (value: string) => void,
    disabledText?: string,
  ) => {
    const key = `devices.${index}.${fieldName}`;

    return getConfigurationRowBase({
      className: "no-border-top inherited-with-form",
      configuration: <Label forId={key}>{label}</Label>,
      inherited: (
        <Select
          name={key}
          id={key}
          key={key}
          onBlur={formik.handleBlur}
          onChange={(e) => {
            ensureEditMode(formik);
            formik.setFieldValue(key, e.target.value);
            onChange?.(e.target.value);
          }}
          value={value ?? ""}
          options={options}
          help={<ConfigFieldDescription description={help} />}
          helpClassName="configuration-help"
          className="u-no-margin--bottom"
          disabled={!!disabledText || !!formik.values.editRestriction}
          title={formik.values.editRestriction ?? disabledText}
        />
      ),
      override: "",
    });
  };

  const inheritedRows: MainTableRow[] = [];
  inheritedProxies.forEach((item) => {
    const noneDeviceId = findNoneDeviceIndex(item.key, formik);
    const isNoneDevice = noneDeviceId !== -1;

    inheritedRows.push(
      getConfigurationRowBase({
        className: "no-border-top override-with-form",
        configuration: (
          <div
            className={classnames("device-name", {
              "u-text--muted": isNoneDevice,
            })}
          >
            <b>{item.key}</b>
          </div>
        ),
        inherited: (
          <div className="p-text--small u-text--muted u-no-margin--bottom">
            来源：{item.source}
          </div>
        ),
        override: isNoneDevice ? (
          <Button
            appearance="base"
            type="button"
            title="重新挂载设备"
            onClick={() => {
              ensureEditMode(formik);
              removeDevice(noneDeviceId, formik);
            }}
            className="has-icon u-no-margin--bottom"
          >
            <Icon name="connected"></Icon>
            <span>重新挂载</span>
          </Button>
        ) : (
          <Button
            disabled={!!formik.values.editRestriction}
            title={formik.values.editRestriction}
            appearance="base"
            type="button"
            onClick={() => {
              ensureEditMode(formik);
              addNoneDevice(item.key, formik);
            }}
            className="has-icon u-no-margin--bottom"
            dense
          >
            <Icon name="disconnect"></Icon>
            <span>卸载</span>
          </Button>
        ),
      }),
    );

    Object.keys(item.proxy).forEach((key) => {
      if (key === "name" || key === "type") {
        return;
      }

      inheritedRows.push(
        getInheritedDeviceRow({
          label: deviceKeyToLabel(key),
          inheritValue: item.proxy[key as keyof typeof item.proxy],
          readOnly: false,
          isDeactivated: isNoneDevice,
        }),
      );
    });
  });

  const customRows: MainTableRow[] = [];
  formik.values.devices.forEach((formDevice, index) => {
    if (formDevice.type !== "proxy") {
      return;
    }
    const device = formik.values.devices[index] as LxdProxyDevice;

    const deviceListenParts = device.listen?.split(":") || [];
    const listenType =
      deviceListenParts.length > 0 ? deviceListenParts[0] : "tcp";

    const deviceConnectParts = device.connect?.split(":") || [];
    const connectAddress =
      deviceConnectParts.length > 1 ? deviceConnectParts[1] : "";
    const connectPort =
      deviceConnectParts.length > 2 ? deviceConnectParts[2] : "";

    customRows.push(
      getConfigurationRowBase({
        className: "no-border-top custom-device-name",
        configuration: (
          <RenameDeviceInput
            name={device.name}
            index={index}
            setName={(name) => {
              ensureEditMode(formik);
              formik.setFieldValue(`devices.${index}.name`, name);
            }}
            disableReason={formik.values.editRestriction}
          />
        ),
        inherited: "",
        override: (
          <Button
            className="u-no-margin--top u-no-margin--bottom"
            onClick={() => {
              ensureEditMode(formik);
              removeDevice(index, formik);
            }}
            type="button"
            appearance="base"
            hasIcon
            dense
            disabled={!!formik.values.editRestriction}
            title={formik.values.editRestriction ?? "卸载代理设备"}
          >
            <Icon name="disconnect" />
            <span>卸载</span>
          </Button>
        ),
      }),
    );

    customRows.push(
      getProxyDeviceFormRows(
        "绑定目标",
        "bind",
        index,
        [
          { label: "请选择", value: "", disabled: true },
          { label: "主机", value: "host" },
          { label: "实例", value: "instance" },
        ],
        device.bind,
        "监听地址绑定到实例或主机",
        (value) => {
          if (value === "instance") {
            formik.setFieldValue(`devices.${index}.nat`, undefined);
          }
        },
      ),
    );

    customRows.push(
      getProxyDeviceFormRows(
        "NAT 模式",
        "nat",
        index,
        optionEnabledDisabled,
        device.nat,
        undefined,
        (value) => {
          if (value === "true") {
            formik.setFieldValue(
              `devices.${index}.connect`,
              `${listenType}:${connectAddress}:${connectPort}`,
            );
          }
        },
        device.bind === "instance"
          ? "只有绑定到主机的代理可使用 NAT"
          : undefined,
      ),
    );

    getProxyAddress(customRows, device, index, "listen", formik, "监听");

    getProxyAddress(customRows, device, index, "connect", formik, "连接");
  });

  if (isProfileLoading) {
    return <Spinner className="u-loader" text="加载中..." />;
  }

  return (
    <ScrollableForm className="device-form">
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />

      {inheritedRows.length > 0 && (
        <div className="inherited-devices">
          <h2 className="p-heading--4">继承代理设备</h2>
          <ConfigurationTable rows={inheritedRows} />
        </div>
      )}

      {hasCustomProxy && (
        <div className="custom-devices">
          <h2 className="p-heading--4 custom-devices-heading">
            自定义代理设备
          </h2>
          <ConfigurationTable rows={customRows} />
        </div>
      )}

      <NewProxyBtn
        onSelect={() => {
          ensureEditMode(formik);
          addProxy();
        }}
        disabledReason={formik.values.editRestriction}
      />
    </ScrollableForm>
  );
};
export default ProxyDeviceForm;
