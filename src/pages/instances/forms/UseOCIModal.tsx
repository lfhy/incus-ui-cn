import { useEffect } from "react";
import type { FC } from "react";
import {
  ActionButton,
  Button,
  Form,
  Input,
  Modal,
} from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import type { LxdImageType, RemoteImage } from "types/image";

interface Props {
  close: () => void;
  onSelect: (image: RemoteImage, type?: LxdImageType) => void;
}

const UseOCIModal: FC<Props> = ({ close, onSelect }) => {
  const formik = useFormik({
    initialValues: {
      registry: "",
      image: "",
    },
    validationSchema: Yup.object().shape({
      registry: Yup.string().required("镜像仓库为必填项"),
      image: Yup.string().required("镜像名称为必填项"),
    }),
    onSubmit: (values) => {
      onSelect(
        {
          arch: "",
          created_at: new Date().getTime(),
          os: "",
          release: "",
          aliases: values.image,
          server: values.registry,
          protocol: "oci",
        },
        "container",
      );
    },
  });

  const handleCloseModal = () => {
    close();
  };

  useEffect(() => {
    const modalCloseBtn = document.querySelector<HTMLButtonElement>(
      ".use-oci-modal .p-modal__close",
    );
    if (modalCloseBtn) {
      modalCloseBtn.textContent = "关闭";
      modalCloseBtn.setAttribute("aria-label", "关闭弹窗");
    }
  }, []);

  return (
    <Modal close={close} className="use-oci-modal" title="使用 OCI">
      <Form onSubmit={formik.handleSubmit}>
        <Input
          {...formik.getFieldProps("registry")}
          id="registry"
          type="text"
          label="仓库地址"
          placeholder="请输入仓库 URL"
          error={formik.touched.registry ? formik.errors.registry : null}
        />
        <Input
          {...formik.getFieldProps("image")}
          id="image"
          type="text"
          label="镜像名称"
          placeholder="请输入镜像名称"
          error={formik.touched.image ? formik.errors.image : null}
        />
      </Form>
      <footer className="p-modal__footer" id="modal-footer">
        <Button
          appearance="base"
          className="u-no-margin--bottom"
          type="button"
          onClick={handleCloseModal}
        >
          取消
        </Button>
        <ActionButton
          appearance="positive"
          className="u-no-margin--bottom"
          loading={formik.isSubmitting}
          disabled={!formik.isValid}
          onClick={() => void formik.submitForm()}
        >
          确认
        </ActionButton>
      </footer>
    </Modal>
  );
};

export default UseOCIModal;
