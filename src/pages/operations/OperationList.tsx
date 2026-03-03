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

const OperationList: FC = () => {
  const notify = useNotify();
  const { operations, isLoading, error } = useOperations();
  const [query, setQuery] = useState<string>("");

  if (error) {
    notify.failure("加载操作失败", error);
  }

  const headers = [
    { content: "Time", className: "time", sortKey: "created_at" },
    { content: "Action", className: "action", sortKey: "action" },
    { content: "Info", className: "info" },
    { content: "Status", className: "status status-header", sortKey: "status" },
    { "aria-label": "Actions", className: "cancel u-align--right" },
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
                Initiated:{" "}
                {nonBreakingSpaces(isoTimeToString(operation.created_at))}
              </div>
              <div className="date-pair u-text--muted">
                Last update:{" "}
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
              <div>{operation.description}</div>
              <OperationInstanceName operation={operation} />
              <div className="u-text--muted u-truncate" title={projectName}>
                Project: {projectName}
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
                  <span key={index} title={JSON.stringify(value)}>
                    {key}: {JSON.stringify(value)}
                  </span>
                ),
              )}
            </>
          ),
          role: "cell",
          "aria-label": "Info",
          className: "info",
        },
        {
          content: (
            <>
              <Icon
                name={getIconNameForStatus(operation.status)}
                className="status-icon"
              />
              {operation.status}
            </>
          ),
          role: "cell",
          "aria-label": "Status",
          className: "status",
        },
        {
          content: <CancelOperationBtn operation={operation} />,
          role: "cell",
          className: "u-align--right cancel",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        created_at: operation.created_at,
        action: operation.description,
        status: operation.status,
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
