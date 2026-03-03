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
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { LxdDeviceValue } from "types/device";
import type { LxcConfigOptionCategories } from "types/config";
import type { InstanceAndProfileFormikProps } from "./instanceAndProfileFormValues";
import { fetchConfigOptions } from "api/server";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { toConfigFields } from "util/config";
import ConfigFieldDescription from "pages/settings/ConfigFieldDescription";
import ScrollableForm from "components/ScrollableForm";
import RenameDeviceInput from "components/forms/RenameDeviceInput";
import type { EditInstanceFormValues } from "pages/instances/EditInstance";
import { getInheritedOtherDevices } from "util/configInheritance";
import {
  deviceKeyToLabel,
  getExistingDeviceNames,
  isOtherDevice,
} from "util/devices";
import classnames from "classnames";
import ConfigurationTable from "components/ConfigurationTable";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import { getInheritedDeviceRow } from "components/forms/InheritedDeviceRow";
import { ensureEditMode } from "util/instanceEdit";
import {
  addNoneDevice,
  deduplicateName,
  findNoneDeviceIndex,
  removeDevice,
} from "util/formDevices";
import { useProfiles } from "context/useProfiles";

interface Props {
  formik: InstanceAndProfileFormikProps;
  project: string;
}

const OtherDeviceForm: FC<Props> = ({ formik, project }) => {
  const notify = useNotify();
  const isInstance = formik.values.entityType === "instance";
  const isContainer =
    isInstance &&
    (formik.values as EditInstanceFormValues).instanceType === "container";
  const isVm =
    isInstance &&
    (formik.values as EditInstanceFormValues).instanceType ===
      "virtual-machine";

  const { hasMetadataConfiguration } = useSupportedFeatures();

  const { data: configOptions, isLoading: isConfigOptionsLoading } = useQuery({
    queryKey: [queryKeys.configOptions],
    queryFn: async () => fetchConfigOptions(hasMetadataConfiguration),
  });

  const {
    data: profiles = [],
    isLoading: isProfileLoading,
    error: profileError,
  } = useProfiles(project);

  if (profileError) {
    notify.failure("加载配置文件失败", profileError);
  }

  const inheritedDevices = getInheritedOtherDevices(formik.values, profiles);
  const existingDeviceNames = getExistingDeviceNames(formik.values, profiles);

  const addDevice = () => {
    const copy = [...formik.values.devices];
    copy.push({
      type: "usb",
      name: deduplicateName("custom-device", 1, existingDeviceNames),
    });
    formik.setFieldValue("devices", copy);
  };

  if (isProfileLoading || isConfigOptionsLoading) {
    return <Spinner className="u-loader" text="加载中..." />;
  }

  const hasCustomDevices = formik.values.devices.some(isOtherDevice);

  const inheritedRows: MainTableRow[] = [];
  inheritedDevices.forEach((item) => {
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
            className="u-no-margin--top u-no-margin--bottom"
            onClick={() => {
              ensureEditMode(formik);
              removeDevice(noneDeviceId, formik);
            }}
            type="button"
            appearance="base"
            hasIcon
            dense
            title="重新挂载设备"
          >
            <Icon name="connected" />
            <span>重新挂载</span>
          </Button>
        ) : (
          <Button
            className="u-no-margin--top u-no-margin--bottom"
            onClick={() => {
              ensureEditMode(formik);
              addNoneDevice(item.key, formik);
            }}
            type="button"
            appearance="base"
            hasIcon
            dense
            title={formik.values.editRestriction ?? "卸载设备"}
            disabled={!!formik.values.editRestriction}
          >
            <Icon name="disconnect" />
            <span>卸载</span>
          </Button>
        ),
      }),
    );

    Object.keys(item.device).forEach((key) => {
      if (key === "name") {
        return;
      }

      inheritedRows.push(
        getInheritedDeviceRow({
          label: deviceKeyToLabel(key),
          inheritValue: item.device[key as keyof typeof item.device],
          readOnly: false,
          isDeactivated: isNoneDevice,
        }),
      );
    });
  });

  const customRows: MainTableRow[] = [];
  formik.values.devices.forEach((formDevice, index) => {
    if (!isOtherDevice(formDevice)) {
      return;
    }
    const device = formik.values.devices[index];

    const type = ["unix-char", "unix-block"].includes(device.type)
      ? "unix-char-block"
      : device.type;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const rawOptions = (
      configOptions as
        | {
            configs?: { devices?: Record<string, LxcConfigOptionCategories> };
          }
        | undefined
    )?.configs?.devices?.[type];
    const configFields = rawOptions
      ? toConfigFields({ device: rawOptions as LxcConfigOptionCategories })
      : [];

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
            title={formik.values.editRestriction ?? "卸载设备"}
            disabled={!!formik.values.editRestriction}
          >
            <Icon name="disconnect" />
            <span>卸载</span>
          </Button>
        ),
      }),
    );

    customRows.push(
      getConfigurationRowBase({
        className: "no-border-top inherited-with-form",
        configuration: <Label forId={`devices.${index}.type`}>类型</Label>,
        inherited: (
          <Select
            name={`devices.${index}.type`}
            id={`devices.${index}.type`}
            className="u-no-margin--bottom"
            onBlur={formik.handleBlur}
            onChange={(e) => {
              ensureEditMode(formik);
              formik.setFieldValue(`devices.${index}`, {
                type: e.target.value,
                name: device.name,
              });
            }}
            value={device.type}
            options={[
              {
                label: "Infiniband（仅容器）",
                value: "infiniband",
                disabled: isVm,
              },
              {
                label: "PCI（仅虚拟机）",
                value: "pci",
                disabled: isContainer,
              },
              { label: "TPM", value: "tpm" },
              {
                label: "Unix Block（仅容器）",
                value: "unix-block",
                disabled: isVm,
              },
              {
                label: "Unix Char（仅容器）",
                value: "unix-char",
                disabled: isVm,
              },
              {
                label: "Unix Hotplug（仅容器）",
                value: "unix-hotplug",
                disabled: isVm,
              },
              { label: "USB", value: "usb" },
            ]}
            disabled={!!formik.values.editRestriction}
            title={formik.values.editRestriction}
          />
        ),
        override: "",
      }),
    );

    configFields.forEach((field) => {
      const key = `devices.${index}.${field.key}`;
      const value = device[field.key as keyof LxdDeviceValue];

      if (field.key === "name") {
        return;
      }

      customRows.push(
        getConfigurationRowBase({
          className: "no-border-top inherited-with-form",
          configuration: (
            <Label forId={key}>{deviceKeyToLabel(field.key)}</Label>
          ),
          inherited: (
            <Input
              name={key}
              id={key}
              key={`${key}-${type}`}
              onBlur={formik.handleBlur}
              onChange={(e) => {
                ensureEditMode(formik);
                formik.handleChange(e);
              }}
              value={value}
              type="text"
              placeholder={field.default}
              help={<ConfigFieldDescription description={field.shortdesc} />}
              helpClassName="configuration-help"
              className="u-no-margin--bottom"
              disabled={!!formik.values.editRestriction}
              title={formik.values.editRestriction}
            />
          ),
          override: "",
        }),
      );
    });
  });

  return (
    <ScrollableForm className="device-form">
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />

      {inheritedRows.length > 0 && (
        <div className="inherited-devices">
          <h2 className="p-heading--4">继承设备</h2>
          <ConfigurationTable rows={inheritedRows} />
        </div>
      )}

      {hasCustomDevices && (
        <div className="custom-devices">
          <h2 className="p-heading--4 custom-devices-heading">自定义设备</h2>
          <ConfigurationTable rows={customRows} />
        </div>
      )}

      <Button
        onClick={() => {
          ensureEditMode(formik);
          addDevice();
        }}
        type="button"
        hasIcon
        disabled={!!formik.values.editRestriction}
        title={formik.values.editRestriction}
      >
        <Icon name="plus" />
        <span>挂载自定义设备</span>
      </Button>
    </ScrollableForm>
  );
};

export default OtherDeviceForm;
