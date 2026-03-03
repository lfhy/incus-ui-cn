import type { FC } from "react";
import {
  EmptyState,
  Icon,
  MainTable,
  Row,
  ScrollableTable,
  useNotify,
  Spinner,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { LxdNetwork } from "types/network";
import { fetchNetworkLeases } from "api/network-leases";
import ResourceLink from "components/ResourceLink";
import { useIsClustered } from "context/useIsClustered";
import DocLink from "components/DocLink";

interface Props {
  network: LxdNetwork;
  project: string;
}

const NetworkLeases: FC<Props> = ({ network, project }) => {
  const notify = useNotify();
  const isClustered = useIsClustered();

  const {
    data: leases = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      network.name,
      queryKeys.leases,
    ],
    queryFn: async () => fetchNetworkLeases(network.name, project),
  });

  if (error) {
    notify.failure("加载网络租约失败", error);
  }

  const hasNetworkLeases = leases.length > 0;

  const headers = [
    { content: "类型", sortKey: "type" },
    { content: "主机名", sortKey: "hostname" },
    { content: "IP 地址", sortKey: "address" },
    { content: "项目", sortKey: "project" },
    ...(isClustered ? [{ content: "集群成员", sortKey: "clusterMember" }] : []),
    { content: "MAC 地址", sortKey: "macAddress" },
  ];

  const rows = leases.map((lease) => {
    return {
      key: lease.address + lease.hostname + lease.type,
      columns: [
        {
          content:
            lease.type === "gateway"
              ? "网关"
              : lease.type === "dynamic"
                ? "动态"
                : lease.type === "static"
                  ? "静态"
                  : lease.type,
          role: "cell",
          "aria-label": "类型",
        },
        {
          content: lease.hostname,
          role: "rowheader",
          "aria-label": "主机名",
        },
        {
          content: lease.address,
          role: "cell",
          "aria-label": "IP 地址",
        },
        {
          content: lease.project && (
            <ResourceLink
              type="project"
              value={lease.project}
              to={`/ui/project/${encodeURIComponent(lease.project)}`}
            />
          ),
          role: "cell",
          "aria-label": "项目",
        },
        ...(isClustered
          ? [
              {
                content: lease.location && (
                  <ResourceLink
                    type="cluster-member"
                    value={lease.location}
                    to={`/ui/cluster/member/${encodeURIComponent(lease.location)}`}
                  />
                ),
                role: "cell",
                "aria-label": "集群成员",
              },
            ]
          : []),
        {
          content: lease.hwaddr,
          role: "cell",
          "aria-label": "MAC 地址",
        },
      ],
      sortData: {
        hostname: lease.hostname.toLowerCase(),
        macAddress: lease.hwaddr,
        address: lease.address,
        type:
          lease.type === "gateway"
            ? "网关"
            : lease.type === "dynamic"
              ? "动态"
              : lease.type === "static"
                ? "静态"
                : lease.type,
        project: lease.project?.toLowerCase(),
        clusterMember: lease.location?.toLowerCase(),
      },
    };
  });

  if (isLoading) {
    return <Spinner className="u-loader" text="加载中..." isMainComponent />;
  }

  return (
    <Row>
      {hasNetworkLeases && (
        <ScrollableTable
          dependencies={leases}
          tableId="network-lease-table"
          belowIds={["status-bar"]}
        >
          <MainTable
            id="network-lease-table"
            headers={headers}
            expanding
            rows={rows}
            responsive
            sortable
            className="u-table-layout--auto"
            emptyStateMsg="暂无数据"
          />
        </ScrollableTable>
      )}
      {!isLoading && !hasNetworkLeases && (
        <EmptyState
          className="empty-state"
          image={<Icon className="empty-state-icon" name="exposed" />}
          title="未找到网络租约"
        >
          <p>此项目中没有网络租约。</p>
          <p>
            <DocLink
              docPath="/howto/network_ipam/#view-dhcp-leases-for-fully-controlled-networks"
              hasExternalIcon
            >
              了解更多网络租约信息
            </DocLink>
          </p>
        </EmptyState>
      )}
    </Row>
  );
};

export default NetworkLeases;
