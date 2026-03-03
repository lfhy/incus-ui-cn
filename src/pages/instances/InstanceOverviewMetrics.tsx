import type { FC } from "react";
import { useState } from "react";
import { Spinner } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchInstanceState } from "api/metrics";
import { getInstanceMetrics, getInstanceMetricReport } from "util/metricSelectors";
import { humanCpuUsage, humanFileSize } from "util/helpers";
import Meter from "components/Meter";
import type { LxdInstance, LxdInstanceState } from "types/instance";
import { useAuth } from "context/auth";
import InstanceUsageMemory from "pages/instances/InstanceUsageMemory";
import InstanceUsageFilesystem from "pages/instances/InstanceUsageFilesystem";
import { useMetrics } from "context/useMetrics";
import InstanceUsageCpu from "pages/instances/InstanceUsageCpu";
import { isRootDisk } from "util/instanceValidation";
import { FormDevice } from "util/formDevices";

interface Props {
  instance: LxdInstance;
  onFailure: (title: string, e: unknown) => void;
}

const InstanceOverviewMetrics: FC<Props> = ({ instance, onFailure }) => {
  const { isRestricted } = useAuth();
  const [isShowAllFilesystems, setShowAllFilesystems] = useState(false);

    const {
    data: state,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.metrics],
    queryFn: () => fetchInstanceState(instance.name, instance.project),
    refetchInterval: 15 * 1000, // 15 seconds
    enabled: !isRestricted,
  });

  const getRootDiskName = (intsance: LxdInstance) => {
    for (let key in instance.expanded_devices) {
      if (isRootDisk(instance.expanded_devices[key] as FormDevice)) {
        return key;
      }
    }

    return "";
  };

  const hasRootDisk = (instance: LxdInstance, state: LxdInstanceState | undefined) => {
    if (!state) {
      return false;
    }

    if (state.disk == null || typeof state.disk != "object") {
      return false
    }

    let diskName = getRootDiskName(instance);
    if (diskName != "" && Object.hasOwn(state.disk, diskName)) {
      return true;
    }

    return false;
  };

  const getRootDisk = (instance: LxdInstance, state: LxdInstanceState | undefined) => {
    if (!state || !hasRootDisk(instance, state)) {
      return null;
    }

    return state.disk[getRootDiskName(instance)];
  };

  const rootDisk = getRootDisk(instance, state);

  if (error) {
    onFailure("加载指标失败", error);
  }

  if (isRestricted) {
    return (
      <div className="u-text--muted">
        受限权限用户无法查看详细信息
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <Spinner className="u-loader" text="正在加载指标..." />
      ) : (
        <table>
          <tbody>
            <tr className="metric-row">
              <th className="u-text--muted">CPU 时间（秒）</th>
              <td>
                {state && state.cpu && state.cpu.usage > 0 ? (
                  <div>
                    {humanCpuUsage(state.cpu.usage)}
                  </div>
                ) : (
                  "-"
                )}
              </td>
            </tr>
            <tr className="metric-row">
              <th className="u-text--muted">内存</th>
              <td>
                {state && state.memory ? (
                  <div>
                    <Meter
                      percentage={
                        (100 / state.memory.total) *
                        state.memory.usage
                      }
                      text={
                        humanFileSize(
                          state.memory.usage
                        ) +
                        " / " +
                        humanFileSize(state.memory.total) +
                        " 已使用"
                      }
                    />
                  </div>
                ) : (
                  "-"
                )}
              </td>
            </tr>
            <tr className="metric-row">
              <th className="u-text--muted">根文件系统</th>
              <td>
                {rootDisk ? (
                  <div>
                    <Meter
                      percentage={
                        (rootDisk.total ? ((100 / rootDisk.total) * rootDisk.usage) : 0)
                      }
                      text={
                        humanFileSize(
                          rootDisk.usage
                        ) +
                        " / " +
                        (rootDisk.total ? (humanFileSize(rootDisk.total) +
                        " 已使用") : ("无限制"))
                      }
                    />
                  </div>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </>
  );
};

export default InstanceOverviewMetrics;
