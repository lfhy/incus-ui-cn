import type { FC, ReactNode } from "react";
import { Input, Notification, Select } from "@canonical/react-components";
import { optionYesNo } from "util/instanceOptions";
import type {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "./instanceAndProfileFormValues";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { getInstanceField } from "util/instanceConfigFields";
import { optionRenderer } from "util/formFields";
import SnapshotScheduleInput from "components/SnapshotScheduleInput";
import { useCurrentProject } from "context/useCurrentProject";
import { isSnapshotsDisabled } from "util/snapshots";
import SnapshotDisabledWarningLink from "components/SnapshotDisabledWarningLink";

export interface SnapshotFormValues {
  snapshots_pattern?: string;
  snapshots_expiry?: string;
  snapshots_schedule?: string;
  snapshots_schedule_stopped?: string;
}

export const snapshotsPayload = (values: InstanceAndProfileFormValues) => {
  return {
    [getInstanceField("snapshots_pattern")]: values.snapshots_pattern,
    [getInstanceField("snapshots_schedule_stopped")]:
      values.snapshots_schedule_stopped,
    [getInstanceField("snapshots_schedule")]: values.snapshots_schedule,
    [getInstanceField("snapshots_expiry")]: values.snapshots_expiry,
  };
};

interface Props {
  formik: InstanceAndProfileFormikProps;
  children?: ReactNode;
}

const InstanceSnapshotsForm: FC<Props> = ({ formik }) => {
  const { project } = useCurrentProject();
  const snapshotDisabled = isSnapshotsDisabled(project);

  return (
    <>
      {snapshotDisabled && (
        <Notification
          severity="caution"
          title={`项目 ${project?.name} 中的实例已禁用快照创建`}
        >
          <SnapshotDisabledWarningLink project={project} />
        </Notification>
      )}
      <ScrollableConfigurationTable
        rows={[
          getConfigurationRow({
            formik,
            label: "快照名称模式",
            name: "snapshots_pattern",
            help: "快照名称模板",
            inputHelp: "用于生成快照名称的模板。",
            defaultValue: "",
            children: <Input placeholder="请输入名称模式" type="text" />,
          }),

          getConfigurationRow({
            formik,
            label: "到期时间",
            name: "snapshots_expiry",
            help: "快照删除时间",
            inputHelp: "定义快照应在何时被删除。",
            defaultValue: "",
            children: <Input placeholder="请输入到期表达式" type="text" />,
          }),

          getConfigurationRow({
            formik,
            label: "为已停止实例创建快照",
            name: "snapshots_schedule_stopped",
            help: "是否自动为已停止实例创建快照",
            inputHelp: "控制是否为已停止状态的实例自动创建快照。",
            defaultValue: "",
            readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
            children: <Select options={optionYesNo} />,
          }),

          getConfigurationRow({
            formik,
            label: "计划",
            name: "snapshots_schedule",
            help: "实例自动快照计划",
            inputHelp: "设置实例自动创建快照的执行计划。",
            defaultValue: "",
            children: (
              <SnapshotScheduleInput
                value={formik.values.snapshots_schedule}
                setValue={(val) =>
                  void formik.setFieldValue("snapshots_schedule", val)
                }
              />
            ),
          }),
        ]}
      />
    </>
  );
};

export default InstanceSnapshotsForm;
