import type { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import type { CreateInstanceFormValues } from "pages/instances/CreateInstance";
import MemoryLimitSelector from "./MemoryLimitSelector";
import CpuLimitSelector from "./CpuLimitSelector";
import type { CpuLimit, MemoryLimit } from "types/limits";
import { cpuLimitToPayload, memoryLimitToPayload } from "util/limits";
import { optionAllowDeny, diskPriorities } from "util/instanceOptions";
import type {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "./instanceAndProfileFormValues";
import { DEFAULT_CPU_LIMIT, DEFAULT_MEM_LIMIT } from "util/defaults";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { getInstanceField } from "util/instanceConfigFields";
import { optionRenderer } from "util/formFields";

export interface ResourceLimitsFormValues {
  limits_cpu?: CpuLimit;
  limits_memory?: MemoryLimit;
  limits_memory_swap?: string;
  limits_disk_priority?: number;
  limits_processes?: number;
}

export const resourceLimitsPayload = (values: InstanceAndProfileFormValues) => {
  return {
    [getInstanceField("limits_cpu")]: cpuLimitToPayload(values.limits_cpu),
    [getInstanceField("limits_memory")]: memoryLimitToPayload(
      values.limits_memory,
    ),
    [getInstanceField("limits_memory_swap")]: values.limits_memory_swap,
    [getInstanceField("limits_disk_priority")]:
      values.limits_disk_priority?.toString(),
    [getInstanceField("limits_processes")]: values.limits_processes?.toString(),
  };
};

interface Props {
  formik: InstanceAndProfileFormikProps;
}

const ResourceLimitsForm: FC<Props> = ({ formik }) => {
  const isInstance = formik.values.entityType === "instance";
  const isContainerOnlyDisabled =
    isInstance &&
    (formik.values as CreateInstanceFormValues).instanceType !== "container";

  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          name: "limits_cpu",
          label: "可用 CPU 限制",
          help: "实例可见的 CPU 核心范围",
          inputHelp: "指定向实例暴露哪些 CPU 核心。",
          defaultValue: DEFAULT_CPU_LIMIT,
          readOnlyRenderer: (val) =>
            cpuLimitToPayload(val as CpuLimit | string | undefined),
          children: (
            <CpuLimitSelector
              cpuLimit={formik.values.limits_cpu}
              setCpuLimit={(cpuLimit) => {
                formik.setFieldValue("limits_cpu", cpuLimit);
              }}
            />
          ),
        }),

        getConfigurationRow({
          formik,
          name: "limits_memory",
          label: "内存限制",
          help: "主机内存使用上限",
          inputHelp: "限制实例可使用的主机内存。",
          defaultValue: DEFAULT_MEM_LIMIT,
          readOnlyRenderer: (val) =>
            memoryLimitToPayload(val as MemoryLimit | undefined) ?? "",
          children: (
            <MemoryLimitSelector
              memoryLimit={formik.values.limits_memory}
              setMemoryLimit={(memoryLimit) =>
                void formik.setFieldValue("limits_memory", memoryLimit)
              }
            />
          ),
        }),

        getConfigurationRow({
          formik,
          name: "limits_memory_swap",
          label: "内存交换（仅容器）",
          help: "控制实例是否可使用交换内存",
          inputHelp: "控制实例对 swap 的使用。",
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
          name: "limits_disk_priority",
          label: "磁盘优先级",
          help: "实例 I/O 请求优先级",
          inputHelp: "设置实例磁盘 I/O 请求的优先级。",
          defaultValue: "",
          children: <Select options={diskPriorities} />,
        }),

        getConfigurationRow({
          formik,
          name: "limits_processes",
          label: "最大进程数（仅容器）",
          help: "实例可运行的最大进程数",
          inputHelp: "限制实例内可同时运行的进程数量。",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled ? "仅容器可用" : undefined,
          children: (
            <Input
              placeholder="请输入数字"
              min={1}
              type="number"
              disabled={isContainerOnlyDisabled}
            />
          ),
        }),
      ]}
    />
  );
};

export default ResourceLimitsForm;
