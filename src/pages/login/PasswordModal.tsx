import type { FC } from "react";
import {
  ActionButton,
  Button,
  Input,
  Modal,
} from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";

interface Props {
  onConfirm: (password: string) => void;
  onClose: () => void;
}

const PasswordModal: FC<Props> = ({ onConfirm, onClose }) => {
  const PasswordSchema = Yup.object().shape({
    password: Yup.string(),
    passwordConfirm: Yup.string().oneOf(
      [Yup.ref("password"), ""],
      "两次输入的密码必须一致",
    ),
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      passwordConfirm: "",
    },
    validationSchema: PasswordSchema,
    onSubmit: (values) => {
      onConfirm(values.password);
    },
  });

  const handleSkip = () => {
    onConfirm("");
  };

  return (
    <Modal
      close={onClose}
      title="设置密码"
      buttonRow={
        <>
          <Button className="u-no-margin--bottom" onClick={handleSkip}>
            跳过
          </Button>
          <ActionButton
            appearance="positive"
            className="u-no-margin--bottom"
            onClick={() => void formik.submitForm()}
            disabled={
              formik.values.password !== formik.values.passwordConfirm ||
              formik.values.password.length === 0
            }
          >
            生成证书
          </ActionButton>
        </>
      }
    >
      <p>为证书设置密码以增强安全性。</p>
      <Input
        id="password"
        type="password"
        label="密码"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        value={formik.values.password}
        error={formik.touched.password ? formik.errors.password : null}
        help="macOS 不允许空密码。其他系统可跳过此步骤。"
      />
      <Input
        id="passwordConfirm"
        type="password"
        label="确认密码"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        value={formik.values.passwordConfirm}
        error={
          formik.touched.passwordConfirm ? formik.errors.passwordConfirm : null
        }
      />
    </Modal>
  );
};

export default PasswordModal;
