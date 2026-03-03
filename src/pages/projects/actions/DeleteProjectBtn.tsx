import type { FC, ReactNode } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { LxdProject } from "types/project";
import { deleteProject } from "api/projects";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { isProjectEmpty } from "util/projects";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import {
  ConfirmationButton,
  Icon,
  Tooltip,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import classnames from "classnames";
import { filterUsedByType } from "util/usedBy";
import type { ResourceType } from "util/resourceDetails";
import ResourceLabel from "components/ResourceLabel";
import { useProjectEntitlements } from "util/entitlements/projects";

interface Props {
  project: LxdProject;
}

const generateProjectUsedByTooltip = (project: LxdProject) => {
  const resourceLabelAndLink: Record<string, { label: string; link: string }> =
    {
      instance: {
        label: "实例",
        link: `/ui/project/${encodeURIComponent(project.name)}/instances`,
      },
      profile: {
        label: "配置文件",
        link: `/ui/project/${encodeURIComponent(project.name)}/profiles`,
      },
      image: {
        label: "镜像",
        link: `/ui/project/${encodeURIComponent(project.name)}/images`,
      },
      volume: {
        label: "自定义卷",
        link: `/ui/project/${encodeURIComponent(project.name)}/storage/volumes`,
      },
    };

  const resourceTypes = Object.keys(resourceLabelAndLink);
  const usedByItems: ReactNode[] = [];
  for (const resourceType of resourceTypes) {
    const usedBy = filterUsedByType(
      resourceType as ResourceType,
      project.used_by?.filter(
        // the default profile is not blocking project deletion and can't be removed itself
        (item) => !item.startsWith("/1.0/profiles/default"),
      ),
    );

    if (usedBy.length > 0) {
      const label = resourceLabelAndLink[resourceType].label;
      const link = resourceLabelAndLink[resourceType].link;
      usedByItems.push(
        <li
          key={resourceType}
          className="p-list__item is-dark u-no-margin--bottom"
        >
          {<Link to={link}>{label}</Link>} ({usedBy.length})
        </li>,
      );
    }
  }

  return (
    <>
      非空项目无法删除。
      <p className="u-no-margin--bottom">该项目被以下资源使用：</p>
      <ul className="p-list u-no-margin--bottom">{usedByItems}</ul>
    </>
  );
};

const DeleteProjectBtn: FC<Props> = ({ project }) => {
  const isSmallScreen = useIsScreenBelow();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { canDeleteProject } = useProjectEntitlements();

  const isDefaultProject = project.name === "default";
  const isEmpty = isProjectEmpty(project);
  const getHoverText = () => {
    if (!canDeleteProject(project)) {
      return "你没有删除此项目的权限";
    }
    if (isDefaultProject) {
      return "默认项目不可删除";
    }
    if (!isEmpty) {
      return "";
    }
    return "删除项目";
  };

  const handleDelete = () => {
    setLoading(true);
    deleteProject(project)
      .then(() => {
        navigate(`/ui/project/default/instances`);
        toastNotify.success(
          <>
            项目 <ResourceLabel bold type="project" value={project.name} />{" "}
            已删除。
          </>,
        );
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("删除项目失败", e);
      })
      .finally(() => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.projects],
        });
      });
  };

  return (
    <ConfirmationButton
      onHoverText={getHoverText()}
      className={classnames("u-no-margin--bottom", {
        "has-icon": !isSmallScreen,
      })}
      loading={isLoading}
      disabled={
        !canDeleteProject(project) || isDefaultProject || !isEmpty || isLoading
      }
      confirmationModalProps={{
        title: "确认删除",
        confirmButtonLabel: "删除",
        onConfirm: handleDelete,
        children: (
          <p>
            这将永久删除项目{" "}
            <ResourceLabel type="project" value={project.name} bold />.<br />
            此操作不可撤销，并可能导致数据丢失。
          </p>
        ),
      }}
      shiftClickEnabled
      showShiftClickHint
    >
      <Tooltip
        message={
          !isEmpty && !isDefaultProject
            ? generateProjectUsedByTooltip(project)
            : ""
        }
      >
        {!isSmallScreen && <Icon name="delete" />}
        <span>删除项目</span>
      </Tooltip>
    </ConfirmationButton>
  );
};

export default DeleteProjectBtn;
