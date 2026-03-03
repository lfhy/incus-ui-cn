import type { FC } from "react";
import { Button, usePortal } from "@canonical/react-components";
import UploadInstanceFileModal from "../forms/UploadInstanceFileModal";

interface Props {
  name?: string;
}

const UploadInstanceFileBtn: FC<Props> = ({ name }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  return (
    <>
      <Button onClick={openPortal} type="button">
        <span>上传实例文件</span>
      </Button>
      {isOpen && (
        <Portal>
          <UploadInstanceFileModal close={closePortal} name={name} />
        </Portal>
      )}
    </>
  );
};

export default UploadInstanceFileBtn;
