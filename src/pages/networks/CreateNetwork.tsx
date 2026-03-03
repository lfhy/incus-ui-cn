import type { FC } from "react";
import { useState } from "react";
import {
  ActionButton,
  Button,
  Row,
  useNotify,
  useToastNotification,
  Spinner,
} from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNavigate, useParams } from "react-router-dom";
import { checkDuplicateName } from "util/helpers";
import {
  createClusterNetwork,
  createNetwork,
  deleteNetwork,
  fetchNetwork,
} from "api/networks";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import NetworkForm, {
  isNetworkFormInvalid,
  toNetwork,
} from "pages/networks/forms/NetworkForm";
import NotificationRow from "components/NotificationRow";
import { useSettings } from "context/useSettings";
import { objectToYaml, yamlToObject } from "util/yaml";
import { isClusteredServer, supportsOvnNetwork } from "util/settings";
import BaseLayout from "components/BaseLayout";
import {
  GENERAL,
  YAML_CONFIGURATION,
} from "pages/networks/forms/NetworkFormMenu";
import { slugify } from "util/slugify";
import FormFooterLayout from "components/forms/FormFooterLayout";
import YamlSwitch from "components/forms/YamlSwitch";
import ResourceLink from "components/ResourceLink";
import { scrollToElement } from "util/scroll";
import { useClusterMembers } from "context/useClusterMembers";
import { bridgeType, ovnType } from "util/networks";
import { useAuth } from "context/auth";

const CreateNetwork: FC = () => {
  const { isFineGrained } = useAuth();
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { project } = useParams<{ project: string }>();
  const [section, setSection] = useState(slugify(GENERAL));
  const controllerState = useState<AbortController | null>(null);
  const { data: settings, isLoading } = useSettings();
  const isClustered = isClusteredServer(settings);
  const hasOvn = supportsOvnNetwork(settings);
  const { data: clusterMembers = [] } = useClusterMembers();

  if (!project) {
    return <>缺少项目参数</>;
  }

  if (isLoading) {
    return <Spinner className="u-loader" text="加载中..." isMainComponent />;
  }

  const NetworkSchema = Yup.object().shape({
    name: Yup.string()
      .test("deduplicate", "该名称的网络已存在", async (value) =>
        checkDuplicateName(value, project, controllerState, "networks"),
      )
      .required("网络名称为必填项"),
  });

  const formik = useFormik<NetworkFormValues>({
    initialValues: {
      readOnly: false,
      isCreating: true,
      name: "",
      networkType: hasOvn ? ovnType : bridgeType,
      entityType: "network",
      ipv4_address: "auto",
      ipv6_address: "auto",
      security_acls: [],
    },
    validationSchema: NetworkSchema,
    onSubmit: (values) => {
      const network = values.yaml
        ? yamlToObject(values.yaml)
        : toNetwork(values);

      const mutation =
        isClustered && values.networkType !== ovnType
          ? async () =>
              createClusterNetwork(
                network,
                project,
                clusterMembers,
                values.parentPerClusterMember,
                values.bridge_external_interfaces_per_member,
              )
          : async () => createNetwork(network, project);

      mutation()
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: [queryKeys.projects, project, queryKeys.networks],
          });
          navigate(`/ui/project/${encodeURIComponent(project)}/networks`);
          toastNotify.success(
            <>
              网络{" "}
              <ResourceLink
                type="network"
                value={values.name}
                to={`/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(values.name)}`}
              />{" "}
              已创建。
            </>,
          );
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("网络创建失败", e);

          // load the network that we just created
          fetchNetwork(values.name, project, isFineGrained)
            .then((network) => {
              // if the network was created in errored state, delete it
              if (network.status === "Errored") {
                deleteNetwork(values.name, project).catch(() => {
                  // deleting the errored network failed, forward to network list page and show the creation failure
                  navigate(
                    `/ui/project/${encodeURIComponent(project)}/networks`,
                  );
                  toastNotify.failure(
                    "创建网络时发生错误",
                    e,
                    <>
                      网络{" "}
                      <ResourceLink
                        type="network"
                        value={values.name}
                        to={`/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(values.name)}`}
                      />{" "}
                      创建成功但状态为错误。
                    </>,
                  );
                });
              }
            })
            .catch(() => {
              // network was not created, keep user on creation form so they can submit it again.
            });
          // todo: why the duplicate network fetch requests in the network tab?
        });
    },
  });

  const getYaml = () => {
    const payload = toNetwork(formik.values);
    return objectToYaml(payload);
  };

  const updateSection = (newSection: string, source: "scroll" | "click") => {
    setSection(slugify(newSection));
    if (source === "click") {
      scrollToElement(slugify(newSection));
    }
  };

  return (
    <BaseLayout title="创建网络" contentClassName="create-network">
      <Row>
        <NotificationRow />
        <NetworkForm
          key={formik.values.networkType}
          formik={formik}
          getYaml={getYaml}
          project={project}
          section={section}
          setSection={updateSection}
        />
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
                "click",
              );
            }}
            disableReason={
              formik.values.name ? undefined : "请先输入网络名称以启用该部分"
            }
          />
        </div>
        <Button
          appearance="base"
          onClick={async () =>
            navigate(`/ui/project/${encodeURIComponent(project)}/networks`)
          }
        >
          取消
        </Button>
        <ActionButton
          appearance="positive"
          loading={formik.isSubmitting}
          disabled={
            isNetworkFormInvalid(formik, clusterMembers) || formik.isSubmitting
          }
          onClick={() => void formik.submitForm()}
        >
          创建
        </ActionButton>
      </FormFooterLayout>
    </BaseLayout>
  );
};

export default CreateNetwork;
