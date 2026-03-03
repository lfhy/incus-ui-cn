import type { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { optionYesNo } from "util/instanceOptions";
import type {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "./instanceAndProfileFormValues";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { getInstanceField } from "util/instanceConfigFields";
import { optionRenderer } from "util/formFields";

export interface BootFormValues {
  boot_autostart?: string;
  boot_autostart_delay?: string;
  boot_autostart_priority?: string;
  boot_host_shutdown_timeout?: string;
  boot_stop_priority?: string;
}

export const bootPayload = (values: InstanceAndProfileFormValues) => {
  return {
    [getInstanceField("boot_autostart")]: values.boot_autostart?.toString(),
    [getInstanceField("boot_autostart_delay")]:
      values.boot_autostart_delay?.toString(),
    [getInstanceField("boot_autostart_priority")]:
      values.boot_autostart_priority?.toString(),
    [getInstanceField("boot_host_shutdown_timeout")]:
      values.boot_host_shutdown_timeout?.toString(),
    [getInstanceField("boot_stop_priority")]:
      values.boot_stop_priority?.toString(),
  };
};

interface Props {
  formik: InstanceAndProfileFormikProps;
}

const BootForm: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "自动启动",
          name: "boot_autostart",
          help: "守护进程启动时是否总是自动启动实例",
          inputHelp: "用于控制守护进程启动后是否自动启动该实例。",
          defaultValue: "",
          readOnlyRenderer: (val) =>
            val === "-" ? "-" : optionRenderer(val, optionYesNo),
          children: <Select options={optionYesNo} />,
        }),

        getConfigurationRow({
          formik,
          label: "自动启动延迟",
          name: "boot_autostart_delay",
          help: "实例启动后的延迟时间",
          inputHelp: "设置自动启动前等待的秒数。",
          defaultValue: "",
          children: <Input placeholder="请输入数字" type="number" />,
        }),

        getConfigurationRow({
          formik,
          label: "自动启动优先级",
          name: "boot_autostart_priority",
          help: "实例启动顺序优先级",
          inputHelp: "数值越大，启动顺序越靠前。",
          defaultValue: "",
          children: <Input placeholder="请输入数字" type="number" />,
        }),

        getConfigurationRow({
          formik,
          label: "主机关机超时",
          name: "boot_host_shutdown_timeout",
          help: "等待实例关闭的超时时间",
          inputHelp: "设置主机关机时等待实例关闭的秒数。",
          defaultValue: "",
          children: <Input placeholder="请输入数字" type="number" />,
        }),

        getConfigurationRow({
          formik,
          label: "停止优先级",
          name: "boot_stop_priority",
          help: "实例关闭顺序优先级",
          inputHelp: "数值越大，停止顺序越靠后。",
          defaultValue: "",
          children: <Input placeholder="请输入数字" type="number" />,
        }),
      ]}
    />
  );
};

export default BootForm;
