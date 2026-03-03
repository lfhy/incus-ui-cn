import type { FC } from "react";
import {
  Icon,
  Notification,
  Row,
  Strip,
  Spinner,
  CustomLayout,
  useNotify,
} from "@canonical/react-components";
import InstanceOverview from "./InstanceOverview";
import InstanceTerminal from "./InstanceTerminal";
import { useNavigate, useParams } from "react-router-dom";
import InstanceSnapshots from "./InstanceSnapshots";
import InstanceConsole from "pages/instances/InstanceConsole";
import InstanceLogs from "pages/instances/InstanceLogs";
import EditInstance from "./EditInstance";
import InstanceDetailHeader from "pages/instances/InstanceDetailHeader";
import TabLinks from "components/TabLinks";
import { useSettings } from "context/useSettings";
import type { TabLink } from "@canonical/react-components/dist/components/Tabs/Tabs";
import { useInstance } from "context/useInstances";
import { buildGrafanaUrl } from "util/grafanaUrl";

const tabDefinitions = [
  { id: "overview", label: "概览", path: "" },
  { id: "configuration", label: "配置", path: "configuration" },
  { id: "snapshots", label: "快照", path: "snapshots" },
  { id: "terminal", label: "终端", path: "terminal" },
  { id: "console", label: "控制台", path: "console" },
  { id: "logs", label: "日志", path: "logs" },
];

const InstanceDetail: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { data: settings } = useSettings();

  const { name, project, activeTab } = useParams<{
    name: string;
    project: string;
    activeTab?: string;
  }>();

  if (!name) {
    return <>缺少实例名称</>;
  }
  if (!project) {
    return <>缺少项目名称</>;
  }

  const {
    data: instance,
    error,
    refetch: refreshInstance,
    isLoading,
  } = useInstance(name, project);

  const tabUrl = `/ui/project/${encodeURIComponent(project)}/instance/${encodeURIComponent(name)}`;
  const renderTabs: (string | TabLink)[] = tabDefinitions.map((tab) => {
    const href = tab.path ? `${tabUrl}/${tab.path}` : tabUrl;
    return {
      label: tab.label,
      id: tab.id,
      active: (activeTab ?? "overview") === tab.id,
      onClick: (e) => {
        e.preventDefault();
        notify.clear();
        navigate(href);
      },
      href,
    };
  });

  const grafanaUrl = buildGrafanaUrl(name, project, settings);
  if (grafanaUrl) {
    renderTabs.push({
      label: (
        <div>
          <Icon name="external-link" /> 指标
        </div>
      ) as unknown as string,
      href: grafanaUrl,
      target: "_blank",
      rel: "noopener noreferrer",
    });
  }

  return (
    <CustomLayout
      header={
        <InstanceDetailHeader
          name={name}
          instance={instance}
          project={project}
          isLoading={isLoading}
        />
      }
      contentClassName="detail-page"
    >
      {isLoading && (
        <Spinner className="u-loader" text="正在加载实例详情..." />
      )}
      {!isLoading && !instance && !error && <>加载实例失败</>}
      {error && (
        <Strip>
          <Notification severity="negative" title="错误">
            {error.message}
          </Notification>
        </Strip>
      )}
      {!isLoading && instance && (
        <Row>
          <TabLinks
            tabs={renderTabs}
            activeTab={activeTab}
            tabUrl={tabUrl}
          />

          {!activeTab && (
            <div role="tabpanel" aria-labelledby="overview">
              <InstanceOverview instance={instance} />
            </div>
          )}

          {activeTab === "configuration" && (
            <div role="tabpanel" aria-labelledby="configuration">
              <EditInstance instance={instance} />
            </div>
          )}

          {activeTab === "snapshots" && (
            <div role="tabpanel" aria-labelledby="snapshots">
              <InstanceSnapshots instance={instance} />
            </div>
          )}

          {activeTab === "terminal" && (
            <div role="tabpanel" aria-labelledby="terminal">
              <InstanceTerminal
                instance={instance}
                refreshInstance={refreshInstance}
              />
            </div>
          )}

          {activeTab === "console" && (
            <div role="tabpanel" aria-labelledby="console">
              <InstanceConsole instance={instance} />
            </div>
          )}

          {activeTab === "logs" && (
            <div role="tabpanel" aria-labelledby="logs">
              <InstanceLogs instance={instance} />
            </div>
          )}
        </Row>
      )}
    </CustomLayout>
  );
};

export default InstanceDetail;
