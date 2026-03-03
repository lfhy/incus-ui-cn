import type { FC } from "react";
import type { LxdResources } from "types/resources";

interface Props {
  resources: LxdResources;
}

const ClusterMemberDetailUSB: FC<Props> = ({ resources }) => {
  return (
    <table className="usb">
      <tbody>
        {resources?.usb.devices?.length === 0 && (
          <tr>
            <td className="u-text--muted">未找到 USB 设备</td>
          </tr>
        )}
        {resources?.usb.devices?.map((device, i) => (
          <tr key={i}>
            <th className="u-text--muted">设备 #{i + 1}</th>
            <td>
              <div>总线地址： {device.bus_address}</div>
              <div>设备地址： {device.device_address}</div>
              {device.vendor && <div>厂商： {device.vendor}</div>}
              {device.product && <div>产品： {device.product}</div>}
              {device.serial && device.serial !== "" && (
                <div>序列号： {device.serial}</div>
              )}
              {(device.interfaces ?? []).length > 0 && (
                <div>
                  接口：
                  <ul>
                    {(device.interfaces ?? []).map((iface, j) => (
                      <li key={j}>
                        <div>类别： {iface.class}</div>
                        <div>子类别： {iface.subclass}</div>
                        <div>协议： {iface.protocol}</div>
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

export default ClusterMemberDetailUSB;
