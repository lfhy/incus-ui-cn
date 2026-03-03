import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useServerEntitlements } from "util/entitlements/server";

interface Props {
  project: string;
  className?: string;
}

const CreateStoragePoolBtn: FC<Props> = ({ project, className }) => {
  const navigate = useNavigate();
  const isSmallScreen = useIsScreenBelow();
  const { canCreateStoragePools } = useServerEntitlements();

  return (
    <Button
      appearance="positive"
      className={className}
      hasIcon={!isSmallScreen}
      title={canCreateStoragePools() ? "" : "你没有创建存储池的权限"}
      onClick={async () =>
        navigate(
          `/ui/project/${encodeURIComponent(project)}/storage/pools/create`,
        )
      }
      disabled={!canCreateStoragePools()}
    >
      {!isSmallScreen && <Icon name="plus" light />}
      <span>创建存储池</span>
    </Button>
  );
};

export default CreateStoragePoolBtn;
