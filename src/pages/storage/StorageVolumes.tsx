import type { FC } from "react";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  EmptyState,
  Icon,
  Row,
  ScrollableTable,
  TablePagination,
  useListener,
  useNotify,
  CustomLayout,
  Spinner,
  Notification,
} from "@canonical/react-components";
import CreateVolumeBtn from "pages/storage/actions/CreateVolumeBtn";
import type { StorageVolumesFilterType } from "pages/storage/StorageVolumesFilter";
import { CLUSTER_MEMBER } from "pages/storage/StorageVolumesFilter";
import StorageVolumesFilter, {
  CONTENT_TYPE,
  POOL,
  QUERY,
  VOLUME_TYPE,
} from "pages/storage/StorageVolumesFilter";
import StorageVolumeSize from "pages/storage/StorageVolumeSize";
import {
  figureCollapsedScreen,
  getVolumeId,
  hasVolumeDetailPage,
  isSnapshot,
  renderContentType,
  renderVolumeType,
} from "util/storageVolume";
import {
  ACTIONS_COL,
  COLUMN_WIDTHS,
  CLUSTER_MEMBER_COL,
  CONTENT_TYPE_COL,
  NAME_COL,
  POOL_COL,
  SIZE_COL,
  SNAPSHOTS_COL,
  TYPE_COL,
  USED_BY_COL,
} from "util/storageVolumeTable";
import StorageVolumeNameLink from "./StorageVolumeNameLink";
import CustomStorageVolumeActions from "./actions/CustomStorageVolumeActions";
import useSortTableData from "util/useSortTableData";
import PageHeader from "components/PageHeader";
import HelpLink from "components/HelpLink";
import NotificationRow from "components/NotificationRow";
import { useLoadVolumes } from "context/useVolumes";
import { useIsClustered } from "context/useIsClustered";
import ResourceLink from "components/ResourceLink";
import SelectableMainTable from "components/SelectableMainTable";
import SelectedTableNotification from "components/SelectedTableNotification";
import StorageVolumeBulkDelete from "./actions/StorageVolumeBulkDelete";
import { useCurrentProject } from "context/useCurrentProject";
import { isProjectWithVolumes } from "util/projects";
import DocLink from "components/DocLink";
import type { LxdStorageVolume } from "types/storage";

