import type { FC } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { RenameHeaderValues } from "components/RenameHeader";
import RenameHeader from "components/RenameHeader";
import type { LxdProject } from "types/project";
import { renameProject } from "api/projects";
import * as Yup from "yup";
import { useFormik } from "formik";
import { checkDuplicateName } from "util/helpers";
import DeleteProjectBtn from "./actions/DeleteProjectBtn";
import HelpLink from "components/HelpLink";
import { useEventQueue } from "context/eventQueue";
import ResourceLink from "components/ResourceLink";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useToastNotification } from "@canonical/react-components";

interface Props {
  project: LxdProject;
}

const ProjectConfigurationHeader: FC<Props> = ({ project }) => {
  const eventQueue = useEventQueue();
  const navigate = useNavigate();
  const toastNotify = useToastNotification();
  const controllerState = useState<AbortController | null>(null);
  const { canEditProject } = useProjectEntitlements();

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "已存在同名项目",
        async (value) =>
          project.name === value ||
          checkDuplicateName(value, "", controllerState, "projects"),
      )
      .required("项目名称为必填项"),
  });

  const formik = useFormik<RenameHeaderValues>({
    initialValues: {
      name: project.name,
      isRenaming: false,
    },
    validationSchema: RenameSchema,
    onSubmit: (values) => {
      if (project.name === values.name) {
        formik.setFieldValue("isRenaming", false);
        formik.setSubmitting(false);
        return;
      }
      const oldProjectLink = (
        <ResourceLink
          type="project"
          value={values.name}
          to={`/ui/project/${encodeURIComponent(project.name)}/configuration`}
        />
      );
      renameProject(project.name, values.name)
        .then((operation) => {
          eventQueue.set(
            operation.metadata.id,
            () => {
              const url = `/ui/project/${encodeURIComponent(values.name)}/configuration`;
              navigate(url);
              toastNotify.success(
                <>
                  项目 <strong>{project.name}</strong> 已重命名为{" "}
                  <ResourceLink type="project" value={values.name} to={url} />.
                </>,
              );
              formik.setFieldValue("isRenaming", false);
            },
            (msg) =>
              toastNotify.failure(
                `重命名项目 ${project.name} 失败`,
                new Error(msg),
                oldProjectLink,
              ),
            () => {
              formik.setSubmitting(false);
            },
          );
        })
        .catch((e) => {
          formik.setSubmitting(false);
          toastNotify.failure(
            `重命名项目 ${project.name} 失败`,
            e,
            oldProjectLink,
          );
        });
    },
  });

  const getRenameDisabledReason = () => {
    if (!canEditProject(project)) {
      return "你没有重命名此项目的权限";
    }

    if (project.name === "default") {
      return "默认项目不可重命名";
    }

    return undefined;
  };

  return (
    <RenameHeader
      name={project.name}
      parentItems={[
        <HelpLink
          key="project-configuration"
          docPath="/reference/projects/"
          title="了解更多项目配置"
        >
          项目配置
        </HelpLink>,
      ]}
      renameDisabledReason={getRenameDisabledReason()}
      controls={<DeleteProjectBtn project={project} />}
      isLoaded={Boolean(project)}
      formik={formik}
    />
  );
};

export default ProjectConfigurationHeader;
