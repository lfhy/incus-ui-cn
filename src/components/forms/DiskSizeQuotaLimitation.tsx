import type { FC } from "react";
import { Icon } from "@canonical/react-components";
import { btrfsDriver, dirDriver } from "util/storageOptions";
import DocLink from "components/DocLink";

interface Props {
  driver?: string;
}

const DiskSizeQuotaLimitation: FC<Props> = ({ driver }) => {
  const getMessage = () => {
    if (driver === dirDriver) {
      return (
        <>
          大小限制可能不会生效。请参阅{" "}
          <DocLink docPath="/reference/storage_dir/#quotas">
            directory 驱动配额
          </DocLink>
          .
        </>
      );
    }
    if (driver === btrfsDriver) {
      return (
        <>
          大小限制可能不会生效。请参阅{" "}
          <DocLink docPath="/reference/storage_btrfs/#quotas">
            btrfs 驱动配额
          </DocLink>
          .
        </>
      );
    }
    return null;
  };

  const message = getMessage();
  if (!message) {
    return null;
  }

  return (
    <>
      <Icon name="warning" style={{ marginRight: "0.5rem" }} />
      {message} 如需完整配额支持，请使用其他驱动类型的存储池。
      <br />
      <br />
    </>
  );
};

export default DiskSizeQuotaLimitation;
