import type { FC } from "react";
import { MainTable, Spinner } from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import ResourceLink from "components/ResourceLink";
import { useProfiles } from "context/useProfiles";

interface Props {
  instance: LxdInstance;
  onFailure: (title: string, e: unknown) => void;
}

const InstanceOverviewProfiles: FC<Props> = ({ instance, onFailure }) => {
  const {
    data: profiles = [],
    error,
    isLoading,
  } = useProfiles(instance.project);

  if (error) {
    onFailure("加载配置文件失败", error);
  }

  const profileHeaders = [
    { content: "名称", sortKey: "name", className: "u-text--muted" },
    {
      content: "描述",
      sortKey: "description",
      className: "u-text--muted",
    },
  ];

  const profileRows = instance.profiles.map((profileName) => {
    const profile = profiles.find((item) => item.name === profileName);
    const rawDescription = profile?.description ?? "";
    const description =
      rawDescription === "Default Incus profile"
        ? "默认 Incus 配置文件"
        : rawDescription;
    return {
      key: profileName,
      columns: [
        {
          content: (
            <ResourceLink
              type="profile"
              value={profileName}
              to={
                profile
                  ? `/ui/project/${encodeURIComponent(instance.project)}/profile/${encodeURIComponent(profileName)}`
                  : ""
              }
            />
          ),
          role: "rowheader",
          "aria-label": "名称",
        },
        {
          content: description,
          role: "cell",
          title: `描述 ${description}`,
          "aria-label": "描述",
        },
      ],
      sortData: {
        name: profileName.toLowerCase(),
        description: description.toLowerCase(),
      },
    };
  });

  if (isLoading) {
    return <Spinner className="u-loader" text="正在加载配置文件..." />;
  }

  return <MainTable headers={profileHeaders} rows={profileRows} sortable />;
};

export default InstanceOverviewProfiles;
