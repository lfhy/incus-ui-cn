import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  Col,
  Notification,
  Row,
  ScrollableContainer,
  Spinner,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchResources } from "api/server";
import { debounce } from "util/debounce";
import ClusterMemberDetailSystem from "pages/cluster/ClusterMemberDetailSystem";
import ClusterMemberDetailCPU from "pages/cluster/ClusterMemberDetailCPU";
import ClusterMemberDetailMemory from "pages/cluster/ClusterMemberDetailMemory";
import ClusterMemberDetailGPU from "pages/cluster/ClusterMemberDetailGPU";
import ClusterMemberDetailNetworks from "pages/cluster/ClusterMemberDetailNetworks";
import ClusterMemberDetailPCI from "pages/cluster/ClusterMemberDetailPCI";
import ClusterMemberDetailStorage from "pages/cluster/ClusterMemberDetailStorage";
import ClusterMemberDetailUSB from "pages/cluster/ClusterMemberDetailUSB";
import type { LxdClusterMember } from "types/cluster";
import { getFirstVisibleSection } from "util/scroll";
import { fetchClusterMemberState } from "api/cluster-members";

interface Props {
  member?: LxdClusterMember;
}

const ClusterMemberHardware: FC<Props> = ({ member }) => {
  const [section, setSection] = useState("system");

  const { data: resources, isLoading } = useQuery({
    queryKey: [
      queryKeys.cluster,
      queryKeys.members,
      member?.server_name ?? undefined,
      queryKeys.resources,
    ],
    queryFn: async () => fetchResources(member?.server_name),
  });

  const { data: state, isLoading: isStateLoading } = useQuery({
    queryKey: [
      queryKeys.cluster,
      queryKeys.members,
      member?.server_name ?? undefined,
      queryKeys.state,
    ],
    queryFn: async () => fetchClusterMemberState(member?.server_name ?? ""),
    enabled: !!member,
  });

  const sections = [
    "System",
    "CPU",
    "GPU",
    "Memory",
    "Networks",
    "Storage",
    "PCI",
    "USB",
  ];
  const sectionLabels: Record<string, string> = {
    System: "系统",
    CPU: "CPU",
    GPU: "GPU",
    Memory: "内存",
    Networks: "网络",
    Storage: "存储",
    PCI: "PCI",
    USB: "USB",
  };

  useEffect(() => {
    const wrapper = document.getElementById("content-details");
    const activateSectionOnScroll = () => {
      const activeSection = getFirstVisibleSection(sections, wrapper);
      setSection(activeSection.toLowerCase());
    };
    const scrollListener = () => {
      debounce(activateSectionOnScroll, 20);
    };
    wrapper?.addEventListener("scroll", scrollListener);
    return () => wrapper?.removeEventListener("scroll", scrollListener);
  }, [isLoading, sections]);

  if (isLoading || isStateLoading) {
    return <Spinner className="u-loader" text="加载中..." />;
  }

  return (
    <>
      {!resources && (
        <Notification severity="negative" title="无法加载该成员的详细信息" />
      )}
      {resources && (
        <ScrollableContainer dependencies={[resources]}>
          {sections.map((sectionName) => (
            <Row className="hardware-section" key={sectionName}>
              <Col size={2}>
                <h2 className="p-heading--5" id={sectionName.toLowerCase()}>
                  {sectionLabels[sectionName] ?? sectionName}
                </h2>
              </Col>
              <Col size={10}>
                {sectionName === "System" && (
                  <ClusterMemberDetailSystem
                    resources={resources}
                    state={state}
                  />
                )}
                {sectionName === "CPU" && (
                  <ClusterMemberDetailCPU resources={resources} state={state} />
                )}
                {sectionName === "Memory" && (
                  <ClusterMemberDetailMemory
                    resources={resources}
                    state={state}
                  />
                )}
                {sectionName === "GPU" && (
                  <ClusterMemberDetailGPU resources={resources} />
                )}
                {sectionName === "Networks" && (
                  <ClusterMemberDetailNetworks resources={resources} />
                )}
                {sectionName === "PCI" && (
                  <ClusterMemberDetailPCI resources={resources} />
                )}
                {sectionName === "Storage" && (
                  <ClusterMemberDetailStorage resources={resources} />
                )}
                {sectionName === "USB" && (
                  <ClusterMemberDetailUSB resources={resources} />
                )}
              </Col>
            </Row>
          ))}
          <div className="aside">
            <nav aria-label="硬件导航" className="toc-tree">
              <ul>
                {sections.map((sectionName) => (
                  <li className="p-side-navigation__item" key={sectionName}>
                    <a
                      className="p-side-navigation__link"
                      href={`#${sectionName.toLowerCase()}`}
                      aria-current={
                        section === sectionName.toLowerCase()
                          ? "page"
                          : undefined
                      }
                    >
                      {sectionLabels[sectionName] ?? sectionName}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </ScrollableContainer>
      )}
    </>
  );
};

export default ClusterMemberHardware;
