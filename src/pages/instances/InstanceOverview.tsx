import type { FC } from "react";
import { useEffect } from "react";
import { isoTimeToString } from "util/helpers";
import { Col, Row, useListener, useNotify } from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import { instanceCreationTypes } from "util/instanceOptions";
import { updateMaxHeight } from "util/updateMaxHeight";
import InstanceOverviewProfiles from "./InstanceOverviewProfiles";
import InstanceOverviewUserProperties from "./InstanceOverviewUserProperties";
import InstanceOverviewMetrics from "./InstanceOverviewMetrics";
import InstancePreview from "./InstancePreview";
import InstanceIps from "pages/instances/InstanceIps";
import { useIsClustered } from "context/useIsClustered";
import InstanceMAC from "pages/instances/InstanceMAC";
import NotificationRow from "components/NotificationRow";
import DeviceListTable from "components/DeviceListTable";
import NetworkListTable from "components/NetworkListTable";
import type { LxdDevices } from "types/device";
import ResourceLink from "components/ResourceLink";
import { getIpAddresses } from "util/networks";
import { getImageLink } from "util/instances";

interface Props {
  instance: LxdInstance;
}

const InstanceOverview: FC<Props> = ({ instance }) => {
  const notify = useNotify();
  const isClustered = useIsClustered();

  const onFailure = (title: string, e: unknown) => {
    notify.failure(title, e);
  };

  const updateContentHeight = () => {
    updateMaxHeight("instance-overview-tab");
  };
  useEffect(updateContentHeight, [notify.notification?.message]);
  useListener(window, updateContentHeight, "resize", true);

  const pid =
    !instance.state || instance.state.pid === 0 ? "-" : instance.state.pid;
  const isVm = instance.type === "virtual-machine";

  return (
    <div className="instance-overview-tab">
      <NotificationRow />
      <Row className="general">
        <Col size={3}>
          <h2 className="p-heading--5">概览</h2>
        </Col>
        <Col size={7}>
          <table>
            <tbody>
              <tr>
                <th className="u-text--muted">基础镜像</th>
                <td>{getImageLink(instance)}</td>
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
                <td>
                  <InstanceMAC instance={instance} />
                </td>
              </tr>
              <tr>
                <th className="u-text--muted">架构</th>
                <td>{instance.architecture}</td>
              </tr>
              {isClustered && (
                <tr>
                  <th className="u-text--muted">位置</th>
                  <td>
                    {instance.location ? (
                      <ResourceLink
                        type="cluster-member"
                        value={instance.location}
                        to={`/ui/cluster/member/${encodeURIComponent(instance.location)}`}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              )}
              <tr>
                <th className="u-text--muted">PID</th>
                <td>{pid}</td>
              </tr>
              <tr>
                <th className="u-text--muted">创建时间</th>
                <td>{isoTimeToString(instance.created_at)}</td>
              </tr>
              <tr>
                <th className="u-text--muted">最近使用</th>
                <td>{isoTimeToString(instance.last_used_at)}</td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
      {isVm && (
        <Row className="instance-preview">
          <Col size={3}>
            <h2 className="p-heading--5">预览</h2>
          </Col>
          <Col size={4}>
            <InstancePreview instance={instance} onFailure={onFailure} />
          </Col>
          <Col size={3}></Col>
        </Row>
      )}
      <Row className="usage">
        <Col size={3}>
          <h2 className="p-heading--5">使用情况</h2>
        </Col>
        <Col size={7}>
          <InstanceOverviewMetrics instance={instance} onFailure={onFailure} />
        </Col>
      </Row>
      <Row className="networks">
        <Col size={3}>
          <h2 className="p-heading--5">网络</h2>
        </Col>
        <Col size={7}>
          <NetworkListTable
            devices={instance.expanded_devices as LxdDevices}
            instance={instance}
            onFailure={onFailure}
          />
        </Col>
      </Row>
      <Row className="networks">
        <Col size={3}>
          <h2 className="p-heading--5">设备</h2>
        </Col>
        <Col size={7}>
          <DeviceListTable
            configBaseURL={`/ui/project/${encodeURIComponent(instance.project)}/instance/${encodeURIComponent(instance.name)}/configuration`}
            devices={instance.expanded_devices as LxdDevices}
          />
        </Col>
      </Row>
      <Row className="profiles">
        <Col size={3}>
          <h2 className="p-heading--5">配置文件</h2>
        </Col>
        <Col size={7}>
          <InstanceOverviewProfiles instance={instance} onFailure={onFailure} />
        </Col>
      </Row>
      <Row className="user-properties">
        <Col size={3}>
          <h2 className="p-heading--5">用户属性</h2>
        </Col>
        <Col size={7}>
          <InstanceOverviewUserProperties instance={instance} />
        </Col>
      </Row>
    </div>
  );
};

export default InstanceOverview;