const StorageVolumes: FC = () => {
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const [searchParams] = useSearchParams();
  const [isSmallScreen, setSmallScreen] = useState(figureCollapsedScreen());
  const isClustered = useIsClustered();
  const resize = () => {
    setSmallScreen(figureCollapsedScreen());
  };
  useListener(window, resize, "resize", true);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [processingVolumes, setProcessingVolumes] = useState<string[]>([]);

  const filters: StorageVolumesFilterType = {
    queries: searchParams.getAll(QUERY).map((query) => query.toLowerCase()),
    pools: searchParams.getAll(POOL),
    volumeTypes: searchParams.getAll(VOLUME_TYPE).map((type) => {
      const lowered = type.toLowerCase();
      if (type === "VM" || type === "虚拟机") {
        return "virtual-machine";
      }
      if (type === "Container" || type === "容器") {
        return "container";
      }
      if (type === "Image" || type === "镜像") {
        return "image";
      }
      if (type === "Custom" || type === "自定义") {
        return "custom";
      }
      return lowered;
    }),
    contentTypes: searchParams.getAll(CONTENT_TYPE).map((type) => {
      if (type === "文件系统") {
        return "filesystem";
      }
      if (type === "块存储") {
        return "block";
      }
      return type.toLowerCase();
    }),
    clusterMembers: searchParams
      .getAll(CLUSTER_MEMBER)
      .map((member) =>
        (member === "集群范围" ? "Cluster-wide" : member).toLowerCase(),
      ),
  };

  if (!project) {
    return <>缺少项目参数</>;
  }

  const { project: currentProject, isLoading: isProjectLoading } =
    useCurrentProject();
  const { data: volumes = [], error, isLoading } = useLoadVolumes(project);

  const featuresVolumes = isProjectWithVolumes(currentProject);

  if (error) {
    notify.failure("加载存储卷失败", error);
  }

  useEffect(() => {
    const validIds = new Set(volumes.map(getVolumeId));
    const validSelections = selectedNames.filter((name) => validIds.has(name));
    if (validSelections.length !== selectedNames.length) {
      setSelectedNames(validSelections);
    }
  }, [volumes]);

  useEffect(() => {
    const pagination = document.getElementById("pagination");
    if (!pagination) {
      return;
    }

    const updatePaginationText = () => {
      const walker = document.createTreeWalker(
        pagination,
        NodeFilter.SHOW_TEXT,
      );
      const updates: Array<{ node: Text; value: string }> = [];

      while (walker.nextNode()) {
        const textNode = walker.currentNode as Text;
        const value = textNode.nodeValue?.trim() ?? "";
        if (!value) {
          continue;
        }

        if (value === "Page number") {
          updates.push({ node: textNode, value: "页码" });
        } else if (value === "Items per page") {
          updates.push({ node: textNode, value: "每页条目数" });
        } else if (value === "/page") {
          updates.push({ node: textNode, value: "/页" });
        } else if (value === "of") {
          updates.push({ node: textNode, value: "共" });
        }
      }

      updates.forEach(({ node, value }) => {
        node.nodeValue = value;
      });
    };

    updatePaginationText();
    const observer = new MutationObserver(() => {
      updatePaginationText();
    });
    observer.observe(pagination, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [volumes.length, selectedNames.length, isSmallScreen]);

  const headers = [
    {
      content: NAME_COL,
      sortKey: "name",
      style: { width: COLUMN_WIDTHS[NAME_COL] },
    },
    {
      content: POOL_COL,
      sortKey: "pool",
      style: { width: COLUMN_WIDTHS[POOL_COL] },
      className: "pool",
    },
    ...(isClustered
      ? [
          {
            content: CLUSTER_MEMBER_COL,
            sortKey: "clusterMember",
            style: { width: COLUMN_WIDTHS[CLUSTER_MEMBER_COL] },
          },
        ]
      : []),
    {
      content: isSmallScreen ? (
        <>
          {TYPE_COL}
          <br />
          <div className="header-second-row">{CONTENT_TYPE_COL}</div>
        </>
      ) : (
        TYPE_COL
      ),
      sortKey: isSmallScreen ? "contentType" : "type",
      style: {
        width: COLUMN_WIDTHS[isSmallScreen ? CONTENT_TYPE_COL : TYPE_COL],
      },
    },
    ...(isSmallScreen
      ? []
      : [
          {
            content: CONTENT_TYPE_COL,
            sortKey: "contentType",
            style: { width: COLUMN_WIDTHS[CONTENT_TYPE_COL] },
          },
        ]),
    {
      content: SIZE_COL,
      className: "u-align--right size",
      style: { width: COLUMN_WIDTHS[SIZE_COL] },
    },
    {
      content: isSmallScreen ? (
        <>
          {USED_BY_COL}
          <br />
          <div className="header-second-row">{SNAPSHOTS_COL}</div>
        </>
      ) : (
        USED_BY_COL
      ),
      sortKey: isSmallScreen ? "snapshots" : "usedBy",
      className: "u-align--right used_by",
      style: {
        width: COLUMN_WIDTHS[isSmallScreen ? SNAPSHOTS_COL : USED_BY_COL],
      },
    },
    ...(isSmallScreen
      ? []
      : [
          {
            className: "u-align--right",
            content: SNAPSHOTS_COL,
            sortKey: "snapshots",
            style: { width: COLUMN_WIDTHS[SNAPSHOTS_COL] },
          },
        ]),
    {
      content: "",
      className: "actions u-align--right",
      "aria-label": "Actions",
      style: { width: COLUMN_WIDTHS[ACTIONS_COL] },
    },
  ];

  const filteredVolumes = volumes.filter((item) => {
    if (isSnapshot(item)) {
      return false;
    }

    if (!filters.queries.every((q) => item.name.toLowerCase().includes(q))) {
      return false;
    }
    if (filters.pools.length > 0 && !filters.pools.includes(item.pool)) {
      return false;
    }
    if (
      filters.volumeTypes.length > 0 &&
      !filters.volumeTypes.includes(item.type)
    ) {
      return false;
    }
    if (
      filters.contentTypes.length > 0 &&
      !filters.contentTypes.includes(item.content_type)
    ) {
      return false;
    }
    if (
      filters.clusterMembers.length > 0 &&
      !filters.clusterMembers.includes(
        item.location.length === 0 ? "cluster-wide" : item.location,
      )
    ) {
      return false;
    }
    return true;
  });

  const rows = filteredVolumes.map((volume) => {
    const id = getVolumeId(volume);
    const volumeType = renderVolumeType(volume);
    const contentType = renderContentType(volume);
    const snapshots = (volume as LxdStorageVolume & { snapshots?: unknown })
      .snapshots;
    const snapshotCount = Array.isArray(snapshots) ? snapshots.length : 0;
    const canSelect = hasVolumeDetailPage(volume);

    return {
      key: id,
      name: canSelect ? id : undefined,
      className: "u-row",
      columns: [
        {
          content: <StorageVolumeNameLink volume={volume} />,
          role: "rowheader",
          style: { width: COLUMN_WIDTHS[NAME_COL] },
          "aria-label": NAME_COL,
        },
        {
          content: (
            <ResourceLink
              type="pool"
              value={volume.pool}
              to={`/ui/project/${encodeURIComponent(project)}/storage/pool/${encodeURIComponent(volume.pool)}`}
            />
          ),
          role: "cell",
          className: "pool",
          style: { width: COLUMN_WIDTHS[POOL_COL] },
          "aria-label": POOL_COL,
        },
        ...(isClustered
          ? [
              {
                content: volume.location ? (
                  <ResourceLink
                    type="cluster-member"
                    value={volume.location}
                    to={`/ui/cluster/member/${encodeURIComponent(volume.location)}`}
                  />
                ) : (
                  <ResourceLink
                    type="cluster-group"
                    value="集群范围"
                    to="/ui/cluster/members"
                  />
                ),
                role: "cell",
                style: { width: COLUMN_WIDTHS[CLUSTER_MEMBER_COL] },
                "aria-label": CLUSTER_MEMBER_COL,
              },
            ]
          : []),
        {
          content: (
            <>
              {volumeType}
              {isSmallScreen && (
                <div className="u-text--muted">{contentType}</div>
              )}
            </>
          ),
          role: "cell",
          "aria-label": TYPE_COL,
          style: {
            width: COLUMN_WIDTHS[isSmallScreen ? CONTENT_TYPE_COL : TYPE_COL],
          },
        },
        ...(isSmallScreen
          ? []
          : [
              {
                content: contentType,
                role: "cell",
                "aria-label": CONTENT_TYPE_COL,
                style: { width: COLUMN_WIDTHS[CONTENT_TYPE_COL] },
              },
            ]),
        {
          content: <StorageVolumeSize volume={volume} />,
          role: "cell",
          "aria-label": SIZE_COL,
          className: "u-align--right size",
          style: { width: COLUMN_WIDTHS[SIZE_COL] },
        },
        {
          className: "u-align--right used_by",
          content: (
            <>
              {volume.used_by?.length ?? 0}
              {isSmallScreen && (
                <div className="u-text--muted">{snapshotCount}</div>
              )}
            </>
          ),
          role: "cell",
          "aria-label": USED_BY_COL,
          style: {
            width: COLUMN_WIDTHS[isSmallScreen ? SNAPSHOTS_COL : USED_BY_COL],
          },
        },
        ...(isSmallScreen
          ? []
          : [
              {
                className: "u-align--right",
                content: snapshotCount,
                role: "cell",
                "aria-label": SNAPSHOTS_COL,
                style: { width: COLUMN_WIDTHS[SNAPSHOTS_COL] },
              },
            ]),
        {
          className: "actions u-align--right",
          content: hasVolumeDetailPage(volume) ? (
            <CustomStorageVolumeActions
              volume={volume}
              className="storage-volume-actions u-no-margin--bottom"
            />
          ) : (
            <StorageVolumeNameLink
              volume={volume}
              overrideName={`go to ${
                volume.type === "image"
                  ? "镜像列表"
                  : volume.content_type === "iso"
                    ? "自定义 ISO"
                    : "实例"
              }`}
              className="storage-volume-actions u-align--right"
            />
          ),
          role: "cell",
          "aria-label": ACTIONS_COL,
          style: { width: COLUMN_WIDTHS[ACTIONS_COL] },
        },
      ],
      sortData: {
        name: volume.name,
        pool: volume.pool,
        clusterMember: volume.location,
        contentType: contentType,
        type: volumeType,
        usedBy: volume.used_by?.length ?? 0,
        snapshots: snapshotCount,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({
    rows,
  });

  if (isLoading || isProjectLoading) {
    return <Spinner className="u-loader" text="加载中..." isMainComponent />;
  }

  const defaultPoolForVolumeCreate =
    filters.pools.length === 1 ? filters.pools[0] : "";

  const hasVolumes = volumes.length !== 0;

  const defaultProjectInfo = !featuresVolumes && (
    <Notification severity="information">
      正在显示来自{" "}
      <ResourceLink
        to="/ui/project/default/storage/volumes"
        type="project"
        value="default"
      />{" "}
      项目的卷。
      <br />
      <span className="u-text--muted">
        如需项目专属卷，请在项目配置中启用存储卷隔离。
      </span>
    </Notification>
  );

  const content = !hasVolumes ? (
    <>
      {defaultProjectInfo}
      <EmptyState
        className="empty-state"
        image={<Icon name="switcher-dashboard" className="empty-state-icon" />}
        title="此项目中未找到卷"
      >
        <p>存储卷会显示在这里。</p>
        <p>
          <DocLink
            docPath="/explanation/storage/#storage-volumes"
            hasExternalIcon
          >
            了解更多存储卷
          </DocLink>
        </p>
        {featuresVolumes && (
          <CreateVolumeBtn
            projectName={project}
            className="empty-state-button"
          />
        )}
      </EmptyState>
    </>
  ) : (
    <div className="storage-volumes">
      {defaultProjectInfo}
      <ScrollableTable
        dependencies={[volumes]}
        tableId="volume-table"
        belowIds={["status-bar"]}
      >
        <TablePagination
          data={sortedRows}
          id="pagination"
          itemName="卷"
          className="u-no-margin--top"
          aria-label="表格分页控件"
          description={
            selectedNames.length > 0 ? (
              <SelectedTableNotification
                totalCount={
                  volumes.filter(
                    (volume) =>
                      !isSnapshot(volume) && hasVolumeDetailPage(volume),
                  ).length
                }
                itemName="卷"
                parentName="项目"
                selectedNames={selectedNames}
                setSelectedNames={setSelectedNames}
                filteredNames={filteredVolumes
                  .filter(hasVolumeDetailPage)
                  .map(getVolumeId)}
              />
            ) : (
              <>
                显示 <b>{sortedRows.length}</b> /{" "}
                <b>{filteredVolumes.length}</b> 个卷
              </>
            )
          }
        >
          <SelectableMainTable
            className="storage-volume-table"
            id="volume-table"
            headers={headers}
            rows={sortedRows}
            sortable
            emptyStateMsg="未找到匹配搜索的卷"
            itemName="卷"
            parentName="项目"
            selectedNames={selectedNames}
            setSelectedNames={setSelectedNames}
            disabledNames={processingVolumes}
            filteredNames={filteredVolumes.map(getVolumeId)}
            onUpdateSort={updateSort}
            defaultSortDirection="descending"
          />
        </TablePagination>
      </ScrollableTable>
    </div>
  );

  const selectedVolumes = volumes.filter((volume) => {
    const id = getVolumeId(volume);
    return selectedNames.includes(id);
  });

  return (
    <CustomLayout
      mainClassName="storage-volume-list"
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <HelpLink
                docPath="/explanation/storage/#storage-volumes"
                title="了解更多存储卷"
              >
                卷
              </HelpLink>
            </PageHeader.Title>
            {!selectedNames.length && hasVolumes && (
              <PageHeader.Search>
                <StorageVolumesFilter key={project} volumes={volumes} />
              </PageHeader.Search>
            )}
            {!!selectedNames.length && (
              <StorageVolumeBulkDelete
                volumes={selectedVolumes}
                onStart={() => {
                  setProcessingVolumes(selectedNames);
                }}
                onFinish={() => {
                  setProcessingVolumes([]);
                }}
              />
            )}
          </PageHeader.Left>
          {hasVolumes && featuresVolumes && (
            <PageHeader.BaseActions>
              <CreateVolumeBtn
                projectName={project}
                defaultPool={defaultPoolForVolumeCreate}
                className="u-float-right u-no-margin--bottom"
              />
            </PageHeader.BaseActions>
          )}
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row>{content}</Row>
    </CustomLayout>
  );
};

export default StorageVolumes;
