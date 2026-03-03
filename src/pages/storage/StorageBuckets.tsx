import { useEffect, useState, type FC } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  EmptyState,
  Icon,
  Row,
  ScrollableTable,
  TablePagination,
  useNotify,
  CustomLayout,
  Spinner,
} from "@canonical/react-components";
import StorageBucketsFilter, {
  QUERY,
  POOL,
} from "pages/storage/StorageBucketsFilter";
import {
  ACTIONS_COL,
  POOL_COL,
  NAME_COL,
  SIZE_COL,
  URL_COL,
  DESCRIPTION_COL,
  COLUMN_WIDTHS,
  KEY_COL,
} from "util/storageBucketTable";
import useSortTableData from "util/useSortTableData";
import PageHeader from "components/PageHeader";
import HelpLink from "components/HelpLink";
import NotificationRow from "components/NotificationRow";
import { useBuckets } from "context/useBuckets";
import type { StorageBucketsFilterType } from "./StorageBucketsFilter";
import StorageBucketActions from "./actions/StorageBucketActions";
import CreateStorageBucketBtn from "./actions/CreateStorageBucketBtn";
import SelectableMainTable from "components/SelectableMainTable";
import SelectedTableNotification from "components/SelectedTableNotification";
import ResourceLink from "components/ResourceLink";
import usePanelParams, { panels } from "util/usePanelParams";
import StorageBucketBulkDelete from "./actions/StorageBucketBulkDelete";
import type { LxdStorageBucket } from "types/storage";
import CreateStorageBucketPanel from "./panels/CreateStorageBucketPanel";
import EditStorageBucketPanel from "./panels/EditStorageBucketPanel";
import StorageBucketLink from "./StorageBucketLink";
import StorageBucketKeyCount from "./StorageBucketKeyCount";
import DocLink from "components/DocLink";

