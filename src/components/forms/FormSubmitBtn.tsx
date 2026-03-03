import type { FC } from "react";
import { ActionButton, useListener } from "@canonical/react-components";
import type { ConfigurationRowFormikProps } from "components/ConfigurationRow";
import { getFormChangeCount } from "util/formChangeCount";
import { unstable_usePrompt as usePrompt } from "react-router";

interface Props {
  formik: ConfigurationRowFormikProps;
  baseUrl: string;
  disabled: boolean;
  isYaml?: boolean;
}

const FormSubmitBtn: FC<Props> = ({
  formik,
  baseUrl,
  disabled,
  isYaml = false,
}) => {
  const changeCount = getFormChangeCount(formik);

  usePrompt({
    when: (data) => {
      return changeCount > 0 && !data.nextLocation.pathname.startsWith(baseUrl);
    },
    message: "你所做的更改尚未保存，确定要离开吗？",
  });

  const handleCloseTab = (e: BeforeUnloadEvent) => {
    if (changeCount > 0) {
      e.returnValue = "你所做的更改尚未保存。";
    }
  };
  useListener(window, handleCloseTab, "beforeunload");

  return (
    <ActionButton
      appearance="positive"
      loading={formik.isSubmitting}
      disabled={
        !formik.isValid || formik.isSubmitting || disabled || changeCount === 0
      }
      onClick={() => void formik.submitForm()}
    >
      {changeCount === 0 || isYaml ? "保存更改" : `保存 ${changeCount} 处更改`}
    </ActionButton>
  );
};

export default FormSubmitBtn;
