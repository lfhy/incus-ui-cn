import type { FC } from "react";
import { useRef } from "react";
import {
  Button,
  ContextualMenu,
  Icon,
  SearchBox,
} from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import ProjectSelectorList from "pages/projects/ProjectSelectorList";
import { defaultFirst } from "util/helpers";
import { useProjects } from "context/useProjects";
import { useServerEntitlements } from "util/entitlements/server";
import { useI18n } from "i18n/context";

interface Props {
  activeProject: string;
}

const ProjectSelector: FC<Props> = ({ activeProject }): React.JSX.Element => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const { canCreateProjects } = useServerEntitlements();

  const { data: projects = [] } = useProjects();

  projects.sort(defaultFirst);

  let updateQuery = (_val: string) => {
    /**/
  };

  // called when the children of the ContextualMenu become visible
  const onChildMount = (childSetQuery: (val: string) => void) => {
    updateQuery = childSetQuery;
    setTimeout(() => searchRef.current?.focus(), 100);
  };

  return (
    <>
      <div className="project-select-label">{t("project")}</div>
      <ContextualMenu
        dropdownProps={{ "aria-label": t("project") }}
        toggleClassName="toggle is-dark"
        toggleLabel={activeProject}
        hasToggleIcon
        title={t("selectProject", { project: activeProject })}
        className="project-select is-dark"
      >
        <div className="list is-dark" key="my-div">
          {projects.length > 5 && (
            <SearchBox
              id="searchProjectSelector"
              key="searchProjectSelector"
              autoFocus={true}
              autocomplete="off"
              name="query"
              placeholder={t("search")}
              onChange={(val) => {
                updateQuery(val);
              }}
              ref={searchRef}
            />
          )}
          <Button
            onClick={() => {
              navigate("/ui/all-projects/instances");
            }}
            className="p-contextual-menu__link all-projects"
            hasIcon
          >
            <Icon name="folder" light />
            <span>{t("allProjects")}</span>
          </Button>
          <ProjectSelectorList projects={projects} onMount={onChildMount} />
          <hr className="is-dark" />
          <Button
            onClick={() => {
              navigate("/ui/projects/create");
            }}
            className="p-contextual-menu__link"
            hasIcon
            disabled={!canCreateProjects()}
            title={
              canCreateProjects()
                ? ""
                : t("noPermissionCreateProjects")
            }
          >
            <Icon name="plus" light />
            <span>{t("createProject")}</span>
          </Button>
        </div>
      </ContextualMenu>
    </>
  );
};

export default ProjectSelector;
