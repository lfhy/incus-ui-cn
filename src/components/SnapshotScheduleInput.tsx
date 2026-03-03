import type { FC } from "react";
import { useState } from "react";
import { Input, RadioInput, Select } from "@canonical/react-components";

const snapshotOptions = [
  {
    label: "每分钟",
    value: "* * * * *",
  },
  {
    label: "每小时",
    value: "@hourly",
  },
  {
    label: "每天",
    value: "@daily",
  },
  {
    label: "每周",
    value: "@weekly",
  },
  {
    label: "每月",
    value: "@monthly",
  },
  {
    label: "每年",
    value: "@yearly",
  },
];

interface Props {
  value?: string;
  setValue: (value: string) => void;
}

const SnapshotScheduleInput: FC<Props> = ({ value, setValue }) => {
  const [cronSyntax, setCronSyntax] = useState(!value?.startsWith("@"));

  return (
    <div>
      <div className="snapshot-schedule">
        <RadioInput
          label="Cron 语法"
          checked={cronSyntax}
          onChange={() => {
            setCronSyntax(true);
            setValue("");
          }}
        />
        <RadioInput
          label="选择间隔"
          checked={!cronSyntax}
          onChange={() => {
            setCronSyntax(false);
            setValue("@daily");
          }}
        />
      </div>
      {cronSyntax ? (
        <Input
          id="snapshots_schedule"
          name="snapshots_schedule"
          placeholder="请输入 Cron 表达式"
          help="<minute> <hour> <dom> <month> <dow>，或用逗号分隔的别名列表（@hourly、@daily、@midnight、@weekly、@monthly、@annually、@yearly）；留空表示禁用自动快照（默认）"
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
      ) : (
        <Select
          id="snapshots_schedule"
          name="snapshots_schedule"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          options={snapshotOptions}
        />
      )}
    </div>
  );
};

export default SnapshotScheduleInput;
