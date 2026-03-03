import { Icon } from "@canonical/react-components";
import { useAuth } from "context/auth";
import type { FC } from "react";
import { Link } from "react-router-dom";
import type { LxdProject } from "types/project";

interface Props {
  project?: LxdProject;
}

const SnapshotDisabledWarningLink: FC<Props> = ({ project }) => {
  const { isRestricted } = useAuth();

  return isRestricted ? (
    <>请联系项目管理员修改此设置。</>
  ) : (
    <>
      你可以在{" "}
      <Link
        to={`/ui/project/${encodeURIComponent(project?.name ?? "")}/configuration`}
      >
        项目配置
        <Icon className="external-link-icon" name="external-link" />
      </Link>
      中修改此设置
    </>
  );
};

export default SnapshotDisabledWarningLink;
