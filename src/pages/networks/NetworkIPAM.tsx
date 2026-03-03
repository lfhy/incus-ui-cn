import type { FC } from "react";
import { useEffect } from "react";
import {
  EmptyState,
  Icon,
  MainTable,
  Row,
  ScrollableTable,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import { useParams } from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import PageHeader from "components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchNetworkAllocations } from "api/networks";
import type { LxdUsedBy } from "util/usedBy";
import { filterUsedByType } from "util/usedBy";
import UsedByItem from "components/UsedByItem";
import ResourceLink from "components/ResourceLink";
import DocLink from "components/DocLink";

const NetworkIPAM: FC = () => {
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();

  const {
    data: allocations = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.projects, project, queryKeys.networkAllocations],
    queryFn: async () => fetchNetworkAllocations(project ?? "default"),
  });

  useEffect(() => {
    if (error) {
      notify.failure("加载网络地址分配失败", error);
    }
  }, [error]);

  if (!project) {
    return <>缺少项目参数</>;
  }

  const typeLabel = (type: string) => {
    switch (type) {
      case "network":
        return "网络";
      case "instance":
        return "实例";
      case "network-forward":
        return "网络转发";
      default:
        return type;
    }
  };

  const headers = [
    { content: "类型", sortKey: "type", className: "type" },
    { content: "使用方", sortKey: "usedBy", className: "usedBy" },
    { content: "地址", sortKey: "address", className: "address" },
    { content: "网络", sortKey: "network", className: "network" },
    { content: "NAT", sortKey: "nat", className: "nat" },
    { content: "MAC 地址", sortKey: "hwaddress", className: "hwaddr" },
  ];

  const rows = allocations.map((allocation) => {
    const usedByItems = filterUsedByType(allocation.type, [allocation.used_by]);

    const getUsedByUrl = (item: LxdUsedBy) => {
      if (allocation.type === "instance") {
        return `/ui/project/${encodeURIComponent(item.project)}/instance/${encodeURIComponent(item.name)}`;
      }
      if (allocation.type === "network") {
        return `/ui/project/${encodeURIComponent(item.project)}/network/${encodeURIComponent(item.name)}`;
      }
      if (allocation.type === "network-forward") {
        return `/ui/project/${encodeURIComponent(item.project)}/network/${encodeURIComponent(item.name)}/forward`;
      }

      return "";
    };

    return {
      columns: [
        {
          content: typeLabel(allocation.type),
          role: "cell",
          className: "type",
        },
        {
          content: (
            <>
              {usedByItems.length === 1 ? (
                <UsedByItem
                  item={usedByItems[0]}
                  activeProject={project}
                  type={allocation.type}
                  to={getUsedByUrl(usedByItems[0])}
                />
              ) : (
                allocation.used_by
              )}
            </>
          ),
          role: "rowheader",
          className: "usedBy",
        },
        {
          content: allocation.addresses,
          role: "cell",
          className: "address",
        },
        {
          content: (
            <ResourceLink
              type="network"
              value={allocation.network}
              to={`/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(allocation.network)}`}
            />
          ),
          role: "cell",
          className: "network",
        },
        {
          content: allocation.nat ? "是" : "否",
          role: "cell",
          className: "nat",
        },
        {
          content: allocation.hwaddr,
          role: "cell",
          className: "hwaddr",
        },
      ],
      sortData: {
        usedBy: allocation.used_by.toLowerCase(),
        address: allocation.addresses,
        type: typeLabel(allocation.type),
        nat: allocation.nat,
        hwaddress: allocation.hwaddr,
        network: allocation.network?.toLowerCase(),
      },
    };
  });

  if (isLoading) {
    return <Spinner className="u-loader" text="加载中..." isMainComponent />;
  }

  return (
    <CustomLayout
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <HelpLink
                docPath="/howto/network_ipam/"
                title="了解更多 IP 地址管理"
              >
                IP 地址管理
              </HelpLink>
            </PageHeader.Title>
          </PageHeader.Left>
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row>
        {allocations.length > 0 && (
          <ScrollableTable
            dependencies={allocations}
            tableId="network-ipam-table"
            belowIds={["status-bar"]}
          >
            <MainTable
              className="network-ipam-table"
              id="network-ipam-table"
              headers={headers}
              rows={rows}
              responsive
              sortable
              emptyStateMsg="暂无数据"
            />
          </ScrollableTable>
        )}
        {!isLoading && allocations.length === 0 && (
          <EmptyState
            className="empty-state"
            image={<Icon className="empty-state-icon" name="exposed" />}
            title="未找到网络分配"
          >
            <p>当前项目中没有网络地址分配。</p>
            <p>
              <DocLink docPath="/howto/network_ipam/" hasExternalIcon>
                了解更多网络地址分配
              </DocLink>
            </p>
          </EmptyState>
        )}
      </Row>
    </CustomLayout>
  );
};

export default NetworkIPAM;
