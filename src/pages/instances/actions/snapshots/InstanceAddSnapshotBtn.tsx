import type { FC, ReactNode } from "react";
import { Button, Tooltip, usePortal } from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import CreateInstanceSnapshotForm from "pages/instances/forms/CreateInstanceSnapshotForm";
import { useInstanceEntitlements } from "util/entitlements/instances";

interface Props {
  instance: LxdInstance;
  onSuccess: (message: ReactNode) => void;
  onFailure: (title: string, e: unknown, message?: ReactNode) => void;
  className?: string;
  isDisabled?: boolean;
}

const InstanceAddSnapshotBtn: FC<Props> = ({
  instance,
  onSuccess,
  isDisabled,
  className,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canManageInstanceSnapshots } = useInstanceEntitlements();

  return (
    <>
      {isOpen && (
        <Portal>
          <CreateInstanceSnapshotForm
            close={closePortal}
            instance={instance}
            onSuccess={onSuccess}
          />
        </Portal>
      )}
      <Button
        appearance="positive"
        className={className}
        onClick={openPortal}
        disabled={isDisabled || !canManageInstanceSnapshots(instance)}
        title={
          canManageInstanceSnapshots(instance)
            ? ""
            : "你没有为此实例创建快照的权限"
        }
      >
        {isDisabled ? (
          <Tooltip message={`项目 ${instance.project} 中的实例已禁用快照创建`}>
            创建快照
          </Tooltip>
        ) : (
          "创建快照"
        )}
      </Button>
    </>
  );
};

export default InstanceAddSnapshotBtn;
