import type { FC } from "react";
import { useState } from "react";
import type { LxdInstance } from "types/instance";
import { useQueryClient } from "@tanstack/react-query";
import { stopInstance } from "api/instances";
import { queryKeys } from "util/queryKeys";
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

const StopInstanceBtn: FC<Props> = ({ instance }) => {
  const eventQueue = useEventQueue();
  const instanceLoading = useInstanceLoading();
  const toastNotify = useToastNotification();
  const [isForce, setForce] = useState(false);
  const queryClient = useQueryClient();
  const { canUpdateInstanceState } = useInstanceEntitlements();

  const clearCache = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.instances],
    });
  };

  const isLoading =
    instanceLoading.getType(instance) === "Stopping" ||
    instance.status === "Stopping";

  const instanceLink = <InstanceLinkChip instance={instance} />;

  const handleStop = () => {
    instanceLoading.setLoading(instance, "Stopping");
    stopInstance(instance, isForce)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => {
            toastNotify.success(<>实例 {instanceLink} 已停止。</>);
            clearCache();
          },
          (msg) => {
            toastNotify.failure("停止实例失败", new Error(msg), instanceLink);
            // Delay clearing the cache, because the instance is reported as STOPPED
            // when a stop operation failed, only shortly after it goes back to RUNNING
            // and we want to avoid showing the intermediate STOPPED state.
            setTimeout(clearCache, 1500);
          },
          () => {
            instanceLoading.setFinish(instance);
          },
        );
      })
      .catch((e) => {
        toastNotify.failure("停止实例失败", e, instanceLink);
        instanceLoading.setFinish(instance);
      });
  };

  const disabledStatuses = ["Stopped", "Migrating"];

  // Keep button disabled while instance is stopping to allow force stop
  const isDisabled =
    disabledStatuses.includes(instance.status) ||
    instanceLoading.getType(instance) === "Migrating" ||
    !canUpdateInstanceState(instance);

  return (
    <ConfirmationButton
      appearance="base"
      loading={isLoading}
      disabled={isDisabled}
      confirmationModalProps={{
        title: "确认停止",
        children: (
          <p>
            这将停止实例{" "}
            <ResourceLabel type={instance.type} value={instance.name} bold />.
          </p>
        ),
        confirmExtra: (
          <ConfirmationForce label="强制停止" force={[isForce, setForce]} />
        ),
        onConfirm: handleStop,
        close: () => {
          setForce(false);
        },
        cancelButtonLabel: "取消",
        confirmButtonLabel: canUpdateInstanceState(instance)
          ? "停止"
          : "你没有停止此实例的权限",
      }}
      className="has-icon is-dense"
      shiftClickEnabled
    >
      <Icon name="stop" />
    </ConfirmationButton>
  );
};

export default StopInstanceBtn;
