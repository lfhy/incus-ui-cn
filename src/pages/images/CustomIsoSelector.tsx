import type { FC } from "react";
import { Button, MainTable, Spinner } from "@canonical/react-components";
import { humanFileSize, isoTimeToString } from "util/helpers";
import { useCurrentProject } from "context/useCurrentProject";
import type { LxdImageType, RemoteImage } from "types/image";
import type { IsoImage } from "types/iso";
import { useLoadIsoVolumes } from "context/useVolumes";

interface Props {
  primaryImage: IsoImage | null;
  onSelect: (image: RemoteImage, type?: LxdImageType) => void;
  onUpload: () => void;
  onCancel: () => void;
}

const CustomIsoSelector: FC<Props> = ({
  primaryImage,
  onSelect,
  onUpload,
  onCancel,
}) => {
  const { project } = useCurrentProject();
  const projectName = project?.name ?? "";

  const { data: images = [], isLoading } = useLoadIsoVolumes(projectName);

  const headers = [
    { content: "名称", sortKey: "name" },
    { content: "存储池", sortKey: "storagePool" },
    { content: "上传日期", sortKey: "uploadedAt" },
    { content: "大小", sortKey: "size" },
    { "aria-label": "操作", className: "actions" },
  ];

  const rows = images.map((image) => {
    const selectIso = () => {
      onSelect(image, "virtual-machine");
    };

    return {
      key: image.fingerprint,
      className: "u-row",
      columns: [
        {
          content: (
            <div className="u-truncate iso-name" title={image.aliases}>
              {image.aliases}
            </div>
          ),
          role: "rowheader",
          "aria-label": "名称",
          onClick: selectIso,
        },
        {
          content: image.pool,
          role: "cell",
          "aria-label": "存储池",
          onClick: selectIso,
        },
        {
          content: isoTimeToString(new Date(image.created_at).toISOString()),
          role: "cell",
          "aria-label": "上传时间",
          onClick: selectIso,
        },
        {
          content:
            image.volume?.config.size &&
            humanFileSize(+image.volume.config.size),
          role: "cell",
          "aria-label": "大小",
          onClick: selectIso,
        },
        {
          content: (
            <Button
              appearance={
                primaryImage?.name === image.aliases &&
                primaryImage?.pool === image.pool
                  ? "positive"
                  : ""
              }
              onClick={selectIso}
              dense
            >
              选择
            </Button>
          ),
          role: "cell",
          "aria-label": "操作",
          className: "u-align--right",
          onClick: selectIso,
        },
      ],
      sortData: {
        name: image.aliases.toLowerCase(),
        storagePool: image.pool?.toLowerCase(),
        size: +(image.volume?.config.size ?? 0),
        uploadedAt: image.created_at,
      },
    };
  });

  return (
    <>
      <div className="iso-table">
        <MainTable
          headers={headers}
          rows={rows}
          sortable
          className="u-selectable-table-rows u-table-layout--auto"
          emptyStateMsg={
            isLoading ? (
              <Spinner className="u-loader" text="加载镜像中..." />
            ) : (
              "未找到自定义 ISO"
            )
          }
        />
      </div>
      <footer className="p-modal__footer">
        <Button
          appearance="base"
          className="u-no-margin--bottom"
          onClick={onCancel}
        >
          取消
        </Button>
        <Button
          appearance={rows.length === 0 ? "positive" : ""}
          onClick={onUpload}
          type="button"
          className="iso-btn u-no-margin--bottom"
        >
          <span>上传自定义 ISO</span>
        </Button>
      </footer>
    </>
  );
};

export default CustomIsoSelector;
