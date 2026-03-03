import type { FC } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import EditNetwork from "pages/networks/EditNetwork";
import NetworkDetailHeader from "pages/networks/NetworkDetailHeader";
import {
  Row,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import TabLinks from "components/TabLinks";
import type { TabLink } from "@canonical/react-components/dist/components/Tabs/Tabs";
import NetworkForwards from "pages/networks/NetworkForwards";
import NetworkLoadBalancers from "pages/networks/NetworkLoadBalancers";
import { useNetwork } from "context/useNetworks";
import NetworkLeases from "pages/networks/NetworkLeases";
import { ovnType, typesWithForwards } from "util/networks";

const NetworkDetail: FC = () => {
  const notify = useNotify();

  const { name, project, member, activeTab } = useParams<{
    name: string;
    project: string;
    member: string;
    activeTab?: string;
  }>();

  if (!name) {
    return <>缺少名称参数</>;
  }

  if (!project) {
    return <>缺少项目参数</>;
  }

  const { data: network, error, isLoading } = useNetwork(name, project, member);

  useEffect(() => {
    if (error) {
      notify.failure("加载网络失败", error);
    }
  }, [error]);

  if (isLoading) {
    return <Spinner className="u-loader" text="加载中..." isMainComponent />;
  }

  const isManagedNetwork = network?.managed;

  const getTabs = (): TabLink[] => {
    const baseUrl = `/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(name)}`;
    const configurationTab: TabLink = {
      label: "配置",
      id: "configuration",
      active: !activeTab,
      href: baseUrl,
    };

    const type = network?.type ?? "";
    if (!typesWithForwards.includes(type) || !isManagedNetwork) {
      return [configurationTab];
    }

    const forwardsTab: TabLink = {
      label: "转发",
      id: "forwards",
      active: activeTab === "forwards",
      href: `${baseUrl}/forwards`,
    };
    const loadBalancersTab: TabLink = {
      label: "负载均衡器",
      id: "load-balancers",
      active: activeTab === "load-balancers",
      href: `${baseUrl}/load-balancers`,
    };
    const leasesTab: TabLink = {
      label: "租约",
      id: "leases",
      active: activeTab === "leases",
      href: `${baseUrl}/leases`,
    };

    if (network?.type === ovnType) {
      return [configurationTab, forwardsTab, loadBalancersTab, leasesTab];
    }

    return [configurationTab, forwardsTab, leasesTab];
  };

  return (
    <CustomLayout
      header={
        <NetworkDetailHeader network={network} project={project} name={name} />
      }
      contentClassName="edit-network"
    >
      <Row>
        <TabLinks
          tabs={getTabs()}
          activeTab={activeTab}
          tabUrl={`/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(name)}`}
        />
        <NotificationRow />
        {!activeTab && (
          <div role="tabpanel" aria-labelledby="configuration">
            {network && <EditNetwork network={network} project={project} />}
          </div>
        )}
        {activeTab === "forwards" && (
          <div role="tabpanel" aria-labelledby="forwards">
            {network && <NetworkForwards network={network} project={project} />}
          </div>
        )}
        {activeTab === "load-balancers" && (
          <div role="tabpanel" aria-labelledby="load-balancers">
            {network && (
              <NetworkLoadBalancers network={network} project={project} />
            )}
          </div>
        )}
        {activeTab === "leases" && (
          <div role="tabpanel" aria-labelledby="leases">
            {network && <NetworkLeases network={network} project={project} />}
          </div>
        )}
      </Row>
    </CustomLayout>
  );
};

export default NetworkDetail;
