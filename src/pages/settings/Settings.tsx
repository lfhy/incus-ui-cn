import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  MainTable,
  Notification,
  Row,
  ScrollableTable,
  SearchBox,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import SettingForm from "./SettingForm";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import { queryKeys } from "util/queryKeys";
import { fetchConfigOptions } from "api/server";
import { useQuery } from "@tanstack/react-query";
import type { ConfigField } from "types/config";
import ConfigFieldDescription from "pages/settings/ConfigFieldDescription";
import { toConfigFields } from "util/config";
import PageHeader from "components/PageHeader";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useServerEntitlements } from "util/entitlements/server";
import type { ClusterSpecificValues } from "components/ClusterSpecificSelect";
import { useClusteredSettings } from "context/useSettings";
import type { LXDSettingOnClusterMember } from "types/server";
import { useProjects } from "context/useProjects";
import { getDefaultProject } from "util/loginProject";
import { translateSettingCategory } from "util/settingsI18n";

const Settings: FC = () => {
  const [query, setQuery] = useState("");
  const notify = useNotify();
  const {
    hasMetadataConfiguration,
    settings,
    isSettingsLoading,
    settingsError,
  } = useSupportedFeatures();
  const { canEditServerConfiguration } = useServerEntitlements();

  const { data: configOptions, isLoading: isConfigOptionsLoading } = useQuery({
    queryKey: [queryKeys.configOptions],
    queryFn: async () => fetchConfigOptions(hasMetadataConfiguration),
  });
  const { data: clusteredSettings = [], error: clusterError } =
    useClusteredSettings();

  const { data: projects = [] } = useProjects();

  useEffect(() => {
    const searchBtn = document.querySelector<HTMLButtonElement>(
      ".settings .p-search-box__button",
    );
    if (searchBtn?.textContent?.trim() === "Search") {
      searchBtn.textContent = "搜索";
      searchBtn.setAttribute("aria-label", "搜索");
    }
  }, [query]);

  if (clusterError) {
    notify.failure("Loading clustered settings failed", clusterError);
  }

  if (isConfigOptionsLoading || isSettingsLoading) {
    return <Spinner className="u-loader" text="加载中..." isMainComponent />;
  }

  if (settingsError) {
    notify.failure("加载设置失败", settingsError);
  }

  const getValue = (configField: ConfigField): string | undefined => {
    for (const [key, value] of Object.entries(settings?.config ?? {})) {
      if (key === configField.key) {
        return value;
      }
    }
    if (configField.type === "bool") {
      return configField.default === "true" ? "true" : "false";
    }
    if (configField.default === "-") {
      return undefined;
    }
    return configField.default;
  };

  const getClusteredValue = (
    clusteredSettings: LXDSettingOnClusterMember[],
    configField: ConfigField,
  ): ClusterSpecificValues => {
    const settingPerClusterMember: ClusterSpecificValues = {};

    clusteredSettings?.forEach((item) => {
      settingPerClusterMember[item.memberName] =
        item.config?.[configField.key] ?? configField.default ?? "";
    });

    return settingPerClusterMember;
  };

  const headers = [
    { content: "分组", className: "group" },
    { content: "键", className: "key" },
    { content: "值" },
  ];

  const configFields = toConfigFields(configOptions?.configs?.server ?? {});

  configFields.push({
    key: "user.ui_grafana_base_url",
    category: "user",
    default: "",
    longdesc:
      "e.g. https://example.org/dashboard?project={project}&name={instance}\n or https://192.0.2.1:3000/d/bGY-LSB7k/lxd?orgId=1",
    shortdesc:
      "LXD will replace `{instance}` and `{project}` with project and instance names for deep-linking to individual grafana pages.\nSee {ref}`grafana` for more information.",
    type: "string",
  });

  configFields.push({
    key: "user.ui.sso_only",
    category: "user",
    default: "false",
    shortdesc: "Whether to restrict login options to SSO/OIDC only.",
    type: "bool",
  });

  configFields.push({
    key: "user.ui_login_project",
    category: "user",
    default: getDefaultProject(projects),
    shortdesc: "Project to display on login.",
    type: "string",
  });

  configFields.push({
    key: "user.ui_theme",
    category: "user",
    default: "",
    shortdesc:
      "Set UI to dark theme, light theme, or to match the system theme.",
    type: "string",
  });

  configFields.push({
    key: "user.ui.title",
    category: "user",
    default: "",
    shortdesc: "Title for the LXD-UI web page. Shows the hostname when unset.",
    type: "string",
  });

  let lastCategory = "";
  const rows = configFields
    .filter((configField) => {
      if (!query) {
        return true;
      }
      return (
        configField.key.toLowerCase().includes(query.toLowerCase()) ||
        configField.shortdesc?.toLowerCase().includes(query.toLowerCase())
      );
    })
    .map((configField, index, { length }) => {
      const isDefault = !Object.keys(settings?.config ?? {}).some(
        (key) => key === configField.key,
      );
      const value = getValue(configField);

      const clusteredValue = getClusteredValue(clusteredSettings, configField);

      const isNewCategory = lastCategory !== configField.category;
      lastCategory = configField.category;

      return {
        key: configField.key,
        columns: [
          {
            content: isNewCategory && (
              <h2 className="p-heading--5">
                {translateSettingCategory(configField.category)}
              </h2>
            ),
            role: "rowheader",
            className: "group",
            "aria-label": "分组",
          },
          {
            content: (
              <div className="key-cell">
                {isDefault ? (
                  configField.key
                ) : (
                  <strong>{configField.key}</strong>
                )}
                <p className="p-text--small u-text--muted u-no-margin--bottom">
                  <ConfigFieldDescription description={configField.shortdesc} />
                </p>
              </div>
            ),
            role: "cell",
            className: "key",
            "aria-label": "键",
          },
          {
            content: (
              <SettingForm
                configField={configField}
                value={value}
                clusteredValue={clusteredValue}
                isLast={index === length - 1}
              />
            ),
            role: "cell",
            "aria-label": "值",
            className: "u-vertical-align-middle",
          },
        ],
      };
    });

  return (
    <>
      <CustomLayout
        header={
          <PageHeader>
            <PageHeader.Left>
              <PageHeader.Title>
                <HelpLink docPath="/server/" title="了解更多服务器配置">
                  设置
                </HelpLink>
              </PageHeader.Title>
              <PageHeader.Search>
                <SearchBox
                  name="search-setting"
                  type="text"
                  className="u-no-margin--bottom"
                  onChange={(value) => {
                    setQuery(value);
                  }}
                  placeholder="搜索"
                  value={query}
                  aria-label="搜索设置"
                />
              </PageHeader.Search>
            </PageHeader.Left>
          </PageHeader>
        }
        contentClassName="settings"
      >
        <NotificationRow />
        <Row>
          {!canEditServerConfiguration() && (
            <Notification severity="caution" title="权限受限" titleElement="h2">
              你没有查看或编辑服务器设置的权限
            </Notification>
          )}
          {!hasMetadataConfiguration && canEditServerConfiguration() && (
            <Notification
              severity="information"
              title="获取更多服务器设置"
              titleElement="h2"
            >
              升级到 LXD v5.19.0 或更高版本以访问更多服务器设置
            </Notification>
          )}
          {canEditServerConfiguration() && (
            <ScrollableTable
              dependencies={[notify.notification, rows]}
              tableId="settings-table"
              belowIds={["status-bar"]}
            >
              <MainTable
                id="settings-table"
                headers={headers}
                rows={rows}
                emptyStateMsg="暂无数据"
              />
            </ScrollableTable>
          )}
        </Row>
      </CustomLayout>
    </>
  );
};

export default Settings;
