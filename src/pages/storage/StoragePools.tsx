import type { FC } from "react";
import {
  EmptyState,
  Icon,
  MainTable,
  ScrollableTable,
  Row,
  useNotify,
  CustomLayout,
  Spinner,
} from "@canonical/react-components";
import { Link, useParams } from "react-router-dom";
import DeleteStoragePoolBtn from "pages/storage/actions/DeleteStoragePoolBtn";
import StoragePoolSize from "pages/storage/StoragePoolSize";
import CreateStoragePoolBtn from "pages/storage/actions/CreateStoragePoolBtn";
import HelpLink from "components/HelpLink";
import NotificationRow from "components/NotificationRow";
import PageHeader from "components/PageHeader";
import { useStoragePools } from "context/useStoragePools";
import classNames from "classnames";
import { StoragePoolClusterMember } from "./StoragePoolClusterMember";
import { useIsClustered } from "context/useIsClustered";
import DocLink from "components/DocLink";

const StoragePools: FC = () => {
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const isClustered = useIsClustered();

  if (!project) {
    return <>缺少项目参数</>;
  }

  const { data: pools = [], error, isLoading } = useStoragePools(true, project);

  if (error) {
    notify.failure("加载存储池失败", error);
  }

  const headers = [
    { content: "名称", sortKey: "name" },
    { content: "驱动", sortKey: "driver", className: "driver" },
    ...(isClustered
      ? [{ content: "集群成员", className: "cluster-member" }]
      : []),
    {
      content: "容量",
      className: classNames("size", { clustered: isClustered }),
    },
    {
      content: <>使用量</>,
      sortKey: "usedBy",
      className: "u-align--right volumes-total",
    },
    { content: "状态", sortKey: "status", className: "status" },
    { "aria-label": "操作", className: "u-align--right actions" },
  ];

  const rows = pools.map((pool) => {
    return {
      key: pool.name,
      columns: [
        {
          content: (
            <Link
              to={`/ui/project/${encodeURIComponent(project)}/storage/pool/${encodeURIComponent(pool.name)}`}
            >
              {pool.name}
            </Link>
          ),
          role: "rowheader",
          "aria-label": "名称",
        },
        {
          content: pool.driver,
          role: "cell",
          "aria-label": "驱动",
          className: "driver",
        },
        ...(isClustered
          ? [
              {
                content: <StoragePoolClusterMember pool={pool} />,
                role: "cell",
                "aria-label": "集群成员",
                className: "cluster-member",
              },
            ]
          : []),
        {
          content: <StoragePoolSize pool={pool} hasMeterBar />,
          role: "cell",
          "aria-label": "容量",
          className: classNames("size", { clustered: isClustered }),
        },
        {
          content: pool.used_by?.length ?? 0,
          role: "cell",
          className: "u-align--right volumes-total",
          "aria-label": "所有项目中的卷数量",
        },
        {
          content: pool.status,
          role: "cell",
          "aria-label": "状态",
          className: "status",
        },
        {
          content: (
            <DeleteStoragePoolBtn
              key={pool.name}
              pool={pool}
              project={project}
            />
          ),
          role: "cell",
          className: "u-align--right actions",
          "aria-label": "操作",
        },
      ],
      sortData: {
        name: pool.name.toLowerCase(),
        driver: pool.driver,
        status: pool.status,
        usedBy: pool.used_by?.length ?? 0,
      },
    };
  });

  if (isLoading) {
    return <Spinner className="u-loader" text="加载中..." isMainComponent />;
  }

  const content =
    pools.length > 0 ? (
      <Row>
        <ScrollableTable
          dependencies={[pools]}
          tableId="storage-pool-table"
          belowIds={["status-bar"]}
        >
          <MainTable
            id="storage-pool-table"
            headers={headers}
            rows={rows}
            sortable
            className="storage-pool-table"
          />
        </ScrollableTable>
      </Row>
    ) : (
      <EmptyState
        className="empty-state"
        image={<Icon name="switcher-dashboard" className="empty-state-icon" />}
        title="此项目中未找到存储池"
      >
        <p>存储池会显示在这里。</p>
        <p>
          <DocLink docPath="/explanation/storage/" hasExternalIcon>
            了解更多存储池、卷与存储桶
          </DocLink>
        </p>
        <CreateStoragePoolBtn
          project={project}
          className="empty-state-button"
        />
      </EmptyState>
    );

  return (
    <CustomLayout
      contentClassName="detail-page"
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <HelpLink
                docPath="/explanation/storage/"
                title="了解更多存储池、卷与存储桶"
              >
                存储池
              </HelpLink>
            </PageHeader.Title>
          </PageHeader.Left>
          <PageHeader.BaseActions>
            <CreateStoragePoolBtn
              project={project}
              className="u-float-right u-no-margin--bottom"
            />
          </PageHeader.BaseActions>
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row>{content}</Row>
    </CustomLayout>
  );
};

export default StoragePools;
