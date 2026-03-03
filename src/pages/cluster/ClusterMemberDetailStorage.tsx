import type { FC } from "react";
import type { LxdResources } from "types/resources";
import { humanFileSize } from "util/helpers";

interface Props {
  resources: LxdResources;
}

const ClusterMemberDetailStorage: FC<Props> = ({ resources }) => {
  return (
    <table>
      <tbody>
        {resources?.storage.disks?.map((disk, i) => (
          <tr key={i}>
            <th className="u-text--muted">磁盘 #{i + 1}</th>
            <td>
              <div>
                型号： <strong>{disk.model}</strong>
              </div>
              <div>类型： {disk.type}</div>
              <div>ID： {disk.id}</div>
              <div>序列号： {disk.serial}</div>
              <div>大小： {humanFileSize(disk.size)}</div>
              <div>固件： {disk.firmware_version}</div>
              <div>只读： {disk.read_only ? "是" : "否"}</div>
              <div>已挂载： {disk.mounted ? "是" : "否"}</div>
              <div>可移除： {disk.removable ? "是" : "否"}</div>
              <div>转速： {disk.rpm}</div>
              <div>块大小： {humanFileSize(disk.block_size)}</div>
              <div>PCI 地址： {disk.pci_address}</div>
              <div>NUMA 节点： {disk.numa_node}</div>
              <div>设备路径： {disk.device_path}</div>
              <div>设备 ID： {disk.device_id}</div>
              <div>WWN： {disk.wwn}</div>

              {/* Partitions */}
              {(disk.partitions ?? []).length > 0 && (
                <div>
                  分区：
                  <ul>
                    {(disk.partitions ?? []).map((part, j) => (
                      <li key={j}>
                        <div>ID： {part.id}</div>
                        <div>设备： {part.device}</div>
                        <div>大小： {humanFileSize(part.size)}</div>
                        <div>分区号： {part.partition}</div>
                        <div>已挂载： {part.mounted ? "是" : "否"}</div>
                        {part.device_fs_uuid && (
                          <div>UUID： {part.device_fs_uuid}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ClusterMemberDetailStorage;
