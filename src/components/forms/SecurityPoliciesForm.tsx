import type { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import type { CreateInstanceFormValues } from "pages/instances/CreateInstance";
import classnames from "classnames";
import {
  optionAllowDeny,
  optionTrueFalse,
  optionYesNo,
} from "util/instanceOptions";
import type {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "./instanceAndProfileFormValues";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { getInstanceField } from "util/instanceConfigFields";
import { optionRenderer } from "util/formFields";

export interface SecurityPoliciesFormValues {
  security_protection_delete?: string;
  security_privileged?: string;
  security_nesting?: string;
  security_protection_shift?: string;
  security_idmap_base?: string;
  security_idmap_size?: number;
  security_idmap_isolated?: string;
  security_devlxd?: string;
  security_devlxd_images?: string;
  security_secureboot?: string;
  security_csm?: string;
}

export const securityPoliciesPayload = (
  values: InstanceAndProfileFormValues,
) => {
  return {
    [getInstanceField("security_protection_delete")]:
      values.security_protection_delete,
    [getInstanceField("security_privileged")]: values.security_privileged,
    [getInstanceField("security_nesting")]: values.security_nesting,
    [getInstanceField("security_protection_shift")]:
      values.security_protection_shift,
    [getInstanceField("security_idmap_base")]: values.security_idmap_base,
    [getInstanceField("security_idmap_size")]:
      values.security_idmap_size?.toString(),
    [getInstanceField("security_idmap_isolated")]:
      values.security_idmap_isolated,
    [getInstanceField("security_devlxd")]: values.security_devlxd,
    [getInstanceField("security_devlxd_images")]: values.security_devlxd_images,
    [getInstanceField("security_secureboot")]: values.security_secureboot,
    [getInstanceField("security_csm")]: values.security_csm,
  };
};

interface Props {
  formik: InstanceAndProfileFormikProps;
}

const SecurityPoliciesForm: FC<Props> = ({ formik }) => {
  const isInstance = formik.values.entityType === "instance";
  const isContainerOnlyDisabled =
    isInstance &&
    (formik.values as CreateInstanceFormValues).instanceType !== "container";
  const isVmOnlyDisabled =
    isInstance &&
    (formik.values as CreateInstanceFormValues).instanceType !==
      "virtual-machine";

  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "删除保护",
          name: "security_protection_delete",
          help: "防止实例被删除",
          inputHelp: "是否保护实例不被删除。",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: <Select options={optionYesNo} />,
        }),

        getConfigurationRow({
          formik,
          label: "特权模式（仅容器）",
          name: "security_privileged",
          help: "是否以特权模式运行实例",
          inputHelp: "是否以特权模式运行该实例。",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled ? "仅容器可用" : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowDeny),
          children: (
            <Select
              options={optionAllowDeny}
              disabled={isContainerOnlyDisabled}
            />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "嵌套（仅容器）",
          name: "security_nesting",
          help: "是否支持在实例内运行 Incus（嵌套）",
          inputHelp: "是否允许在实例内部运行嵌套 Incus。",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled ? "仅容器可用" : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowDeny),
          children: (
            <Select
              options={optionAllowDeny}
              disabled={isContainerOnlyDisabled}
            />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "UID/GID 映射保护（仅容器）",
          name: "security_protection_shift",
          help: "是否保护文件系统不被 UID/GID 映射变换",
          inputHelp: "是否防止文件系统被执行 UID/GID 映射偏移。",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled ? "仅容器可用" : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: (
            <Select options={optionYesNo} disabled={isContainerOnlyDisabled} />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "基础主机 ID（仅容器）",
          name: "security_idmap_base",
          help: "用于分配的基础主机 ID",
          inputHelp: "设置用于 UID/GID 分配的基础主机 ID。",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled ? "仅容器可用" : undefined,
          children: (
            <Input
              placeholder="请输入 ID"
              type="text"
              disabled={isContainerOnlyDisabled}
              labelClassName={classnames({
                "is-disabled": isContainerOnlyDisabled,
              })}
            />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "ID 映射大小（仅容器）",
          name: "security_idmap_size",
          help: "ID 映射范围大小",
          inputHelp: "设置 UID/GID 映射可用的大小范围。",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled ? "仅容器可用" : undefined,
          children: (
            <Input
              placeholder="请输入数字"
              type="number"
              min={0}
              disabled={isContainerOnlyDisabled}
              labelClassName={classnames({
                "is-disabled": isContainerOnlyDisabled,
              })}
            />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "独立 ID 映射（仅容器）",
          name: "security_idmap_isolated",
          help: "是否使用独立 ID 映射",
          inputHelp: "是否为该实例分配独立的 UID/GID 映射。",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled ? "仅容器可用" : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: (
            <Select options={optionYesNo} disabled={isContainerOnlyDisabled} />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "允许实例内使用 /dev/lxd",
          name: "security_devlxd",
          help: "允许在实例内访问 /dev/lxd",
          inputHelp: "是否允许实例访问 /dev/lxd 设备。",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled ? "仅容器可用" : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: (
            <Select options={optionYesNo} disabled={isContainerOnlyDisabled} />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "通过 /dev/lxd 访问 /1.0/images API（仅容器）",
          name: "security_devlxd_images",
          help: "使 /dev/lxd 可访问 /1.0/images API",
          inputHelp: "是否允许通过 /dev/lxd 使用 /1.0/images API。",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled ? "仅容器可用" : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: (
            <Select options={optionYesNo} disabled={isContainerOnlyDisabled} />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "启用 Secure Boot（仅虚拟机）",
          name: "security_secureboot",
          help: "是否启用安全启动",
          inputHelp: "是否为虚拟机启用 Secure Boot。",
          defaultValue: "",
          disabled: isVmOnlyDisabled,
          disabledReason: isVmOnlyDisabled ? "仅虚拟机可用" : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionTrueFalse),
          children: (
            <Select options={optionTrueFalse} disabled={isVmOnlyDisabled} />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "启用 CSM（仅虚拟机）",
          name: "security_csm",
          help: "是否启用 CSM",
          inputHelp: "是否为虚拟机启用 CSM 兼容模式。",
          defaultValue: "",
          disabled: isVmOnlyDisabled,
          disabledReason: isVmOnlyDisabled ? "仅虚拟机可用" : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionTrueFalse),
          children: (
            <Select options={optionTrueFalse} disabled={isVmOnlyDisabled} />
          ),
        }),
      ]}
    />
  );
};

export default SecurityPoliciesForm;
