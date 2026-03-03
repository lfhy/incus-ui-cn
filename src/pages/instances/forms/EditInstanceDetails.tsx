import type { FC } from "react";
import { Col, Input, Row, Select } from "@canonical/react-components";
import ProfileSelector from "pages/profiles/ProfileSelector";
import type { FormikProps } from "formik/dist/types";
import type { EditInstanceFormValues } from "pages/instances/EditInstance";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import ScrollableForm from "components/ScrollableForm";
import { ensureEditMode } from "util/instanceEdit";
import SshKeyForm from "components/forms/SshKeyForm";
import { useIsClustered } from "context/useIsClustered";

export const instanceEditDetailPayload = (values: EditInstanceFormValues) => {
  return {
    name: values.name,
    description: values.description,
    type: values.instanceType,
    profiles: values.profiles,
  };
};

interface Props {
  formik: FormikProps<EditInstanceFormValues>;
  project: string;
}

const EditInstanceDetails: FC<Props> = ({ formik, project }) => {
  const isClustered = useIsClustered();

  return (
    <ScrollableForm>
      <Row>
        <Col size={12}>
          <Input
            id="name"
            name="name"
            type="text"
            label="名称"
            help="点击页头中的实例名称可重命名实例"
            placeholder="请输入名称"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.name}
            error={formik.touched.name ? formik.errors.name : null}
            disabled={true}
          />
          <AutoExpandingTextArea
            id="description"
            name="description"
            label="描述"
            placeholder="请输入描述"
            onBlur={formik.handleBlur}
            onChange={(e) => {
              ensureEditMode(formik);
              formik.handleChange(e);
            }}
            value={formik.values.description}
            disabled={!!formik.values.editRestriction}
            title={formik.values.editRestriction}
          />
        </Col>
      </Row>
      {isClustered && (
        <Row>
          <Col size={12}>
            <Select
              id="target"
              name="target"
              options={[
                {
                  label: formik.values.location,
                  value: formik.values.location,
                },
              ]}
              label="集群成员"
              value={formik.values.location}
              disabled={true}
              help="使用页头中的迁移按钮可将实例迁移到其他集群成员"
            />
          </Col>
        </Row>
      )}
      <ProfileSelector
        project={project}
        selected={formik.values.profiles}
        setSelected={(value) => {
          ensureEditMode(formik);
          formik.setFieldValue("profiles", value);
        }}
        disabledReason={formik.values.editRestriction}
        initialProfiles={formik.initialValues.profiles}
      />
      <SshKeyForm
        formik={formik}
        disabledReason={formik.values.editRestriction}
      />
    </ScrollableForm>
  );
};

export default EditInstanceDetails;
