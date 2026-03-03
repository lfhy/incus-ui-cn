import { type FC } from "react";
import type { LxdStoragePool } from "types/storage";
import { humanFileSize } from "util/helpers";
import Meter from "components/Meter";
import { useClusteredStoragePoolResources } from "context/useStoragePools";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchStoragePoolResources } from "api/storage-pools";
import { isClusterLocalDriver } from "util/storagePool";
import { useIsClustered } from "context/useIsClustered";

interface Props {
  pool: LxdStoragePool;
  hasMeterBar?: boolean;
}

const StoragePoolSize: FC<Props> = ({ pool, hasMeterBar }) => {
  const { data: clusteredPoolResources = [] } =
    useClusteredStoragePoolResources(pool.name);
  const isClustered = useIsClustered();
  const hasMemberSpecificSize =
    isClusterLocalDriver(pool.driver) && isClustered;

  const { data: poolResources } = useQuery({
    queryKey: [queryKeys.storage, pool.name, queryKeys.resources],
    queryFn: async () => fetchStoragePoolResources(pool.name),
    enabled: !hasMemberSpecificSize,
  });
  const resourceList = hasMemberSpecificSize
    ? clusteredPoolResources
    : [poolResources];

  if (!hasMeterBar && hasMemberSpecificSize) {
    return "取决于集群成员";
  }

  return (
    <div>
      {resourceList.map((poolResource) => {
        if (!poolResource) {
          return <>{pool.config?.size}</>;
        }

        const total = poolResource.space.total;
        const used = poolResource.space.used || 0;

        if (!hasMeterBar) {
          return (
            <div key={poolResource.memberName}>
              {`已用 ${humanFileSize(used)} / ${humanFileSize(total)}`}
            </div>
          );
        }

        return (
          <Meter
            key={poolResource.memberName}
            percentage={(100 / total) * used || 0}
            text={`已用 ${humanFileSize(used)} / ${humanFileSize(total)}`}
          />
        );
      })}
    </div>
  );
};

export default StoragePoolSize;
