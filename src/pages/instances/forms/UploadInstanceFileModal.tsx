import type { FC } from "react";
import { useEffect, useState } from "react";
import { Modal } from "@canonical/react-components";
import type { UploadState } from "types/storage";
import ProgressBar from "components/ProgressBar";
import { humanFileSize } from "util/helpers";
import UploadInstanceBackupFileForm from "./UploadInstanceBackupFileForm";
import UploadExternalFormatFileForm from "./UploadExternalFormatFileForm";
import NotificationRow from "components/NotificationRow";
import type { InstanceFileType } from "./InstanceFileTypeSelector";
interface Props {
  close: () => void;
  name?: string;
}

const UploadInstanceFileModal: FC<Props> = ({ close, name }) => {
  const [fileType, setFileType] = useState<InstanceFileType>("instance-backup");
  const [uploadState, setUploadState] = useState<UploadState | null>(null);

  useEffect(() => {
    const modalCloseBtn = document.querySelector<HTMLButtonElement>(
      ".upload-instance-modal .p-modal__close",
    );
    if (modalCloseBtn) {
      modalCloseBtn.textContent = "关闭";
      modalCloseBtn.setAttribute("aria-label", "关闭弹窗");
    }
  }, []);

  return (
    <Modal
      close={close}
      className="upload-instance-modal"
      title="上传实例文件"
      closeOnOutsideClick={false}
    >
      <NotificationRow className="u-no-padding u-no-margin" />
      {uploadState && (
        <>
          <ProgressBar percentage={Math.floor(uploadState.percentage)} />
          <p>
            已上传 {humanFileSize(uploadState.loaded)} /{" "}
            {humanFileSize(uploadState.total ?? 0)}
          </p>
        </>
      )}

      {fileType === "instance-backup" && (
        <UploadInstanceBackupFileForm
          close={close}
          uploadState={uploadState}
          setUploadState={setUploadState}
          fileType={fileType}
          setFileType={setFileType}
          defaultInstanceName={name}
        />
      )}

      {fileType === "external-format" && (
        <UploadExternalFormatFileForm
          close={close}
          uploadState={uploadState}
          setUploadState={setUploadState}
          fileType={fileType}
          setFileType={setFileType}
          defaultInstanceName={name}
        />
      )}
    </Modal>
  );
};

export default UploadInstanceFileModal;
