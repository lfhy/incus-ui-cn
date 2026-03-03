import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  EmptyState,
  Icon,
  List,
  Row,
  ScrollableTable,
  SearchBox,
  TablePagination,
  useNotify,
  CustomLayout,
  Spinner,
} from "@canonical/react-components";
import { humanFileSize, isoTimeToString } from "util/helpers";
import DeleteImageBtn from "./actions/DeleteImageBtn";
import { useParams } from "react-router-dom";
import CreateInstanceFromImageBtn from "pages/images/actions/CreateInstanceFromImageBtn";
import { localLxdToRemoteImage } from "util/images";
import useSortTableData from "util/useSortTableData";
import SelectableMainTable from "components/SelectableMainTable";
import BulkDeleteImageBtn from "pages/images/actions/BulkDeleteImageBtn";
import SelectedTableNotification from "components/SelectedTableNotification";
import HelpLink from "components/HelpLink";
import NotificationRow from "components/NotificationRow";
import PageHeader from "components/PageHeader";
import CustomIsoBtn from "pages/storage/actions/CustomIsoBtn";
import DownloadImageBtn from "./actions/DownloadImageBtn";
import UploadImageBtn from "pages/images/actions/UploadImageBtn";
import { useImagesInProject } from "context/useImages";
import { useImageEntitlements } from "util/entitlements/images";

