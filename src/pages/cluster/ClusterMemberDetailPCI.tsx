import type { FC } from "react";
import type { LxdResources } from "types/resources";

interface Props {
  resources: LxdResources;
}

const ClusterMemberDetailPCI: FC<Props> = ({ resources }) => {
  return (
    <table>
      <tbody>
        {resources?.pci.devices?.map((device, i) => (
          <tr key={i}>
            <th className="u-text--muted">设备 #{i + 1}</th>
            <td>
              <div>
                厂商： {device.vendor} ({device.vendor_id})
              </div>
              <div>
                产品： {device.product} ({device.product_id})
              </div>
              <div>PCI 地址： {device.pci_address}</div>
              <div>驱动： {device.driver || "不适用"}</div>
              <div>驱动版本： {device.driver_version || "不适用"}</div>
              <div>NUMA 节点： {device.numa_node}</div>
              <div>IOMMU 组： {device.iommu_group}</div>
              {/* Optionally show VPD if it contains keys */}
              {device.vpd && Object.keys(device.vpd).length > 0 && (
                <div>
                  VPD：
                  <ul>
                    {Object.entries(device.vpd).map(([key, value]) => (
                      <li key={key}>
                        {key}: {String(value)}
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

export default ClusterMemberDetailPCI;
