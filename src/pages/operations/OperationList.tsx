import type { FC } from "react";
import { useState } from "react";
import {
  EmptyState,
  Icon,
  MainTable,
  Row,
  ScrollableTable,
  SearchBox,
  TablePagination,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import CancelOperationBtn from "pages/operations/actions/CancelOperationBtn";
import { isoTimeToString, nonBreakingSpaces } from "util/helpers";
import type { LxdOperationStatus } from "types/operation";
import OperationInstanceName from "pages/operations/OperationInstanceName";
import NotificationRow from "components/NotificationRow";
import { getInstanceName, getProjectName } from "util/operations";
import { useOperations } from "context/operationsProvider";
import RefreshOperationsBtn from "pages/operations/actions/RefreshOperationsBtn";
import useSortTableData from "util/useSortTableData";
import PageHeader from "components/PageHeader";

const getOperationStatusLabel = (status: LxdOperationStatus): string => {
  return (
    {
      Cancelled: "已取消",
      Failure: "失败",
      Running: "进行中",
      Success: "成功",
    }[status] ?? status
  );
};

const getOperationDescriptionLabel = (description: string): string => {
  return (
    {
      "Executing operation": "执行操作",
      "Executing command": "执行命令",
      "Creating instance": "创建实例",
      "Updating instance": "更新实例",
      "Deleting instance": "删除实例",
      "Starting instance": "启动实例",
      "Stopping instance": "停止实例",
      "Restarting instance": "重启实例",
      "Freezing instance": "冻结实例",
      "Unfreezing instance": "解冻实例",
      "Snapshotting instance": "创建实例快照",
      "Restoring snapshot": "恢复快照",
      "Deleting snapshot": "删除快照",
      "Updating snapshot": "更新快照",
      "Showing console": "显示控制台",
      "Updating profile": "更新配置文件",
      "Deleting profile": "删除配置文件",
      "Updating network": "更新网络",
      "Deleting network": "删除网络",
      "Creating image": "创建镜像",
      "Deleting image": "删除镜像",
    }[description] ?? description
  );
};

const OperationList: FC = () => {
  const notify = useNotify();
  const { operations, isLoading, error } = useOperations();
  const [query, setQuery] = useState<string>("");

  if (error) {
    notify.failure("加载操作失败", error);
  }

  const headers = [
    { content: "时间", className: "time", sortKey: "created_at" },
    { content: "动作", className: "action", sortKey: "action" },
    { content: "信息", className: "info" },
    { content: "状态", className: "status status-header", sortKey: "status" },
    { "aria-label": "操作", className: "cancel u-align--right" },
  ];

  const getIconNameForStatus = (status: LxdOperationStatus) => {
    return {
      Cancelled: "status-failed-small",
      Failure: "status-failed-small",
      Running: "status-in-progress-small",
      Success: "status-succeeded-small",
    }[status];
  };

  const filteredOperations = operations.filter((operation) => {
    const lowerCaseQuery = query.toLowerCase();

    return (
      operation.description.toLowerCase().includes(lowerCaseQuery) ||
      getProjectName(operation).toLowerCase().includes(lowerCaseQuery) ||
      operation.status.toLowerCase().includes(lowerCaseQuery) ||
      getInstanceName(operation).toLowerCase().includes(lowerCaseQuery)
    );
  });

  const rows = filteredOperations.map((operation) => {
    const projectName = getProjectName(operation);
    return {
      key: operation.id,
      columns: [
        {
          content: (
            <>
              <div className="date-pair">
                发起时间：{" "}
                {nonBreakingSpaces(isoTimeToString(operation.created_at))}
              </div>
              <div className="date-pair u-text--muted">
                最近更新：{" "}
                {nonBreakingSpaces(isoTimeToString(operation.updated_at))}
              </div>
            </>
          ),
          role: "cell",
          "aria-label": "Time",
          className: "time",
        },
        {
          content: (
            <>
              <div>{getOperationDescriptionLabel(operation.description)}</div>
              <OperationInstanceName operation={operation} />
              <div className="u-text--muted u-truncate" title={projectName}>
                项目：{projectName}
              </div>
            </>
          ),
          role: "rowheader",
          "aria-label": "Action",
          className: "action",
        },
        {
          content: (
            <>
              {operation.err && <div>{operation.err}</div>}
              {Object.entries(operation.metadata ?? {}).map(
                ([key, value], index) => (
                  <div key={index} title={JSON.stringify(value)}>
                    {key}: {JSON.stringify(value)}
                  </div>
                ),
              )}
            </>
          ),
          role: "cell",
          "aria-label": "信息",
          className: "info",
        },
        {
          content: (
            <>
              <Icon
                name={getIconNameForStatus(operation.status)}
                className="status-icon"
              />
              {getOperationStatusLabel(operation.status)}
            </>
          ),
          role: "cell",
          "aria-label": "状态",
          className: "status",
        },
        {
          content: <CancelOperationBtn operation={operation} />,
          role: "cell",
          className: "u-align--right cancel",
          "aria-label": "操作",
        },
      ],
      sortData: {
        created_at: operation.created_at,
        action: getOperationDescriptionLabel(operation.description),
        status: getOperationStatusLabel(operation.status),
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  return (
    <>
      <CustomLayout
        mainClassName="operation-list"
        contentClassName="u-no-padding--bottom"
        header={
          <PageHeader>
            <PageHeader.Left>
              <PageHeader.Title>进行中的操作</PageHeader.Title>
              {operations.length > 0 && (
                <PageHeader.Search>
                  <SearchBox
                    className="search-box margin-right u-no-margin--bottom"
                    name="search-operations"
                    onChange={setQuery}
                    placeholder="搜索"
                    value={query}
                    aria-label="搜索"
                  />
                </PageHeader.Search>
              )}
            </PageHeader.Left>
            <PageHeader.BaseActions>
              <RefreshOperationsBtn />
            </PageHeader.BaseActions>
          </PageHeader>
        }
      >
        <NotificationRow />
        <Row>
          {operations.length > 0 && (
            <ScrollableTable
              dependencies={[filteredOperations, notify.notification]}
              tableId="operation-table"
              belowIds={["status-bar"]}
            >
              <TablePagination
                data={sortedRows}
                id="pagination"
                itemName="操作"
                className="u-no-margin--top"
                aria-label="Table pagination control"
                description={`显示全部 ${sortedRows.length} 条操作`}
              >
                <MainTable
                  id="operation-table"
                  headers={headers}
                  sortable
                  responsive
                  onUpdateSort={updateSort}
                  emptyStateMsg={
                    isLoading ? (
                      <Spinner className="u-loader" text="正在加载操作..." />
                    ) : (
                      "未找到匹配的操作"
                    )
                  }
                />
              </TablePagination>
            </ScrollableTable>
          )}
          {!isLoading && operations.length === 0 && (
            <EmptyState
              className="empty-state"
              image={<Icon name="status" className="empty-state-icon" />}
              title="未找到操作"
            >
              <p>当前没有进行中的操作。</p>
            </EmptyState>
          )}
        </Row>
      </CustomLayout>
    </>
  );
};

export default OperationList;
