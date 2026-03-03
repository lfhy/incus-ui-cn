import type { FC } from "react";
import type { LxdResources } from "types/resources";
import { formatSeconds } from "util/seconds";
import type { LxdClusterMemberState } from "types/cluster";

interface Props {
  resources: LxdResources;
  state?: LxdClusterMemberState;
}

const ClusterMemberDetailSystem: FC<Props> = ({ resources, state }) => {
  return (
    <table>
      <tbody>
        {state && (
          <>
            <tr>
              <th className="u-text--muted">运行时长</th>
              <td>
                {state?.sysinfo.uptime
                  ? formatSeconds(state?.sysinfo.uptime)
                  : "-"}
              </td>
            </tr>
            <tr>
              <th className="u-text--muted">平均负载</th>
              <td>{state?.sysinfo.load_averages.join(" ")}</td>
            </tr>
            <tr>
              <th className="u-text--muted">进程数</th>
              <td>{state?.sysinfo.processes}</td>
            </tr>
          </>
        )}
        <tr>
          <th className="u-text--muted">UUID</th>
          <td>{resources?.system.uuid}</td>
        </tr>
        <tr>
          <th className="u-text--muted">厂商</th>
          <td>{resources?.system.vendor}</td>
        </tr>
        <tr>
          <th className="u-text--muted">产品</th>
          <td>{resources?.system.product}</td>
        </tr>
        <tr>
          <th className="u-text--muted">系列</th>
          <td>{resources?.system.family || "不适用"}</td>
        </tr>
        <tr>
          <th className="u-text--muted">版本</th>
          <td>{resources?.system.version}</td>
        </tr>
        <tr>
          <th className="u-text--muted">SKU</th>
          <td>{resources?.system.sku || "不适用"}</td>
        </tr>
        <tr>
          <th className="u-text--muted">类型</th>
          <td>{resources?.system.type}</td>
        </tr>

        {/* Firmware section */}
        {resources?.system.firmware && (
          <>
            <tr>
              <th className="u-text--muted">固件厂商</th>
              <td>{resources.system.firmware.vendor}</td>
            </tr>
            <tr>
              <th className="u-text--muted">固件日期</th>
              <td>{resources.system.firmware.date}</td>
            </tr>
            <tr>
              <th className="u-text--muted">固件版本</th>
              <td>{resources.system.firmware.version}</td>
            </tr>
          </>
        )}

        {/* Chassis section */}
        {resources?.system.chassis && (
          <>
            <tr>
              <th className="u-text--muted">机箱厂商</th>
              <td>{resources.system.chassis.vendor}</td>
            </tr>
            <tr>
              <th className="u-text--muted">机箱类型</th>
              <td>{resources.system.chassis.type}</td>
            </tr>
            <tr>
              <th className="u-text--muted">机箱序列号</th>
              <td>{resources.system.chassis.serial || "不适用"}</td>
            </tr>
            <tr>
              <th className="u-text--muted">机箱版本</th>
              <td>{resources.system.chassis.version || "不适用"}</td>
            </tr>
          </>
        )}

        {/* Motherboard section */}
        {resources?.system.motherboard && (
          <>
            <tr>
              <th className="u-text--muted">主板厂商</th>
              <td>{resources.system.motherboard.vendor}</td>
            </tr>
            <tr>
              <th className="u-text--muted">主板产品</th>
              <td>{resources.system.motherboard.product}</td>
            </tr>
            <tr>
              <th className="u-text--muted">主板序列号</th>
              <td>{resources.system.motherboard.serial || "不适用"}</td>
            </tr>
            <tr>
              <th className="u-text--muted">主板版本</th>
              <td>{resources.system.motherboard.version || "不适用"}</td>
            </tr>
          </>
        )}
      </tbody>
    </table>
  );
};

export default ClusterMemberDetailSystem;
