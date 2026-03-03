import type { FC } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LxdNetwork } from "types/network";
import { deleteNetwork } from "api/networks";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import ResourceLabel from "components/ResourceLabel";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import classnames from "classnames";
import { useNetworkEntitlements } from "util/entitlements/networks";

interface Props {
  network: LxdNetwork;
  project: string;
}

const DeleteNetworkBtn: FC<Props> = ({ network, project }) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isSmallScreen = useIsScreenBelow();
  const { canDeleteNetwork } = useNetworkEntitlements();

  const handleDelete = () => {
    setLoading(true);
    deleteNetwork(network.name, project)
      .then(() => {
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === queryKeys.projects &&
            query.queryKey[1] === project &&
            query.queryKey[2] === queryKeys.networks,
        });
        navigate(`/ui/project/${encodeURIComponent(project)}/networks`);
        toastNotify.success(
          <>
            网络 <ResourceLabel bold type="network" value={network.name} />{" "}
            已删除。
          </>,
        );
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("删除网络失败", e);
      });
  };

  const isUsed = (network.used_by?.length ?? 0) > 0;
  const isManaged = network.managed;

  const getOnHoverText = () => {
    if (!canDeleteNetwork(network)) {
      return "你没有删除此网络的权限";
    }

    if (!isManaged) {
      return "无法删除，网络未托管";
    }

    if (isUsed) {
      return "无法删除，网络正在使用中";
    }

    return "";
  };

  return (
    <ConfirmationButton
      onHoverText={getOnHoverText()}
      confirmationModalProps={{
        title: "确认删除",
        confirmButtonAppearance: "negative",
        confirmButtonLabel: "删除",
        children: (
          <p>
            你确定要删除网络{" "}
            <ResourceLabel type="network" value={network.name} bold />?<br />
            此操作不可撤销，并可能导致数据丢失。
          </p>
        ),
        onConfirm: handleDelete,
      }}
      className={classnames("u-no-margin--bottom", {
        "has-icon": !isSmallScreen,
      })}
      loading={isLoading}
      disabled={!canDeleteNetwork(network) || isUsed || !isManaged || isLoading}
      shiftClickEnabled
      showShiftClickHint
    >
      {!isSmallScreen && <Icon name="delete" />}
      <span>删除网络</span>
    </ConfirmationButton>
  );
};

export default DeleteNetworkBtn;
