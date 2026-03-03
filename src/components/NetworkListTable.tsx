import type { FC } from "react";
import { MainTable, Notification, Spinner } from "@canonical/react-components";
import { getDeviceAcls, isNicDevice } from "util/devices";
import { getNetworkAcls } from "util/networks";
import ResourceLink from "components/ResourceLink";
import { Link, useParams } from "react-router-dom";
import type { LxdDevices } from "types/device";
import { useNetworks } from "context/useNetworks";
import type { LxdInstance } from "types/instance";

interface Props {
  onFailure: (title: string, e: unknown) => void;
  devices: LxdDevices;
  instance?: LxdInstance;
}

const NetworkListTable: FC<Props> = ({ onFailure, devices, instance }) => {
  const { project } = useParams<{ project: string }>();

  const {
    data: networks = [],
    error,
    isLoading,
  } = useNetworks(project as string);

  if (error) {
    onFailure("加载网络失败", error);
  }

  const networkDevices = Object.values(devices ?? {}).filter(isNicDevice);
  const instanceHasNetworks = networkDevices.length > 0;
  const userHasNetworks = networks.length > 0;

  const networksHeaders = [
    { content: "名称", sortKey: "name", className: "u-text--muted" },
    {
      content: "接口",
      sortKey: "interfaceName",
      className: "u-text--muted",
    },
    { content: "类型", sortKey: "type", className: "u-text--muted" },
    {
      content: "MAC 地址",
      sortKey: "macAddress",
      className: "u-text--muted u-hide--small u-hide--medium",
    },
    {
      content: "ACL",
      sortKey: "acls",
      className: "u-text--muted u-hide--small u-hide--medium",
    },
  ];

  const networksRows = Object.entries(devices ?? {})
    .map(([deviceName, networkDevice]) => {
      if (networkDevice.type !== "nic") {
        return null;
      }

      const network = networks.find(
        (item) =>
          item.name === networkDevice.network ||
          item.name === networkDevice.parent,
      );

      if (!network) {
        return null;
      }

      const device = networkDevices.find((t) => t.network === network.name);
      const deviceAcls = getDeviceAcls(device);
      const networkAcls = getNetworkAcls(network);
      const aclsCount = new Set(deviceAcls.concat(networkAcls)).size;

      return {
        key: network.name,
        columns: [
          {
            content: (
              <ResourceLink
                type="network"
                value={network.name}
                to={`/ui/project/${encodeURIComponent(project ?? "")}/network/${encodeURIComponent(network.name)}`}
              />
            ),
            role: "rowheader",
            "aria-label": "名称",
          },
          {
            content: deviceName,
            role: "cell",
            "aria-label": "接口",
          },
          {
            content: (
              <>
                {network.type}
                <span className="u-text--muted">
                  ，{network.managed ? "受管" : "非受管"}
                </span>
              </>
            ),
            role: "cell",
            "aria-label": "类型",
          },
          {
            content: instance?.config?.[`volatile.${deviceName}.hwaddr`] || "-",
            role: "cell",
            "aria-label": "MAC 地址",
          },
          {
            content:
              aclsCount > 0 ? (
                <Link to="configuration/network">{aclsCount}</Link>
              ) : (
                <>-</>
              ),
            role: "cell",
            "aria-label": "ACL 数量",
          },
        ],
        sortData: {
          name: network.name.toLowerCase(),
          type: network.type + network.managed ? "managed" : "unmanaged",
          interfaceName: deviceName.toLowerCase(),
          macAddress:
            instance?.config?.[`volatile.${deviceName}.hwaddr`] || "-",
        },
      };
    })
    .filter((row) => row !== null);

  const getContent = () => {
    if (isLoading) {
      return <Spinner className="u-loader" text="正在加载网络..." />;
    }

    if (instanceHasNetworks && !userHasNetworks) {
      return (
        <Notification severity="caution" title="权限受限">
          你没有查看网络详情的权限。
        </Notification>
      );
    }

    if (!instanceHasNetworks) {
      return <>-</>;
    }

    return (
      <MainTable
        headers={networksHeaders}
        rows={networksRows}
        sortable
        className={"network-table"}
      />
    );
  };

  return getContent();
};

export default NetworkListTable;
