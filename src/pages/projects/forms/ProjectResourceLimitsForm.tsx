import type { FC } from "react";
import { Input } from "@canonical/react-components";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import type { ProjectFormValues } from "pages/projects/CreateProject";
import type { FormikProps } from "formik/dist/types";
import DiskSizeSelector from "components/forms/DiskSizeSelector";
import { getProjectKey } from "util/projectConfigFields";
import type { LxdConfigPair } from "types/config";
import CpuLimitInput from "components/forms/CpuLimitInput";
import MemoryLimitAvailable from "components/forms/MemoryLimitAvailable";

export interface ProjectResourceLimitsFormValues {
  limits_instances?: number;
  limits_containers?: number;
  limits_virtual_machines?: number;
  limits_disk?: string;
  limits_networks?: number;
  limits_cpu?: number;
  limits_memory?: string;
  limits_processes?: number;
}

export const resourceLimitsPayload = (
  values: ProjectFormValues,
): LxdConfigPair => {
  return {
    [getProjectKey("limits_instances")]: values.limits_instances?.toString(),
    [getProjectKey("limits_containers")]: values.limits_containers?.toString(),
    [getProjectKey("limits_virtual_machines")]:
      values.limits_virtual_machines?.toString(),
    [getProjectKey("limits_disk")]: values.limits_disk?.toString(),
    [getProjectKey("limits_networks")]: values.limits_networks?.toString(),
    [getProjectKey("limits_cpu")]: values.limits_cpu?.toString(),
    [getProjectKey("limits_memory")]: values.limits_memory?.toString(),
    [getProjectKey("limits_processes")]: values.limits_processes?.toString(),
  };
};

interface Props {
  formik: FormikProps<ProjectFormValues>;
}

const ProjectResourceLimitsForm: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          name: "limits_instances",
          label: "实例最大数量",
          help: "项目中可创建的实例最大数量",
          defaultValue: "",
          children: <Input placeholder="请输入数量" min={0} type="number" />,
        }),

        getConfigurationRow({
          formik,
          name: "limits_containers",
          label: "容器最大数量",
          help: "项目中可创建的容器最大数量",
          defaultValue: "",
          children: <Input placeholder="请输入数量" min={0} type="number" />,
        }),

        getConfigurationRow({
          formik,
          name: "limits_virtual_machines",
          label: "虚拟机最大数量",
          help: "项目中可创建的虚拟机最大数量",
          defaultValue: "",
          children: <Input placeholder="请输入数量" min={0} type="number" />,
        }),

        getConfigurationRow({
          formik,
          name: "limits_disk",
          label: "最大磁盘空间（所有实例总计）",
          help: "项目可使用的最大磁盘空间",
          defaultValue: "",
          children: (
            <DiskSizeSelector
              setMemoryLimit={(val?: string) =>
                void formik.setFieldValue("limits_disk", val)
              }
            />
          ),
        }),

        getConfigurationRow({
          formik,
          name: "limits_networks",
          label: "网络最大数量",
          help: "项目可拥有的网络最大数量",
          defaultValue: "",
          children: <Input placeholder="请输入数量" min={0} type="number" />,
        }),

        getConfigurationRow({
          formik,
          name: "limits_cpu",
          label: "CPU 总量上限",
          help: "项目内所有实例 CPU 限制总和上限",
          defaultValue: "",
          children: <CpuLimitInput placeholder="请输入数量" type="number" />,
        }),

        getConfigurationRow({
          formik,
          name: "limits_memory",
          label: "内存限制总和上限",
          help: "项目内所有实例内存限制总和上限",
          defaultValue: "",
          children: (
            <DiskSizeSelector
              setMemoryLimit={(val?: string) =>
                void formik.setFieldValue("limits_memory", val)
              }
              helpTotal={<MemoryLimitAvailable />}
            />
          ),
        }),

        getConfigurationRow({
          formik,
          name: "limits_processes",
          label: "进程总数上限",
          help: "项目内所有实例进程数量总和上限",
          defaultValue: "-",
          children: <Input placeholder="请输入数量" min={0} type="number" />,
        }),
      ]}
    />
  );
};

export default ProjectResourceLimitsForm;
