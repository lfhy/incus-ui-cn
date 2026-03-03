import type { FC } from "react";
import type { LxdResources } from "types/resources";
import { humanFileSize } from "util/helpers";
import Meter from "components/Meter";
import type { LxdClusterMemberState } from "types/cluster";

interface Props {
  resources: LxdResources;
  state?: LxdClusterMemberState;
}

const ClusterMemberDetailMemory: FC<Props> = ({ resources, state }) => {
  const totalSwap = state?.sysinfo.free_swap ?? 0;
  const freeSwap = state?.sysinfo.free_swap ?? 0;

  return (
    <table>
      <tbody>
        <tr>
          <th className="u-text--muted">总量</th>
          <td>{humanFileSize(resources?.memory?.total ?? 0)}</td>
        </tr>
        <tr>
          <th className="u-text--muted">已用</th>
          <td>{humanFileSize(resources?.memory?.used ?? 0)}</td>
        </tr>
        {state && (
          <>
            <tr>
              <th className="u-text--muted">空闲</th>
              <td>{humanFileSize(state?.sysinfo.free_ram ?? 0)}</td>
            </tr>
            <tr>
              <th className="u-text--muted">共享</th>
              <td>{humanFileSize(state?.sysinfo.shared_ram ?? 0)}</td>
            </tr>
            <tr>
              <th className="u-text--muted">缓存</th>
              <td>{humanFileSize(state?.sysinfo.buffered_ram ?? 0)}</td>
            </tr>
            <tr>
              <th className="u-text--muted">交换空间</th>
              <td>
                <Meter
                  percentage={(100 / totalSwap) * (totalSwap - freeSwap)}
                  text={
                    humanFileSize(totalSwap - freeSwap) +
                    " / " +
                    humanFileSize(totalSwap)
                  }
                  hoverText={
                    `空闲： ${humanFileSize(freeSwap)}\n` +
                    `总量： ${humanFileSize(totalSwap)}`
                  }
                />
              </td>
            </tr>
          </>
        )}
        <tr>
          <th className="u-text--muted">大页内存</th>
          <td>
            <div>已用： {resources?.memory.hugepages_used}</div>
            <div>总量： {resources?.memory.hugepages_total}</div>
            <div>
              大小： {humanFileSize(resources?.memory.hugepages_size ?? 0)}
            </div>
          </td>
        </tr>
        {resources?.memory.nodes?.map((node, index) => (
          <tr key={index}>
            <th className="u-text--muted">NUMA 节点 {node.numa_node}</th>
            <td>
              <div>已用： {humanFileSize(node.used)}</div>
              <div>总量： {humanFileSize(node.total)}</div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ClusterMemberDetailMemory;
