import type { FC } from "react";
import { RadioInput } from "@canonical/react-components";
import type { CpuLimit } from "types/limits";
import { CPU_LIMIT_TYPE } from "types/limits";
import CpuLimitInput from "components/forms/CpuLimitInput";
import { useCurrentProject } from "context/useCurrentProject";

interface Props {
  cpuLimit?: CpuLimit;
  setCpuLimit: (cpuLimit: CpuLimit) => void;
  help?: string;
}

const CpuLimitSelector: FC<Props> = ({ cpuLimit, setCpuLimit, help }) => {
  const { project } = useCurrentProject();

  if (!cpuLimit) {
    return null;
  }

  return (
    <div>
      <div className="cpu-limit-label">
        <RadioInput
          label="数量"
          checked={cpuLimit.selectedType === CPU_LIMIT_TYPE.DYNAMIC}
          onChange={() => {
            setCpuLimit({ selectedType: CPU_LIMIT_TYPE.DYNAMIC });
          }}
        />
        <RadioInput
          label="固定核"
          checked={cpuLimit.selectedType === CPU_LIMIT_TYPE.FIXED}
          onChange={() => {
            setCpuLimit({ selectedType: CPU_LIMIT_TYPE.FIXED });
          }}
        />
      </div>
      {cpuLimit.selectedType === CPU_LIMIT_TYPE.DYNAMIC && (
        <CpuLimitInput
          id="limits_cpu"
          name="limits_cpu"
          type="number"
          min="1"
          step="1"
          placeholder="请输入暴露的核心数量"
          onChange={(e) => {
            setCpuLimit({ ...cpuLimit, dynamicValue: e.target.value });
          }}
          value={cpuLimit.dynamicValue ?? ""}
          project={project}
          help={help}
        />
      )}
      {cpuLimit.selectedType === CPU_LIMIT_TYPE.FIXED && (
        <CpuLimitInput
          id="limits_cpu"
          name="limits_cpu"
          type="text"
          placeholder="请输入逗号分隔的核心编号"
          onChange={(e) => {
            setCpuLimit({ ...cpuLimit, fixedValue: e.target.value });
          }}
          value={cpuLimit.fixedValue ?? ""}
          project={project}
          help={help}
        />
      )}
    </div>
  );
};

export default CpuLimitSelector;
