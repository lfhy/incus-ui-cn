import type { FC } from "react";
import MenuItem from "components/forms/FormMenuItem";
import { Button } from "@canonical/react-components";

export const PROJECT_DETAILS = "项目详情";
export const RESOURCE_LIMITS = "资源限制";
export const CLUSTERS = "集群";
export const INSTANCES = "实例";
export const DEVICE_USAGE = "设备使用";
export const NETWORKS = "网络";

interface Props {
  isRestrictionsOpen: boolean;
  toggleRestrictionsOpen: () => void;
  isRestrictionsDisabled: boolean;
  active: string;
  setActive: (val: string) => void;
}

const ProjectFormMenu: FC<Props> = ({
  isRestrictionsOpen,
  toggleRestrictionsOpen,
  isRestrictionsDisabled,
  active,
  setActive,
}) => {
  const menuItemProps = {
    active,
    setActive,
  };

  return (
    <div className="p-side-navigation--accordion form-navigation">
      <nav aria-label="项目表单导航">
        <ul className="p-side-navigation__list">
          <MenuItem label={PROJECT_DETAILS} {...menuItemProps} />
          <MenuItem label={RESOURCE_LIMITS} {...menuItemProps} />
          <li className="p-side-navigation__item">
            <Button
              type="button"
              className="p-side-navigation__accordion-button"
              aria-expanded={isRestrictionsOpen ? "true" : "false"}
              onClick={toggleRestrictionsOpen}
              disabled={isRestrictionsDisabled}
            >
              限制
            </Button>
            <ul
              className="p-side-navigation__list"
              aria-expanded={isRestrictionsOpen ? "true" : "false"}
            >
              <MenuItem label={CLUSTERS} {...menuItemProps} />
              <MenuItem label={INSTANCES} {...menuItemProps} />
              <MenuItem label={DEVICE_USAGE} {...menuItemProps} />
              <MenuItem label={NETWORKS} {...menuItemProps} />
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ProjectFormMenu;