const ImageList: FC = () => {
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const [query, setQuery] = useState<string>("");
  const [processingNames, setProcessingNames] = useState<string[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const { canDeleteImage } = useImageEntitlements();

  if (!project) {
    return <>缺少项目参数</>;
  }

  const { data: images = [], error, isLoading } = useImagesInProject(project);

  if (error) {
    notify.failure("加载镜像失败", error);
  }

  useEffect(() => {
    const validNames = new Set(images?.map((image) => image.fingerprint));
    const validSelections = selectedNames.filter((name) =>
      validNames.has(name),
    );
    if (validSelections.length !== selectedNames.length) {
      setSelectedNames(validSelections);
    }
  }, [images]);

  useEffect(() => {
    const searchBtn = document.querySelector<HTMLButtonElement>(
      ".images-list .p-search-box__button",
    );
    if (searchBtn) {
      searchBtn.textContent = "搜索";
      searchBtn.setAttribute("aria-label", "搜索");
    }
  }, []);

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
        const originalValue = textNode.nodeValue ?? "";
        const value = originalValue.trim();
        if (!value) {
          continue;
        }

        let updatedValue = originalValue.replace(
          /Showing\s+(\d+)\s+out of\s+(\d+)\s+/g,
          "显示 $1 / $2 ",
        );

        if (value === "Page number") {
          updatedValue = "页码";
        } else if (value === "Items per page") {
          updatedValue = "每页条目数";
        } else if (value === "/page") {
          updatedValue = "/页";
        } else if (value === "of") {
          updatedValue = "共";
        }

        if (updatedValue !== originalValue) {
          updates.push({ node: textNode, value: updatedValue });
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
  }, [images.length, selectedNames.length, query]);

  const headers = [
    { content: "名称", sortKey: "name" },
    { content: "别名", sortKey: "alias", className: "aliases" },
    {
      content: "架构",
      sortKey: "architecture",
      className: "architecture",
    },
    {
      content: "公开",
      sortKey: "public",
      className: "public",
    },
    { content: "类型", sortKey: "type", className: "type" },
    {
      content: "上传时间",
      sortKey: "uploaded_at",
      className: "uploaded_at",
    },
    { content: "大小", sortKey: "size", className: "u-align--right size" },
    { "aria-label": "操作", className: "actions" },
  ];

  const filteredImages = images.filter(
    (item) =>
      !query ||
      (item.properties?.description ?? "")
        .toLowerCase()
        .includes(query.toLowerCase()) ||
      item.aliases
        .map((alias) => alias.name)
        .join(", ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  const deletableImages = filteredImages
    .filter(canDeleteImage)
    .map((image) => image.fingerprint);

  const selectedImages = images.filter((image) =>
    selectedNames.includes(image.fingerprint),
  );

  const rows = filteredImages.map((image) => {
    const actions = (
      <List
        inline
        className="actions-list u-no-margin--bottom"
        items={[
          <CreateInstanceFromImageBtn
            key="launch"
            projectName={project}
            image={localLxdToRemoteImage(image)}
          />,
          <DownloadImageBtn key="download" image={image} project={project} />,
          <DeleteImageBtn key="delete" image={image} project={project} />,
        ]}
      />
    );

    const imageAlias = image.aliases.map((alias) => alias.name).join(", ");
    const description = image.properties?.description ?? image.fingerprint;

    return {
      key: image.fingerprint,
      name: image.fingerprint,
      columns: [
        {
          content: description,
          role: "rowheader",
          "aria-label": "名称",
        },
        {
          content: imageAlias,
          role: "cell",
          "aria-label": "别名",
          className: "aliases",
        },
        {
          content: image.architecture,
          role: "cell",
          "aria-label": "架构",
          className: "architecture",
        },
        {
          content: image.public ? "是" : "否",
          role: "cell",
          "aria-label": "公开",
          className: "public",
        },
        {
          content: image.type == "virtual-machine" ? "虚拟机" : "容器",
          role: "cell",
          "aria-label": "类型",
          className: "type",
        },
        {
          content: isoTimeToString(image.uploaded_at),
          role: "cell",
          "aria-label": "上传时间",
          className: "uploaded_at",
        },
        {
          content: humanFileSize(image.size),
          role: "cell",
          "aria-label": "大小",
          className: "u-align--right size",
        },
        {
          content: actions,
          role: "cell",
          "aria-label": "操作",
          className: "u-align--right actions",
        },
      ],
      sortData: {
        name: description.toLowerCase(),
        alias: imageAlias.toLowerCase(),
        architecture: image.architecture,
        public: image.public,
        type: image.type,
        size: +image.size,
        uploaded_at: image.uploaded_at,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  if (isLoading) {
    return <Spinner className="u-loader" text="加载中..." isMainComponent />;
  }

  return (
    <CustomLayout
      mainClassName="images-list"
      contentClassName="u-no-padding--bottom"
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <HelpLink docPath="/image-handling/" title="了解更多镜像">
                镜像
              </HelpLink>
            </PageHeader.Title>
            {selectedNames.length === 0 && images.length > 0 && (
              <PageHeader.Search>
                <SearchBox
                  name="search-images"
                  className="search-box u-no-margin--bottom"
                  type="text"
                  onChange={(value) => {
                    setQuery(value);
                  }}
                  placeholder="搜索"
                  value={query}
                  aria-label="搜索镜像"
                />
              </PageHeader.Search>
            )}
            {selectedImages.length > 0 && (
              <BulkDeleteImageBtn
                images={selectedImages}
                project={project}
                onStart={() => {
                  setProcessingNames(selectedNames);
                }}
                onFinish={() => {
                  setProcessingNames([]);
                }}
              />
            )}
          </PageHeader.Left>
          <PageHeader.BaseActions>
            <UploadImageBtn projectName={project} />
            <CustomIsoBtn project={project} />
          </PageHeader.BaseActions>
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row>
        {images.length === 0 && (
          <EmptyState
            className="empty-state"
            image={<Icon name="image" className="empty-state-icon" />}
            title="此项目中未找到镜像"
          >
            <p>从远程源启动实例后，镜像会显示在这里。</p>
          </EmptyState>
        )}
        {images.length > 0 && (
          <ScrollableTable
            dependencies={[images]}
            tableId="image-table"
            belowIds={["status-bar"]}
          >
            <TablePagination
              data={sortedRows}
              id="pagination"
              itemName="镜像"
              className="u-no-margin--top"
              aria-label="Table pagination control"
              description={
                selectedNames.length > 0 && (
                  <SelectedTableNotification
                    totalCount={deletableImages.length ?? 0}
                    itemName="镜像"
                    parentName="项目"
                    selectedNames={selectedNames}
                    setSelectedNames={setSelectedNames}
                    filteredNames={deletableImages}
                  />
                )
              }
            >
              <SelectableMainTable
                id="image-table"
                headers={headers}
                sortable
                className="image-table"
                defaultSortKey="uploaded_at"
                emptyStateMsg="未找到匹配搜索的镜像"
                onUpdateSort={updateSort}
                selectedNames={selectedNames}
                setSelectedNames={setSelectedNames}
                itemName="镜像"
                parentName="项目"
                filteredNames={filteredImages.map((item) => item.fingerprint)}
                disabledNames={processingNames}
                rows={[]}
              />
            </TablePagination>
          </ScrollableTable>
        )}
      </Row>
    </CustomLayout>
  );
};

export default ImageList;
