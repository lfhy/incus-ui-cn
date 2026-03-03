import type { FC } from "react";
import { useState } from "react";
import {
  ActionButton,
  Button,
  Row,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNavigate, useParams } from "react-router-dom";
import { checkDuplicateName } from "util/helpers";
import NotificationRow from "components/NotificationRow";
import { objectToYaml, yamlToObject } from "util/yaml";
import BaseLayout from "components/BaseLayout";
import {
  GENERAL,
  YAML_CONFIGURATION,
} from "pages/networks/forms/NetworkFormMenu";
import { slugify } from "util/slugify";
import FormFooterLayout from "components/forms/FormFooterLayout";
import YamlSwitch from "components/forms/YamlSwitch";
import ResourceLink from "components/ResourceLink";
import type { NetworkAclFormValues } from "pages/networks/forms/NetworkAclForm";
import NetworkAclForm, {
  toNetworkAcl,
} from "pages/networks/forms/NetworkAclForm";
import { createNetworkAcl } from "api/network-acls";
import type { LxdNetworkAcl } from "types/network";

const CreateNetworkAcl: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { project } = useParams<{ project: string }>();
  const [section, setSection] = useState(slugify(GENERAL));
  const controllerState = useState<AbortController | null>(null);

  if (!project) {
    return <>缺少项目参数</>;
  }

  const NetworkAclSchema = Yup.object().shape({
    name: Yup.string()
      .test("deduplicate", "该名称的 ACL 已存在", async (value) =>
        checkDuplicateName(value, project, controllerState, "network-acls"),
      )
      .required("ACL 名称为必填项"),
  });

  const formik = useFormik<NetworkAclFormValues>({
    initialValues: {
      readOnly: false,
      isCreating: true,
      name: "",
      egress: [],
      ingress: [],
      entityType: "network-acl",
    },
    validationSchema: NetworkAclSchema,
    onSubmit: (values) => {
      const networkAcl = values.yaml
        ? (yamlToObject(values.yaml) as LxdNetworkAcl)
        : toNetworkAcl(formik.values);

      createNetworkAcl(networkAcl, project)
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: [queryKeys.projects, project, queryKeys.networkAcls],
          });
          navigate(`/ui/project/${encodeURIComponent(project)}/network-acls`);
          toastNotify.success(
            <>
              网络 ACL{" "}
              <ResourceLink
                type="network-acl"
                value={values.name}
                to={`/ui/project/${encodeURIComponent(project)}/network-acl/${encodeURIComponent(values.name)}`}
              />{" "}
              已创建。
            </>,
          );
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("网络 ACL 创建失败", e);
        });
    },
  });

  const updateSection = (newSection: string) => {
    setSection(slugify(newSection));
  };

  const getYaml = () => {
    const payload = {
      name: formik.values.name,
      description: formik.values.description,
      ingress: formik.values.ingress,
      egress: formik.values.egress,
    };
    return objectToYaml(payload);
  };

  return (
    <BaseLayout title="创建网络 ACL" contentClassName="create-network-acl">
      <Row>
        <NotificationRow />
        <NetworkAclForm formik={formik} getYaml={getYaml} section={section} />
      </Row>
      <FormFooterLayout>
        <div className="yaml-switch">
          <YamlSwitch
            formik={formik}
            section={section}
            setSection={() => {
              updateSection(
                section === slugify(YAML_CONFIGURATION)
                  ? GENERAL
                  : YAML_CONFIGURATION,
              );
            }}
            disableReason={
              formik.values.name
                ? undefined
                : "请先输入网络 ACL 名称以启用该部分"
            }
          />
        </div>
        <Button
          appearance="base"
          onClick={async () =>
            navigate(`/ui/project/${encodeURIComponent(project)}/network-acls`)
          }
        >
          取消
        </Button>
        <ActionButton
          appearance="positive"
          loading={formik.isSubmitting}
          disabled={formik.values.name.length === 0 || formik.isSubmitting}
          onClick={() => void formik.submitForm()}
        >
          创建
        </ActionButton>
      </FormFooterLayout>
    </BaseLayout>
  );
};

export default CreateNetworkAcl;
