import type { FC } from "react";
import { useState } from "react";
import type { LxdOperation } from "types/operation";
import { cancelOperation } from "api/operations";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ConfirmationButton,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";

interface Props {
  operation: LxdOperation;
  project?: string;
}

const CancelOperationBtn: FC<Props> = ({ operation, project }) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleCancel = () => {
    setLoading(true);
    cancelOperation(operation.id)
      .then(() => {
        toastNotify.success("操作已取消");
      })
      .catch((e) => {
        notify.failure("取消操作失败", e);
      })
      .finally(() => {
        setLoading(false);
        queryClient.invalidateQueries({
          queryKey: project
            ? [queryKeys.operations, project]
            : [queryKeys.operations],
        });
      });
  };

  return operation.status !== "Running" ? null : (
    <ConfirmationButton
      onHoverText={operation.may_cancel ? "取消操作" : "当前阶段无法取消操作"}
      className="u-no-margin--bottom"
      loading={isLoading}
      disabled={!operation.may_cancel || isLoading}
      confirmationModalProps={{
        title: "确认取消",
        children: <p>这将取消当前操作。</p>,
        confirmButtonLabel: "取消操作",
        onConfirm: handleCancel,
        cancelButtonLabel: "返回",
      }}
      shiftClickEnabled
      showShiftClickHint
    >
      <span>取消</span>
    </ConfirmationButton>
  );
};

export default CancelOperationBtn;
