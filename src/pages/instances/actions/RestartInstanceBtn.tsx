import type { FC } from "react";
import { useState } from "react";
import type { LxdInstance } from "types/instance";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { restartInstance } from "api/instances";
import { useInstanceLoading } from "context/instanceLoading";
import ConfirmationForce from "components/ConfirmationForce";
import {
  ConfirmationButton,
  Icon,
  useToastNotification,
} from "@canonical/react-components";
import { useEventQueue } from "context/eventQueue";
import InstanceLinkChip from "../InstanceLinkChip";
import { useInstanceEntitlements } from "util/entitlements/instances";
import ResourceLabel from "components/ResourceLabel";

interface Props {
  instance: LxdInstance;
}

const RestartInstanceBtn: FC<Props> = ({ instance }) => {
  const eventQueue = useEventQueue();
  const instanceLoading = useInstanceLoading();
  const toastNotify = useToastNotification();
  const [isForce, setForce] = useState(false);
  const queryClient = useQueryClient();
  const isLoading =
    instanceLoading.getType(instance) === "Restarting" ||
    instance.status === "Restarting";
  const { canUpdateInstanceState } = useInstanceEntitlements();

  const instanceLink = <InstanceLinkChip instance={instance} />;

  const handleRestart = () => {
    instanceLoading.setLoading(instance, "Restarting");
    restartInstance(instance, isForce)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => toastNotify.success(<>实例 {instanceLink} 已重启。</>),
          (msg) =>
            toastNotify.failure("重启实例失败", new Error(msg), instanceLink),
          () => {
            instanceLoading.setFinish(instance);
            queryClient.invalidateQueries({
              queryKey: [queryKeys.instances],
            });
          },
        );
      })
      .catch((e) => {
        toastNotify.failure("重启实例失败", e, instanceLink);
        instanceLoading.setFinish(instance);
      });
  };

  const disabledStatuses = ["Stopped", "Frozen", "Error"];
  const isDisabled =
    isLoading ||
    disabledStatuses.includes(instance.status) ||
    instanceLoading.getType(instance) === "Migrating";

  return (
    <ConfirmationButton
      appearance="base"
      loading={isLoading}
      className="has-icon is-dense"
      confirmationModalProps={{
        title: "确认重启",
        children: (
          <p>
            这将重启实例{" "}
            <ResourceLabel type="instance" value={instance.name} bold />.
          </p>
        ),
        onConfirm: handleRestart,
        close: () => {
          setForce(false);
        },
        cancelButtonLabel: "取消",
        confirmButtonLabel: canUpdateInstanceState(instance)
          ? "重启"
          : "你没有重启此实例的权限",
        confirmExtra: (
          <ConfirmationForce label="强制重启" force={[isForce, setForce]} />
        ),
      }}
      disabled={isDisabled || !canUpdateInstanceState(instance) || isLoading}
      shiftClickEnabled
    >
      <Icon name="restart" />
    </ConfirmationButton>
  );
};

export default RestartInstanceBtn;
