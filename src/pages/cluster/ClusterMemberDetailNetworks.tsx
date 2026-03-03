import type { FC } from "react";
import type { LxdResources } from "types/resources";

interface Props {
  resources: LxdResources;
}

const ClusterMemberDetailNetworks: FC<Props> = ({ resources }) => {
  return (
    <table>
      <tbody>
        {resources?.network.cards?.map((card, i) => (
          <tr key={i}>
            <th className="u-text--muted">网卡 #{i + 1}</th>
            <td>
              <div>厂商： {card.vendor}</div>
              <div>产品： {card.product}</div>
              <div>
                驱动： {card.driver} ({card.driver_version})
              </div>
              {card.firmware_version && (
                <div>固件： {card.firmware_version}</div>
              )}
              {card.pci_address && <div>PCI 地址： {card.pci_address}</div>}
              {card.usb_address && <div>USB 地址： {card.usb_address}</div>}
              <div>NUMA 节点： {card.numa_node}</div>

              {(card.ports ?? []).length > 0 && (
                <div>
                  端口：
                  <ul>
                    {(card.ports ?? []).map((port, j) => (
                      <li key={j}>
                        <div>
                          ID： <strong>{port.id}</strong>
                        </div>
                        <div>MAC： {port.address}</div>
                        <div>协议： {port.protocol}</div>
                        <div>
                          链路： {port.link_detected ? "已连接" : "未连接"}
                        </div>
                        <div>
                          自动协商： {port.auto_negotiation ? "是" : "否"}
                        </div>
                        <div>端口类型： {port.port_type}</div>
                        <div>收发器： {port.transceiver_type}</div>
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

export default ClusterMemberDetailNetworks;
