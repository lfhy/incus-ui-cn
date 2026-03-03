import type { FC } from "react";
import { Select } from "@canonical/react-components";
import type {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "./instanceAndProfileFormValues";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { getInstanceField } from "util/instanceConfigFields";
import { optionRenderer } from "util/formFields";
import {
  clusterEvacuationOptions,
  optionAllowDeny,
} from "util/instanceOptions";
import type { CreateInstanceFormValues } from "pages/instances/CreateInstance";

export interface MigrationFormValues {
  migration_stateful?: string;
  cluster_evacuate?: string;
}

export const migrationPayload = (values: InstanceAndProfileFormValues) => {
  return {
    [getInstanceField("migration_stateful")]: values.migration_stateful,
    [getInstanceField("cluster_evacuate")]: values.cluster_evacuate,
  };
};

interface Props {
  formik: InstanceAndProfileFormikProps;
}

const MigrationForm: FC<Props> = ({ formik }) => {
  const isInstance = formik.values.entityType === "instance";
  const isVmOnlyDisabled =
    isInstance &&
    (formik.values as CreateInstanceFormValues).instanceType !==
      "virtual-machine";

  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "有状态迁移",
          name: "migration_stateful",
          help: "是否允许有状态停止/启动和快照",
          inputHelp: "控制是否允许实例执行有状态停止/启动及快照操作。",
          defaultValue: "",
          disabled: isVmOnlyDisabled,
          disabledReason: isVmOnlyDisabled ? "仅虚拟机可用" : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowDeny),
          children: (
            <Select options={optionAllowDeny} disabled={isVmOnlyDisabled} />
          ),
        }),
        getConfigurationRow({
          formik,
          label: "集群疏散策略",
          name: "cluster_evacuate",
          help: "实例疏散时的处理策略",
          inputHelp: "定义在集群疏散实例时应采取的操作。",
          defaultValue: "auto",
          readOnlyRenderer: (val) =>
            optionRenderer(val, clusterEvacuationOptions),
          children: <Select options={clusterEvacuationOptions} />,
        }),
      ]}
    />
  );
};

export default MigrationForm;
