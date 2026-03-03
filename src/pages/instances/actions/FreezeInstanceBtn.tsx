import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { freezeInstance } from "api/instances";
import { useInstanceLoading } from "context/instanceLoading";
import {
  ConfirmationButton,
  Icon,
  useToastNotification,
} from "@canonical/react-components";
import { useEventQueue } from "context/eventQueue";
import InstanceLinkChip from "../InstanceLinkChip";
import { useInstanceEntitlements } from "util/entitlements/instances";
import { isInstanceRunning } from "util/instanceStatus";
import ResourceLabel from "components/ResourceLabel";

interface Props {
  instance: LxdInstance;
}

const FreezeInstanceBtn: FC<Props> = ({ instance }) => {
  const eventQueue = useEventQueue();
  const instanceLoading = useInstanceLoading();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { canUpdateInstanceState } = useInstanceEntitlements();

  const clearCache = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.instances],
    });
  };

  const isLoading =
    instanceLoading.getType(instance) === "Freezing" ||
    instance.status === "Freezing";

  const instanceLink = <InstanceLinkChip instance={instance} />;

  const handleFreeze = () => {
    instanceLoading.setLoading(instance, "Freezing");
    freezeInstance(instance)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => {
            toastNotify.success(<>实例 {instanceLink} 已冻结。</>);
            clearCache();
          },
          (msg) => {
            toastNotify.failure("冻结实例失败", new Error(msg), instanceLink);
            // Delay clearing the cache, because the instance is reported as FROZEN
            // when a freeze operation failed, only shortly after it goes back to RUNNING
            // and we want to avoid showing the intermediate FROZEN state.
            setTimeout(clearCache, 1500);
          },
          () => {
            instanceLoading.setFinish(instance);
          },
        );
      })
      .catch((e) => {
        toastNotify.failure("冻结实例失败", e, instanceLink);
        instanceLoading.setFinish(instance);
      });
  };

  const isDisabled =
    isLoading ||
    !isInstanceRunning(instance) ||
    instanceLoading.getType(instance) === "Migrating";

  return (
    <ConfirmationButton
      appearance="base"
      loading={isLoading}
      confirmationModalProps={{
        title: "确认冻结",
        children: (
          <p>
            这将冻结实例{" "}
            {<ResourceLabel type={instance.type} value={instance.name} bold />}.
          </p>
        ),
        onConfirm: handleFreeze,
        cancelButtonLabel: "取消",
        confirmButtonLabel: canUpdateInstanceState(instance)
          ? "冻结"
          : "你没有冻结此实例的权限",
      }}
      className="has-icon is-dense"
      disabled={isDisabled || !canUpdateInstanceState(instance) || isLoading}
      shiftClickEnabled
    >
      <Icon name="pause" />
    </ConfirmationButton>
  );
};

export default FreezeInstanceBtn;
