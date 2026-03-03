import type { FC } from "react";
import {
  Button,
  Icon,
  Modal,
  useToastNotification,
  usePortal,
} from "@canonical/react-components";
import UploadCustomIso from "pages/storage/UploadCustomIso";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import ResourceLink from "components/ResourceLink";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProject } from "context/useProjects";

interface Props {
  className?: string;
  projectName: string;
}

const UploadCustomIsoBtn: FC<Props> = ({ className, projectName }) => {
  const toastNotify = useToastNotification();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const queryClient = useQueryClient();
  const isSmallScreen = useIsScreenBelow();
  const { data: project } = useProject(projectName);
  const { canCreateStorageVolumes } = useProjectEntitlements();

  const handleCancel = () => {
    closePortal();
  };

  const handleFinish = (name: string) => {
    toastNotify.success(
      <>
        自定义 ISO{" "}
        <ResourceLink
          to={`/ui/project/${encodeURIComponent(projectName)}/storage/custom-isos`}
          type="iso-volume"
          value={name}
        />{" "}
        上传成功。
      </>,
    );
    queryClient.invalidateQueries({ queryKey: [queryKeys.isoVolumes] });
    closePortal();
  };

  return (
    <>
      <Button
        appearance="positive"
        onClick={openPortal}
        className={className}
        hasIcon={!isSmallScreen}
        disabled={!canCreateStorageVolumes(project)}
        title={
          canCreateStorageVolumes(project)
            ? "上传自定义 ISO"
            : "你没有在此项目中创建自定义 ISO 的权限。"
        }
      >
        {!isSmallScreen && <Icon name="upload" light />}
        <span>上传自定义 ISO</span>
      </Button>
      {isOpen && (
        <Portal>
          <Modal close={closePortal} title="上传自定义 ISO">
            <UploadCustomIso onCancel={handleCancel} onFinish={handleFinish} />
          </Modal>
        </Portal>
      )}
    </>
  );
};

export default UploadCustomIsoBtn;
