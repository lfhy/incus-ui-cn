import type { FC } from "react";
import { useState, useEffect } from "react";
import {
  Row,
  ScrollableTable,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import { fetchWarnings } from "api/warnings";
import { isoTimeToString } from "util/helpers";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import BulkDeleteWarningBtn from "pages/warnings/actions/BulkDeleteWarningBtn";
import SelectableMainTable from "components/SelectableMainTable";
import PageHeader from "components/PageHeader";
import WarningSearchFilter from "./WarningSearchFilter";
import { useSearchParams } from "react-router-dom";
import type { LxdWarningSeverity, LxdWarningStatus } from "types/warning";
import type { WarningFilters } from "util/warningFilter";

const WarningList: FC = () => {
  const notify = useNotify();
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [processingNames, setProcessingNames] = useState<string[]>([]);
  const [searchParams] = useSearchParams();

  const {
    data: warnings = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.warnings],
    queryFn: async () => fetchWarnings(),
    retry: false, // the api returns a 403 for users with limited permissions, surface the error right away
  });

  if (error) {
    notify.failure("加载告警失败", error);
  }

  const hasWarnings = isLoading || warnings.length > 0;

  const filters: WarningFilters = {
    queries: searchParams.getAll("query"),
    statuses: searchParams.getAll("status") as LxdWarningStatus[],
    severities: searchParams.getAll("severity") as LxdWarningSeverity[],
  };

  const filteredWarnings = warnings.filter((item) => {
    if (
      !filters.queries.every(
        (q) =>
          item.type.toLowerCase().includes(q) ||
          item.last_message.toLowerCase().includes(q),
      )
    ) {
      return false;
    }
    if (
      filters.statuses.length > 0 &&
      !filters.statuses.includes(item.status)
    ) {
      return false;
    }
    if (
      filters.severities.length > 0 &&
      !filters.severities.includes(item.severity)
    ) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    const validNames = new Set(
      filteredWarnings?.map((warning) => warning.uuid),
    );
    const validSelections = selectedNames.filter((name) =>
      validNames.has(name),
    );
    if (validSelections.length !== selectedNames.length) {
      setSelectedNames(validSelections);
    }
  }, [filteredWarnings]);

  const headers = [
    { content: "类型", sortKey: "type", className: "type" },
    {
      content: "最新消息",
      sortKey: "lastMessage",
      className: "last_message",
    },
    { content: "状态", sortKey: "status", className: "status" },
    { content: "严重级别", sortKey: "severity", className: "severity" },
    { content: "次数", sortKey: "count", className: "count u-align--right" },
    { content: "项目", sortKey: "project", className: "project" },
    { content: "首次出现", sortKey: "firstSeen", className: "first_seen_at" },
    { content: "最近出现", sortKey: "lastSeen", className: "last_seen_at" },
  ];

  const statusLabel: Record<string, string> = {
    new: "新建",
    acked: "已确认",
    resolved: "已解决",
  };

  const severityLabel: Record<string, string> = {
    low: "低",
    moderate: "中",
    high: "高",
  };

  const rows = filteredWarnings.map((warning) => {
    return {
      key: warning.uuid,
      name: warning.uuid,
      columns: [
        {
          content: warning.type,
          role: "rowheader",
          "aria-label": "类型",
          className: "type",
        },
        {
          content: warning.last_message,
          role: "cell",
          "aria-label": "最新消息",
          className: "last_message",
        },
        {
          content: statusLabel[warning.status] ?? warning.status,
          role: "cell",
          "aria-label": "状态",
          className: "status",
        },
        {
          content: severityLabel[warning.severity] ?? warning.severity,
          role: "cell",
          "aria-label": "严重级别",
          className: "severity",
        },
        {
          content: warning.count,
          role: "cell",
          className: "count u-align--right",
          "aria-label": "次数",
        },
        {
          content: warning.project,
          role: "cell",
          className: "project u-align--center",
          "aria-label": "项目",
        },
        {
          content: isoTimeToString(warning.first_seen_at),
          role: "cell",
          "aria-label": "首次出现",
          className: "first_seen_at",
        },
        {
          content: isoTimeToString(warning.last_seen_at),
          role: "cell",
          "aria-label": "最近出现",
          className: "last_seen_at",
        },
      ],
      sortData: {
        type: warning.type,
        lastMessage: warning.last_message.toLowerCase(),
        status: warning.status,
        severity: warning.severity,
        count: warning.count,
        project: warning.project.toLowerCase(),
        firstSeen: warning.first_seen_at,
        lastSeen: warning.last_seen_at,
      },
    };
  });

  return (
    <CustomLayout
      mainClassName="images-list"
      contentClassName="u-no-padding--bottom"
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <HelpLink docPath="/howto/troubleshoot/" title="了解更多故障排查">
                告警
              </HelpLink>
            </PageHeader.Title>
            {hasWarnings && selectedNames.length === 0 && (
              <PageHeader.Search>
                <WarningSearchFilter
                  key={`warning-${searchParams.get("search")}`}
                />
              </PageHeader.Search>
            )}
            {selectedNames.length > 0 && (
              <BulkDeleteWarningBtn
                warningIds={selectedNames}
                onStart={() => {
                  setProcessingNames(selectedNames);
                }}
                onFinish={() => {
                  setProcessingNames([]);
                }}
              />
            )}
          </PageHeader.Left>
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row>
        <ScrollableTable
          dependencies={[filteredWarnings]}
          tableId="warning-table"
          belowIds={["status-bar"]}
        >
          <SelectableMainTable
            id="warning-table"
            headers={headers}
            rows={rows}
            paginate={30}
            sortable
            className="warnings-table"
            emptyStateMsg={
              isLoading ? (
                <Spinner className="u-loader" text="正在加载告警..." />
              ) : (
                "暂无数据"
              )
            }
            itemName="告警"
            parentName="服务器"
            selectedNames={selectedNames}
            setSelectedNames={setSelectedNames}
            filteredNames={rows.map((item) => item.name)}
            disabledNames={processingNames}
          />
        </ScrollableTable>
      </Row>
    </CustomLayout>
  );
};

export default WarningList;
