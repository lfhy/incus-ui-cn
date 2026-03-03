import type { FC } from "react";
import { useNotify, Spinner } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { fetchResources } from "api/server";
import { queryKeys } from "util/queryKeys";
import { humanFileSize } from "util/helpers";
import { limitToBytes } from "util/limits";
import type { LxdProject } from "types/project";
import { useServerEntitlements } from "util/entitlements/server";

interface Props {
  project?: LxdProject;
}

const MemoryLimitAvailable: FC<Props> = ({ project }) => {
  const notify = useNotify();
  const { canViewResources } = useServerEntitlements();

  const {
    data: resources,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.resources],
    queryFn: async () => fetchResources(),
    enabled: canViewResources(),
  });

  if (isLoading) {
    return <Spinner className="u-loader" text="正在加载资源..." />;
  }

  if (error) {
    notify.failure("加载资源失败", error);
  }

  const getAvailableMemory = () => {
    if (!project?.config["limits.memory"]) {
      return resources?.memory.total;
    }
    if (!resources?.memory.total) {
      return limitToBytes(project.config["limits.memory"]);
    }
    return Math.min(
      resources.memory.total,
      Number(limitToBytes(project.config["limits.memory"])),
    );
  };

  const maxMemory = getAvailableMemory();

  return maxMemory ? (
    <>
      总内存：<b>{humanFileSize(maxMemory)}</b>
    </>
  ) : null;
};

export default MemoryLimitAvailable;
