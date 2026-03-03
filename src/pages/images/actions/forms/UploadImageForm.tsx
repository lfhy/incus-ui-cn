import type { ChangeEvent, FC } from "react";
import { useEffect, useState } from "react";
import { useEventQueue } from "context/eventQueue";
import { useFormik } from "formik";
import { createImageAlias, uploadImage } from "api/images";
import {
  ActionButton,
  Button,
  Form,
  Input,
  Modal,
  useToastNotification,
} from "@canonical/react-components";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { humanFileSize } from "util/helpers";
import ProgressBar from "components/ProgressBar";
import type { UploadState } from "types/storage";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { LxdSyncResponse } from "types/apiResponse";
import type { AxiosError } from "axios";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProject } from "context/useProjects";

interface Props {
  close: () => void;
  projectName: string;
}

const UploadImageForm: FC<Props> = ({ close, projectName }) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const queryClient = useQueryClient();
  const { canCreateImageAliases } = useProjectEntitlements();
  const { data: project } = useProject(projectName);

  useEffect(() => {
    const modalCloseBtn = document.querySelector<HTMLButtonElement>(
      ".upload-image-modal .p-modal__close",
    );
    if (modalCloseBtn) {
      modalCloseBtn.textContent = "关闭";
      modalCloseBtn.setAttribute("aria-label", "关闭弹窗");
    }
  }, []);

  const notifySuccess = () => {
    const uploaded = (
      <Link to={`/ui/project/${encodeURIComponent(projectName)}/images`}>
        已上传
      </Link>
    );
    toastNotify.success(<>镜像 {uploaded}。</>);
  };

  const changeFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      formik.setFieldValue("fileList", e.target.files);
    }
  };

  const getImageUploadBody = (fileList: FileList): File | FormData => {
    if (fileList.length === 1) {
      return fileList[0];
    } else {
      // Sorting by Size. The metadata file is very likely to be smaller than the image itself.
      const formData = new FormData();
      const sortedFiles = Array.from(fileList).sort((a, b) => a.size - b.size);

      formData.append("metadata", sortedFiles[0]);
      formData.append("rootfs.img", sortedFiles[1]);

      return formData;
    }
  };

  const clearCache = () => {
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === queryKeys.images,
    });
  };

  const formik = useFormik<{
    alias: string;
    isPublic: boolean;
    fileList: FileList | null;
  }>({
    initialValues: {
      alias: "",
      isPublic: false,
      fileList: null,
    },
    validationSchema: Yup.object().shape({
      alias: Yup.string(),
    }),
    onSubmit: (values) => {
      if (values.fileList) {
        if (values.fileList.length > 2) {
          close();
          toastNotify.failure(`镜像上传失败。`, new Error("选择的文件过多"));
          return;
        }
        uploadImage(
          getImageUploadBody(values.fileList),
          values.isPublic,
          setUploadState,
          projectName,
        )
          .then((operation) => {
            toastNotify.info(<>已开始从文件创建镜像。</>);

            eventQueue.set(
              operation.metadata.id,
              (event) => {
                const fingerprint = event.metadata.metadata?.fingerprint ?? "";
                if (values.alias) {
                  createImageAlias(fingerprint, values.alias, projectName)
                    .then(clearCache)
                    .catch((e) => {
                      toastNotify.failure(`镜像上传成功，但创建别名失败。`, e);
                    });
                }
                clearCache();
                notifySuccess();
              },
              (msg) => {
                toastNotify.failure(`镜像上传失败。`, new Error(msg));
              },
            );
          })
          .catch((e: AxiosError<LxdSyncResponse<null>>) => {
            const error = new Error(e.response?.data.error);
            toastNotify.failure("镜像上传失败", error);
          })
          .finally(() => {
            close();
          });
      } else {
        close();
        toastNotify.failure(`镜像上传失败`, new Error("缺少文件"));
      }
    },
  });

  return (
    <Modal
      close={close}
      title="从文件导入镜像"
      className="upload-image-modal"
      buttonRow={
        <>
          {uploadState && (
            <>
              <ProgressBar percentage={Math.floor(uploadState.percentage)} />
              <p>
                已上传 {humanFileSize(uploadState.loaded)} /{" "}
                {humanFileSize(uploadState.total ?? 0)}
              </p>
            </>
          )}
          <Button
            appearance="base"
            className="u-no-margin--bottom"
            type="button"
            onClick={close}
          >
            取消
          </Button>
          <ActionButton
            appearance="positive"
            className="u-no-margin--bottom"
            loading={formik.isSubmitting}
            disabled={
              !formik.isValid || formik.isSubmitting || !formik.values.fileList
            }
            onClick={() => void formik.submitForm()}
          >
            上传镜像
          </ActionButton>
        </>
      }
    >
      <Form
        className={uploadState ? "u-hide" : ""}
        onSubmit={formik.handleSubmit}
      >
        <Input
          type="file"
          name="fileList"
          label="镜像备份文件"
          onChange={changeFile}
          multiple
        />
        <Input
          {...formik.getFieldProps("alias")}
          type="text"
          label="别名"
          placeholder="请输入别名"
          error={formik.touched.alias ? formik.errors.alias : null}
          disabled={!canCreateImageAliases(project)}
          title={
            canCreateImageAliases(project) ? "" : "你没有创建镜像别名的权限"
          }
        />
        <Input
          {...formik.getFieldProps("isPublic")}
          type="checkbox"
          label="设为公开镜像"
          error={formik.touched.isPublic ? formik.errors.isPublic : null}
        />
        {/* hidden submit to enable enter key in inputs */}
        <Input
          type="submit"
          hidden
          value="Hidden input"
          disabled={!formik.isValid || !formik.values.fileList}
        />
      </Form>
    </Modal>
  );
};

export default UploadImageForm;
