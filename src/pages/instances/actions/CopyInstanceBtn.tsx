import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import { Button, Icon, usePortal } from "@canonical/react-components";
import CopyInstanceForm from "../forms/CopyInstanceForm";
import classNames from "classnames";
import { useProject, useProjects } from "context/useProjects";
import { useProjectEntitlements } from "util/entitlements/projects";

interface Props {
  instance: LxdInstance;
  isLoading: boolean;
  classname?: string;
  onClose?: () => void;
}

const CopyInstanceBtn: FC<Props> = ({
  instance,
  isLoading,
  classname,
  onClose,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { data: currentProject } = useProject(instance.project);
  const { data: allProjects } = useProjects();
  const { canCreateInstances } = useProjectEntitlements();

  const handleClose = () => {
    closePortal();
    onClose?.();
  };

  const getDisableReason = () => {
    const validTargetProjects = allProjects?.filter(canCreateInstances);
    // when copying an instance, the user must always have permission to create instances in the source project
    // LXD internally creates a new instance in the source project and then copies it to the target project
    if (!canCreateInstances(currentProject) || !validTargetProjects?.length) {
      return "你没有复制实例的权限";
    }

    if (isLoading) {
      return "加载中...";
    }

    return "";
  };

  return (
    <>
      {isOpen && (
        <Portal>
          <CopyInstanceForm close={handleClose} instance={instance} />
        </Portal>
      )}
      <Button
        appearance="default"
        aria-label="复制实例"
        className={classNames("u-no-margin--bottom has-icon", classname)}
        disabled={Boolean(getDisableReason())}
        onClick={openPortal}
        title={getDisableReason() || "复制实例"}
      >
        <Icon name="canvas" />
        <span>复制</span>
      </Button>
    </>
  );
};

export default CopyInstanceBtn;
