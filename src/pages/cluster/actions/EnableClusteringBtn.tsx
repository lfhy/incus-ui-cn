import type { FC } from "react";
import { Button, Icon, usePortal } from "@canonical/react-components";
import EnableClusteringModal from "pages/cluster/EnableClusteringModal";
import { useServerEntitlements } from "util/entitlements/server";

const EnableClusteringBtn: FC = () => {
  const { canEditServerConfiguration } = useServerEntitlements();
  const { openPortal, closePortal, isOpen, Portal } = usePortal({
    programmaticallyOpen: true,
  });

  const canEdit = canEditServerConfiguration();
  const title = canEdit ? "启用集群" : "你没有编辑服务器配置的权限";

  return (
    <>
      <Button
        appearance="positive"
        hasIcon
        onClick={openPortal}
        disabled={!canEdit}
        title={title}
      >
        <Icon name="plus" light />
        <span>启用集群</span>
      </Button>
      {isOpen && (
        <Portal>
          <EnableClusteringModal onClose={closePortal} />
        </Portal>
      )}
    </>
  );
};

export default EnableClusteringBtn;
