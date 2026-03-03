import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProject } from "context/useProjects";

interface Props {
  projectName: string;
  defaultPool?: string;
  className?: string;
}

const CreateVolumeBtn: FC<Props> = ({
  projectName,
  className,
  defaultPool,
}) => {
  const navigate = useNavigate();
  const isSmallScreen = useIsScreenBelow();
  const { canCreateStorageVolumes } = useProjectEntitlements();
  const { data: project } = useProject(projectName);

  const handleAdd = () => {
    navigate(
      `/ui/project/${encodeURIComponent(projectName)}/storage/volumes/create${defaultPool ? `?pool=${encodeURIComponent(defaultPool)}` : ""}`,
    );
  };

  return (
    <Button
      appearance="positive"
      hasIcon={!isSmallScreen}
      onClick={handleAdd}
      className={className}
      disabled={!canCreateStorageVolumes(project)}
      title={
        canCreateStorageVolumes(project)
          ? "创建卷"
          : "你没有在此项目中创建卷的权限"
      }
    >
      {!isSmallScreen && <Icon name="plus" light />}
      <span>创建卷</span>
    </Button>
  );
};

export default CreateVolumeBtn;