const StorageBuckets: FC = () => {
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const [searchParams] = useSearchParams();

  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [processingNames, setProcessingNames] = useState<string[]>([]);
  const panelParams = usePanelParams();

  const filters: StorageBucketsFilterType = {
    queries: searchParams.getAll(QUERY),
    pools: searchParams.getAll(POOL),
  };

  if (!project) {
    return <>缺少项目参数</>;
  }

  const { data: buckets = [], error, isLoading } = useBuckets(project);

  const getBucketKey = (bucket: LxdStorageBucket) => {
    return `${bucket.name}-${bucket.pool}-${bucket.location || ""}`;
  };

  useEffect(() => {
    const validKeys = new Set(buckets.map(getBucketKey));
    const validSelections = selectedNames.filter((name) => validKeys.has(name));
    if (validSelections.length !== selectedNames.length) {
      setSelectedNames(validSelections);
    }
  }, [buckets]);

  if (error) {
    notify.failure("加载存储桶失败", error);
  }

  const headers = [
    {
      content: NAME_COL,
      sortKey: "name",
      className: "name",
      style: { width: COLUMN_WIDTHS[NAME_COL] },
    },
    {
      content: POOL_COL,
      sortKey: "pool",
      className: "pool",
      style: { width: COLUMN_WIDTHS[POOL_COL] },
    },
    {
      content: SIZE_COL,
      sortKey: "size",
      className: "size",
      style: { width: COLUMN_WIDTHS[SIZE_COL] },
    },
    {
      content: DESCRIPTION_COL,
      className: "description",
      style: { width: COLUMN_WIDTHS[DESCRIPTION_COL] },
    },
    {
      content: URL_COL,
      sortKey: "s3_url",
      style: { width: COLUMN_WIDTHS[URL_COL] },
    },
    {
      content: KEY_COL,
      style: { width: COLUMN_WIDTHS[KEY_COL] },
      className: "keys",
    },
    {
      className: "actions u-align--right",
      "aria-label": "Actions",
      style: { width: COLUMN_WIDTHS[ACTIONS_COL] },
    },
  ];

  const filteredBuckets = buckets.filter((item) => {
    if (!filters.queries.every((q) => item.name.toLowerCase().includes(q))) {
      return false;
    }
    if (filters.pools.length > 0 && !filters.pools.includes(item.pool)) {
      return false;
    }
    return true;
  });

  const rows = filteredBuckets.map((bucket) => {
    return {
      key: getBucketKey(bucket),
      name: getBucketKey(bucket),
      className: "u-row",
      columns: [
        {
          content: <StorageBucketLink bucket={bucket} project={project} />,
          role: "rowheader",
          "aria-label": NAME_COL,
          style: { width: COLUMN_WIDTHS[NAME_COL] },
        },
        {
          content: (
            <ResourceLink
              type="pool"
              value={bucket.pool}
              to={`/ui/project/${encodeURIComponent(project)}/storage/pool/${encodeURIComponent(bucket.pool)}`}
            />
          ),
          role: "cell",
          "aria-label": POOL_COL,
          style: { width: COLUMN_WIDTHS[POOL_COL] },
        },
        {
          content: bucket.config?.size ?? "-",
          role: "cell",
          "aria-label": SIZE_COL,
          style: { width: COLUMN_WIDTHS[SIZE_COL] },
        },
        {
          content: bucket.description || "-",
          role: "cell",
          "aria-label": DESCRIPTION_COL,
          style: { width: COLUMN_WIDTHS[DESCRIPTION_COL] },
          className: "description u-truncate",
        },
        {
          content: (
            <div className="u-truncate" title={bucket.s3_url}>
              {bucket.s3_url}
            </div>
          ),
          role: "cell",
          "aria-label": URL_COL,
          style: { width: COLUMN_WIDTHS[URL_COL] },
        },
        {
          content: <StorageBucketKeyCount bucket={bucket} />,
          role: "cell",
          "aria-label": KEY_COL,
          style: { width: COLUMN_WIDTHS[KEY_COL] },
          className: "keys",
        },
        {
          className: "actions u-align--right",
          content: (
            <StorageBucketActions
              bucket={bucket}
              className="storage-bucket-actions u-no-margin--bottom"
            />
          ),
          role: "cell",
          "aria-label": ACTIONS_COL,
          style: { width: COLUMN_WIDTHS[ACTIONS_COL] },
        },
      ],
      sortData: {
        name: bucket.name,
        pool: bucket.pool,
        size: bucket.config?.size ?? "",
        s3_url: bucket.s3_url,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({
    rows,
    defaultSortDirection: "descending",
  });

  if (isLoading) {
    return <Spinner className="u-loader" text="加载中..." isMainComponent />;
  }

  const hasBuckets = buckets.length !== 0;

  const content = hasBuckets ? (
    <div className="storage-buckets">
      <ScrollableTable
        dependencies={[filteredBuckets]}
        tableId="bucket-table"
        belowIds={["status-bar"]}
      >
        <TablePagination
          data={sortedRows}
          id="pagination"
          itemName="存储桶"
          className="u-no-margin--top"
          aria-label="Table pagination control"
          description={
            selectedNames.length > 0 && (
              <SelectedTableNotification
                totalCount={buckets.length ?? 0}
                itemName="存储桶"
                parentName="项目"
                selectedNames={selectedNames}
                setSelectedNames={setSelectedNames}
                filteredNames={filteredBuckets.map((bucket) =>
                  getBucketKey(bucket),
                )}
              />
            )
          }
        >
          <SelectableMainTable
            id="bucket-table"
            className="storage-buckets-table"
            headers={headers}
            rows={sortedRows}
            sortable
            emptyStateMsg="未找到匹配搜索的存储桶"
            itemName="存储桶"
            parentName="项目"
            selectedNames={selectedNames}
            setSelectedNames={setSelectedNames}
            disabledNames={processingNames}
            filteredNames={filteredBuckets.map(getBucketKey)}
            onUpdateSort={updateSort}
            defaultSortDirection="descending"
            responsive
          />
        </TablePagination>
      </ScrollableTable>
    </div>
  ) : (
    <EmptyState
      className="empty-state"
      image={<Icon name="switcher-dashboard" className="empty-state-icon" />}
      title="此项目中未找到存储桶"
    >
      <p>存储桶会显示在这里</p>
      <p>
        <DocLink
          docPath="/explanation/storage/#storage-buckets"
          hasExternalIcon
        >
          了解更多存储桶信息
        </DocLink>
      </p>
      <CreateStorageBucketBtn className="empty-state-button" />
    </EmptyState>
  );

  const selectedBuckets = buckets.filter((bucket) => {
    const bucketKey = getBucketKey(bucket);
    return selectedNames.includes(bucketKey);
  });

  const panelBucket = buckets.find((bucket) => {
    return (
      bucket.name == panelParams.bucket &&
      bucket.pool == panelParams.pool &&
      bucket.location == panelParams.target
    );
  });

  return (
    <>
      <CustomLayout
        mainClassName="storage-bucket-list"
        header={
          <PageHeader>
            <PageHeader.Left>
              <PageHeader.Title>
                <HelpLink
                  docPath="/explanation/storage/#storage-buckets"
                  title="了解更多存储桶"
                >
                  存储桶
                </HelpLink>
              </PageHeader.Title>
              {!selectedNames.length && !panelParams.panel && hasBuckets && (
                <PageHeader.Search>
                  <StorageBucketsFilter key={project} buckets={buckets} />
                </PageHeader.Search>
              )}
              {!!selectedNames.length && (
                <StorageBucketBulkDelete
                  buckets={selectedBuckets}
                  onStart={() => {
                    setProcessingNames(selectedNames);
                  }}
                  onFinish={() => {
                    setProcessingNames([]);
                  }}
                />
              )}
            </PageHeader.Left>
            {hasBuckets && (
              <PageHeader.BaseActions>
                <CreateStorageBucketBtn className="u-float-right u-no-margin--bottom" />
              </PageHeader.BaseActions>
            )}
          </PageHeader>
        }
      >
        {!panelParams.panel && <NotificationRow />}
        <Row>{content}</Row>
      </CustomLayout>

      {panelParams.panel === panels.createStorageBucket && (
        <CreateStorageBucketPanel />
      )}
      {panelParams.panel === panels.editStorageBucket && panelBucket && (
        <EditStorageBucketPanel bucket={panelBucket} />
      )}
    </>
  );
};

export default StorageBuckets;
