import type { FC } from "react";
import type { LxdResources } from "types/resources";

interface Props {
  resources: LxdResources;
}

const ClusterMemberDetailGPU: FC<Props> = ({ resources }) => {
  return (
    <table>
      <tbody>
        {resources?.gpu.cards?.map((card, index) => (
          <tr key={index}>
            <th className="u-text--muted">显卡 #{index + 1}</th>
            <td>
              <div>产品： {card.product}</div>
              <div>厂商： {card.vendor}</div>
              <div>PCI 地址： {card.pci_address}</div>
              <div>
                驱动： {card.driver} ({card.driver_version})
              </div>
              <div>NUMA 节点： {card.numa_node}</div>

              {/* DRM info */}
              {card.drm && (
                <div>
                  DRM：
                  <div>
                    卡： {card.drm.card_name} ({card.drm.card_device})
                  </div>
                  <div>
                    控制： {card.drm.control_name} ({card.drm.control_device})
                  </div>
                  {card.drm.render_name && (
                    <div>
                      渲染： {card.drm.render_name} ({card.drm.render_device})
                    </div>
                  )}
                </div>
              )}

              {/* SR-IOV info */}
              {card.sriov && (
                <div>
                  SR-IOV：
                  <div>
                    {card.sriov.current_vfs} / {card.sriov.maximum_vfs} 虚拟功能
                  </div>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ClusterMemberDetailGPU;
