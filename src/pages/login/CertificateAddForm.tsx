import type { FC } from "react";
import { useState } from "react";
import { Button, Form, Textarea, useNotify } from "@canonical/react-components";
import { addCertificate } from "api/certificates";

const CertificateAddForm: FC = () => {
  const notify = useNotify();
  const [token, setToken] = useState("");

  const submitCertificateToken = () => {
    const sanitisedToken =
      token
        .trim()
        .split(/\r?\n|\r|\n/g)
        .at(-1) ?? "";

    addCertificate(sanitisedToken)
      .then(() => {
        location.reload();
      })
      .catch((e) => notify.failure("令牌使用失败", e));
  };

  return (
    <Form>
      <Textarea
        id="token"
        name="token"
        label="粘贴上一步生成的令牌"
        placeholder="在此粘贴令牌"
        rows={3}
        onChange={(e) => {
          setToken(e.target.value);
        }}
      />
      <Button
        appearance="positive"
        disabled={token.length < 1}
        type="button"
        onClick={submitCertificateToken}
      >
        导入
      </Button>
    </Form>
  );
};

export default CertificateAddForm;
