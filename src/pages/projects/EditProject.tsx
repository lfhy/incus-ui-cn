import type { FC } from "react";
import { useEffect } from "react";
import {
  Button,
  Spinner,
  useListener,
  useNotify,
  useToastNotification,
  CustomLayout,
} from "@canonical/react-components";
import { updateProject } from "api/projects";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { PROJECT_DETAILS } from "pages/projects/forms/ProjectFormMenu";
import { useFormik } from "formik";
import type { ProjectFormValues } from "pages/projects/CreateProject";
import * as Yup from "yup";
import type { LxdProject } from "types/project";
import { updateMaxHeight } from "util/updateMaxHeight";
import { getProjectEditValues, getProjectPayload } from "util/projectEdit";
import type { FormikProps } from "formik/dist/types";
import ProjectForm from "pages/projects/forms/ProjectForm";
import ProjectConfigurationHeader from "pages/projects/ProjectConfigurationHeader";
import { useAuth } from "context/auth";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useNavigate, useParams } from "react-router-dom";
import { slugify } from "util/slugify";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import FormSubmitBtn from "components/forms/FormSubmitBtn";
import ResourceLink from "components/ResourceLink";
import { useProfile } from "context/useProfiles";
import { useProjectEntitlements } from "util/entitlements/projects";

interface Props {
  project: LxdProject;
}

const EditProject: FC<Props> = ({ project }) => {
  const navigate = useNavigate();
  const { isRestricted } = useAuth();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { section } = useParams<{ section?: string }>();
  const { hasProjectsNetworksZones, hasStorageBuckets } =
    useSupportedFeatures();
  const { canEditProject } = useProjectEntitlements();

  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useProfile("default", project.name);
  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message, section]);
  useListener(window, updateFormHeight, "resize", true);
  useEffect(() => {
    if (profileError) {
      notify.failure("加载默认配置文件失败", profileError);
    }
  }, [profileError]);

  const ProjectSchema = Yup.object().shape({
    name: Yup.string().required(),
  });

  const editRestriction = canEditProject(project)
    ? undefined
    : "你没有编辑此项目的权限";
  const initialValues = getProjectEditValues(project, profile, editRestriction);

  const formik: FormikProps<ProjectFormValues> = useFormik({
    initialValues: initialValues,
    validationSchema: ProjectSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (!hasProjectsNetworksZones) {
        values.features_networks_zones = undefined;
      }

      if (!hasStorageBuckets) {
        values.features_storage_buckets = undefined;
      }

      const projectPayload = getProjectPayload(project, values) as LxdProject;

      projectPayload.etag = project.etag;

      updateProject(projectPayload)
        .then(() => {
          toastNotify.success(
            <>
              项目{" "}
              <ResourceLink
                type="project"
                value={project.name}
                to={`/ui/project/${encodeURIComponent(project.name)}/instances`}
              />{" "}
              已更新。
            </>,
          );
          formik.setFieldValue("readOnly", true);
        })
        .catch((e: Error) => {
          notify.failure("项目更新失败", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
          queryClient.invalidateQueries({
            queryKey: [queryKeys.projects],
          });
        });
    },
  });

  const baseUrl = `/ui/project/${encodeURIComponent(project.name)}/configuration`;

  const setSection = (newSection: string) => {
    if (newSection === PROJECT_DETAILS) {
      navigate(baseUrl);
    } else {
      navigate(`${baseUrl}/${slugify(newSection)}`);
    }
  };

  if (isProfileLoading) {
    return <Spinner className="u-loader" text="加载中..." isMainComponent />;
  }

  return (
    <CustomLayout
      header={<ProjectConfigurationHeader project={project} />}
      contentClassName="edit-project"
    >
      <ProjectForm
        formik={formik}
        project={project}
        section={section ?? slugify(PROJECT_DETAILS)}
        updateSection={setSection}
        isEdit={true}
      />
      {!isRestricted && (
        <FormFooterLayout>
          {formik.values.readOnly ? null : (
            <>
              <Button
                appearance="base"
                onClick={async () => formik.setValues(initialValues)}
              >
                取消
              </Button>
              <FormSubmitBtn
                formik={formik}
                baseUrl={baseUrl}
                disabled={!formik.values.name}
              />
            </>
          )}
        </FormFooterLayout>
      )}
    </CustomLayout>
  );
};

export default EditProject;
