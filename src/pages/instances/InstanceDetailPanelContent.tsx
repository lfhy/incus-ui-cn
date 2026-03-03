import type { FC } from "react";
import InstanceLink from "./InstanceLink";
import type { LxdInstance } from "types/instance";
import InstanceStatusIcon from "./InstanceStatusIcon";
import { instanceCreationTypes } from "util/instanceOptions";
import InstanceIps from "./InstanceIps";
import { getRootPool, isoTimeToString } from "util/helpers";
import { Link } from "react-router-dom";
import { List } from "@canonical/react-components";
import { isNicDevice } from "util/devices";
import { getIpAddresses } from "util/networks";
import { useInstanceLoading } from "context/instanceLoading";
import { useIsClustered } from "context/useIsClustered";
import InstanceMACAddresses from "pages/instances/InstaceMACAddresses";
import ResourceLink from "components/ResourceLink";
import InstanceClusterMemberChip from "./InstanceClusterMemberChip";
import { getImageLink } from "util/instances";

const RECENT_SNAPSHOT_LIMIT = 5;

interface Props {
  instance: LxdInstance;
}

const InstanceDetailPanelContent: FC<Props> = ({ instance }) => {
  const networkDevices = Object.values(instance?.expanded_devices ?? {}).filter(
    isNicDevice,
  );

  const instanceLoading = useInstanceLoading();
  const loadingType = instanceLoading.getType(instance);

  const isClustered = useIsClustered();

  const pid =
    !instance.state || instance.state.pid === 0 ? "-" : instance.state.pid;
  const rootPool = getRootPool(instance);

  return (
    <table className="u-table-layout--auto u-no-margin--bottom">
      <tbody>
        <tr>
          <th className="u-text--muted">名称</th>
          <td>
            <InstanceLink instance={instance} />
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">基础镜像</th>
          <td>
            <div
              className="u-truncate base-image"
              title={instance.config["image.description"]}
            >
              {getImageLink(instance)}
            </div>
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">状态</th>
          <td key={instance.status + loadingType}>
            <InstanceStatusIcon instance={instance} />
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">描述</th>
          <td>{instance.description ? instance.description : "-"}</td>
        </tr>
        <tr>
          <th className="u-text--muted">类型</th>
          <td>
            {instance.type === "container"
              ? "容器"
              : instance.type === "virtual-machine"
                ? "虚拟机"
                : instanceCreationTypes.filter(
                    (item) => item.value === instance.type,
                  )[0].label}
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">IPv4</th>
          <td key={getIpAddresses(instance, "inet").length}>
            <InstanceIps instance={instance} family="inet" />
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">IPv6</th>
          <td key={getIpAddresses(instance, "inet6").length}>
            <InstanceIps instance={instance} family="inet6" />
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">MAC 地址</th>
          <td key={getIpAddresses(instance, "inet6").length}>
            <InstanceMACAddresses instance={instance} />
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">架构</th>
          <td>{instance.architecture}</td>
        </tr>
        {isClustered && (
          <tr>
            <th className="u-text--muted">集群成员</th>
            <td>
              <InstanceClusterMemberChip instance={instance} />
            </td>
          </tr>
        )}
        <tr>
          <th className="u-text--muted">根存储池</th>
          <td>
            <ResourceLink
              type="pool"
              value={rootPool}
              to={`/ui/project/${encodeURIComponent(instance.project)}/storage/pool/${encodeURIComponent(rootPool)}`}
            />
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">PID</th>
          <td>{pid}</td>
        </tr>
        <tr>
          <th className="u-text--muted">创建时间</th>
          <td>{isoTimeToString(instance.created_at)}</td>
        </tr>
        <tr>
          <th className="u-text--muted last-used">最近使用</th>
          <td>{isoTimeToString(instance.last_used_at)}</td>
        </tr>
        <tr>
          <th>
            <h3 className="p-muted-heading p-heading--5">
              <Link
                to={`/ui/project/${encodeURIComponent(instance.project)}/instance/${encodeURIComponent(instance.name)}/configuration`}
              >
                配置文件
              </Link>
            </h3>
          </th>
          <td>
            <List
              className="list"
              items={instance.profiles.map((name) => (
                <ResourceLink
                  key={name}
                  type="profile"
                  value={name}
                  to={`/ui/project/${encodeURIComponent(instance.project)}/profile/${encodeURIComponent(name)}`}
                />
              ))}
            />
          </td>
        </tr>
        {networkDevices.length > 0 ? (
          <tr>
            <th>
              <h3 className="p-muted-heading p-heading--5">网络</h3>
            </th>
            <td>
              <List
                className="list"
                items={networkDevices.map((item) => (
                  <ResourceLink
                    key={item.network}
                    type="network"
                    value={item.network}
                    to={`/ui/project/${encodeURIComponent(instance.project)}/network/${encodeURIComponent(item.network)}`}
                  />
                ))}
              />
            </td>
          </tr>
        ) : (
          <tr>
            <td colSpan={2}>
              <h3 className="p-muted-heading p-heading--5">网络</h3>
              <p>
                未找到网络。
                <br />
                <Link
                  to={`/ui/project/${encodeURIComponent(instance.project)}/instance/${encodeURIComponent(instance.name)}/configuration/networks`}
                >
                  配置实例网络
                </Link>
              </p>
            </td>
          </tr>
        )}
        <tr className="u-no-border">
          <th colSpan={2} className="snapshots-header">
            <h3 className="p-muted-heading p-heading--5">
              <Link
                to={`/ui/project/${encodeURIComponent(instance.project)}/instance/${encodeURIComponent(instance.name)}/snapshots`}
              >
                快照
              </Link>
            </h3>
          </th>
        </tr>
        {instance.snapshots?.length ? (
          <>
            {instance.snapshots
              .slice()
              .sort((snap1, snap2) => {
                const a = snap1.created_at;
                const b = snap2.created_at;
                return a > b ? -1 : a < b ? 1 : 0;
              })
              .slice(0, RECENT_SNAPSHOT_LIMIT)
              .map((snapshot) => (
                <tr key={snapshot.name} className="u-no-border">
                  <th>
                    <ResourceLink
                      key={snapshot.name}
                      type="snapshot"
                      value={snapshot.name}
                      to={`/ui/project/${encodeURIComponent(instance.project)}/instance/${encodeURIComponent(instance.name)}/snapshots`}
                    />
                  </th>
                  <td className="u-text--muted">
                    <i>{isoTimeToString(snapshot.created_at)}</i>
                  </td>
                </tr>
              ))}
            {instance.snapshots.length > RECENT_SNAPSHOT_LIMIT && (
              <tr>
                <td colSpan={2}>
                  <Link
                    to={`/ui/project/${encodeURIComponent(instance.project)}/instance/${encodeURIComponent(instance.name)}/snapshots`}
                  >
                    {`查看全部（${instance.snapshots.length}）`}
                  </Link>
                </td>
              </tr>
            )}
          </>
        ) : (
          <tr>
            <td colSpan={2}>
              <p className="no-snapshots">
                未找到快照。
                <br />
                <Link
                  to={`/ui/project/${encodeURIComponent(instance.project)}/instance/${encodeURIComponent(instance.name)}/snapshots`}
                >
                  管理实例快照
                </Link>
              </p>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default InstanceDetailPanelContent;
