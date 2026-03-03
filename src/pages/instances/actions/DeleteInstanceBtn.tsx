import type { FC } from "react";
import { useState } from "react";
import { deleteInstance } from "api/instances";
import type { LxdInstance } from "types/instance";
import { useNavigate } from "react-router-dom";
import { deletableStatuses } from "util/instanceDelete";
import {
  ConfirmationButton,
  Icon,
  useToastNotification,
} from "@canonical/react-components";
import classnames from "classnames";
import { useEventQueue } from "context/eventQueue";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useInstanceLoading } from "context/instanceLoading";
import ResourceLabel from "components/ResourceLabel";
import InstanceLinkChip from "../InstanceLinkChip";
import { useInstanceEntitlements } from "util/entitlements/instances";

interface Props {
  instance: LxdInstance;
  classname?: string;
  onClose?: () => void;
  label?: string;
}

const DeleteInstanceBtn: FC<Props> = ({
  instance,
  classname,
  onClose,
  label = "删除",
}) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const instanceLoading = useInstanceLoading();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { canDeleteInstance } = useInstanceEntitlements();

  const handleDelete = () => {
    setLoading(true);
    const instanceLink = <InstanceLinkChip instance={instance} />;

    deleteInstance(instance)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => {
            queryClient.invalidateQueries({
              queryKey: [queryKeys.projects, instance.project],
            });
            navigate(
              `/ui/project/${encodeURIComponent(instance.project)}/instances`,
            );
            toastNotify.success(
              <>
                实例{" "}
                <ResourceLabel
                  bold
                  type={instance.type}
                  value={instance.name}
                />{" "}
                已删除。
              </>,
            );
          },
          (msg) => {
            toastNotify.failure("删除实例失败", new Error(msg), instanceLink);
          },
          () => {
            setLoading(false);
          },
        );
      })
      .catch((e) => {
        toastNotify.failure("删除实例失败", e, instanceLink);
        setLoading(false);
      });
  };

  const isDeletableStatus = deletableStatuses.includes(instance.status);
  const isDisabled =
    isLoading ||
    !isDeletableStatus ||
    instanceLoading.getType(instance) === "Migrating" ||
    !canDeleteInstance(instance);
  const getHoverText = () => {
    if (!canDeleteInstance(instance)) {
      return "你没有删除此实例的权限";
    }
    if (!isDeletableStatus) {
      return "请先停止实例再删除";
    }
    return "删除实例";
  };

  return (
    <ConfirmationButton
      onHoverText={getHoverText()}
      appearance="default"
      className={classnames("u-no-margin--bottom has-icon", classname)}
      loading={isLoading}
      confirmationModalProps={{
        close: onClose,
        title: "确认删除",
        children: (
          <p>
            这将永久删除实例{" "}
            <ResourceLabel type={instance.type} value={instance.name} bold />.
            <br />
            此操作不可撤销，并可能导致数据丢失。
          </p>
        ),
        onConfirm: handleDelete,
        confirmButtonLabel: "删除",
      }}
      disabled={isDisabled || isLoading}
      shiftClickEnabled
      showShiftClickHint
    >
      <Icon name="delete" />
      {label && <span>{label}</span>}
    </ConfirmationButton>
  );
};

export default DeleteInstanceBtn;
