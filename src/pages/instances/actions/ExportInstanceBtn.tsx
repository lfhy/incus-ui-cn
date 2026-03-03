import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import { Button, Icon, usePortal } from "@canonical/react-components";
import classNames from "classnames";
import { useInstanceEntitlements } from "util/entitlements/instances";
import ExportInstanceModal from "pages/instances/forms/ExportInstanceModal";
import { useCurrentProject } from "context/useCurrentProject";
import { isBackupDisabled } from "util/snapshots";

interface Props {
  instance: LxdInstance;
  classname?: string;
  onClose?: () => void;
}

const ExportInstanceBtn: FC<Props> = ({ instance, classname, onClose }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canManageInstanceBackups } = useInstanceEntitlements();
  const { project } = useCurrentProject();
  const backupDisabled = isBackupDisabled(project);

  const handleClose = () => {
    closePortal();
    onClose?.();
  };

  const getTitle = () => {
    if (!canManageInstanceBackups(instance)) {
      return "你没有导出此实例的权限。";
    }

    if (backupDisabled) {
      return `项目 "${project?.name}" 不允许创建备份。`;
    }

    return "导出实例";
  };

  return (
    <>
      {isOpen && (
        <Portal>
          <ExportInstanceModal close={handleClose} instance={instance} />
        </Portal>
      )}
      <Button
        appearance="default"
        className={classNames("u-no-margin--bottom has-icon", classname)}
        onClick={openPortal}
        title={getTitle()}
        disabled={!canManageInstanceBackups(instance) || backupDisabled}
      >
        <Icon name="export" />
        <span>导出</span>
      </Button>
    </>
  );
};

export default ExportInstanceBtn;
