import type { FC, ReactNode } from "react";
import InstanceConfigureSnapshotModal from "./InstanceConfigureSnapshotModal";
import { Button, usePortal } from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import { useInstanceEntitlements } from "util/entitlements/instances";

interface Props {
  instance: LxdInstance;
  onSuccess: (message: ReactNode) => void;
  onFailure: (title: string, e: unknown, message?: ReactNode) => void;
  isDisabled?: boolean;
  className?: string;
}

const InstanceConfigureSnapshotsBtn: FC<Props> = ({
  instance,
  onSuccess,
  onFailure,
  isDisabled,
  className,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canEditInstance } = useInstanceEntitlements();

  return (
    <>
      {isOpen && (
        <Portal>
          <div className="snapshot-list">
            <InstanceConfigureSnapshotModal
              close={closePortal}
              instance={instance}
              onSuccess={onSuccess}
              onFailure={onFailure}
            />
          </div>
        </Portal>
      )}
      <Button
        onClick={openPortal}
        className={className}
        disabled={isDisabled || !canEditInstance(instance)}
        title={canEditInstance() ? "" : "你没有配置此实例的权限"}
      >
        查看配置
      </Button>
    </>
  );
};

export default InstanceConfigureSnapshotsBtn;
