import type { FC } from "react";
import {
  Button,
  MainTable,
  Modal,
  Notification,
  ScrollableTable,
  Spinner,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchResources } from "api/server";
import type { GpuCard } from "types/resources";
import { useServerEntitlements } from "util/entitlements/server";

interface Props {
  onSelect: (image: GpuCard) => void;
  onClose: () => void;
}

const SelectGPUModal: FC<Props> = ({ onSelect, onClose }) => {
  const { canViewResources } = useServerEntitlements();

  const { data: resources, isLoading } = useQuery({
    queryKey: [queryKeys.resources],
    queryFn: async () => fetchResources(),
    enabled: canViewResources(),
  });

  const headers = [
    { content: "厂商" },
    { content: "驱动" },
    { content: "PCI 地址" },
    { content: "ID" },
    { "aria-label": "操作", className: "actions" },
  ];

  const rows = isLoading
    ? []
    : resources?.gpu?.cards?.map((card) => {
        const selectCard = () => {
          onSelect(card);
        };

        return {
          key: card.pci_address,
          className: "u-row",
          columns: [
            {
              content: card.vendor,
              role: "rowheader",
              "aria-label": "厂商",
              onClick: selectCard,
            },
            {
              content: (
                <>
                  {card.driver}{" "}
                  <span className="u-text--muted">{card.driver_version}</span>
                </>
              ),
              role: "cell",
              "aria-label": "驱动",
              onClick: selectCard,
            },
            {
              content: card.pci_address,
              role: "cell",
              "aria-label": "PCI 地址",
              onClick: selectCard,
            },
            {
              content: card.drm?.id ?? "-",
              role: "cell",
              "aria-label": "ID",
              onClick: selectCard,
            },
            {
              content: (
                <Button
                  onClick={selectCard}
                  dense
                  aria-label={`选择 ${card.pci_address}`}
                >
                  选择
                </Button>
              ),
              role: "cell",
              "aria-label": "操作",
              className: "u-align--right",
              onClick: selectCard,
            },
          ],
        };
      });

  const getContent = () => {
    if (!canViewResources()) {
      return (
        <Notification severity="caution" title="权限受限">
          你没有权限查看服务器上的可用 GPU。
        </Notification>
      );
    }

    return (
      <ScrollableTable
        dependencies={[resources, rows]}
        belowIds={["modal-footer"]}
        tableId="gpu-select-table"
      >
        <MainTable
          id="gpu-select-table"
          headers={headers}
          rows={rows}
          sortable
          className="u-selectable-table-rows u-table-layout--auto"
          emptyStateMsg={
            isLoading ? (
              <Spinner className="u-loader" text="正在加载 GPU..." />
            ) : (
              "未找到 GPU"
            )
          }
        />
      </ScrollableTable>
    );
  };

  return (
    <Modal close={onClose} title="选择 GPU">
      {getContent()}
      <footer className="p-modal__footer" id="modal-footer">
        <Button
          className="u-no-margin--bottom"
          onClick={() => {
            onSelect({ pci_address: "" });
          }}
        >
          手动输入详情
        </Button>
      </footer>
    </Modal>
  );
};
export default SelectGPUModal;
