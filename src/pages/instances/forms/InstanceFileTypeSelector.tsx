import { RadioInput } from "@canonical/react-components";
import type { FC } from "react";

export type InstanceFileType = "instance-backup" | "external-format";

interface Props {
  value: InstanceFileType;
  onChange: (value: InstanceFileType) => void;
}

const InstanceFileTypeSelector: FC<Props> = ({ value, onChange }) => {
  return (
    <>
      <label htmlFor="file-type">选择上传文件类型</label>
      <div id="file-type">
        <div className="u-sv1">
          <RadioInput
            label="LXD 备份归档（.tar.gz）"
            checked={value === "instance-backup"}
            onChange={() => {
              onChange("instance-backup");
            }}
          />
        </div>
        <div className="u-sv3">
          <RadioInput
            label={
              <span>
                外部格式（.qcow2、.vmdk、
                <abbr title=".qcow、.vdi、.vhdx">等</abbr>）
              </span>
            }
            checked={value === "external-format"}
            onChange={() => {
              onChange("external-format");
            }}
          />
        </div>
      </div>
    </>
  );
};

export default InstanceFileTypeSelector;
