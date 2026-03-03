import type { FC } from "react";
import type { LxdResources } from "types/resources";
import { humanFileSize } from "util/helpers";
import type { LxdClusterMemberState } from "types/cluster";

interface Props {
  resources: LxdResources;
  state?: LxdClusterMemberState;
}

const ClusterMemberDetailCPU: FC<Props> = ({ resources, state }) => {
  return (
    <table>
      <tbody>
        <tr>
          <th className="u-text--muted">架构</th>
          <td>{resources?.cpu.architecture}</td>
        </tr>
        <tr>
          <th className="u-text--muted">总数</th>
          <td>{resources?.cpu.total}</td>
        </tr>
        {state && (
          <tr>
            <th className="u-text--muted">逻辑 CPU 数</th>
            <td>{state?.sysinfo.logical_cpus}</td>
          </tr>
        )}
        <tr>
          <th className="u-text--muted">插槽</th>
          <td>
            {resources?.cpu.sockets?.map((socket, index) => (
              <div key={index}>
                <strong>{socket.name}</strong>
                <div>厂商： {socket.vendor}</div>
                <div>插槽号： {socket.socket}</div>

                {/* Cache info */}
                {(socket.cache ?? []).length > 0 && (
                  <div>
                    缓存：
                    <ul>
                      {socket.cache?.map((c, i) => (
                        <li key={i}>
                          级别 {c.level} {c.type} - {humanFileSize(c.size)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 核心 info */}
                {(socket.cores ?? []).length > 0 && (
                  <div>
                    核心：
                    <ul>
                      {socket.cores?.map((core, i) => (
                        <li key={i}>
                          核心 {core.core}, 晶粒 {core.die}
                          <ul>
                            {core.threads?.map((thread, j) => (
                              <li key={j}>
                                线程 {thread.id} (NUMA {thread.numa_node}) -{" "}
                                {thread.online ? "在线" : "离线"},{" "}
                                {thread.isolated ? "已隔离" : "未隔离"}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )) || "无"}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default ClusterMemberDetailCPU;
