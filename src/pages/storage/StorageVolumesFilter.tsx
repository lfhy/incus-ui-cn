import type { FC } from "react";
import { memo, useEffect, useRef } from "react";
import { SearchAndFilter } from "@canonical/react-components";
import type {
  SearchAndFilterData,
  SearchAndFilterChip,
} from "@canonical/react-components/dist/components/SearchAndFilter/types";
import { useSearchParams } from "react-router-dom";
import type { LxdStorageVolume } from "types/storage";
import {
  paramsFromSearchData,
  searchParamsToChips,
} from "util/searchAndFilter";
import { useIsClustered } from "context/useIsClustered";

export interface StorageVolumesFilterType {
  queries: string[];
  pools: string[];
  volumeTypes: string[];
  contentTypes: string[];
  clusterMembers: string[];
}

interface Props {
  volumes: LxdStorageVolume[];
}

const volumeTypes: string[] = ["容器", "虚拟机", "镜像", "自定义"];

export const QUERY = "query";
export const POOL = "pool";
export const VOLUME_TYPE = "volume-type";
export const CONTENT_TYPE = "content-type";
export const CLUSTER_MEMBER = "member";

const QUERY_PARAMS = [QUERY, POOL, VOLUME_TYPE, CONTENT_TYPE, CLUSTER_MEMBER];

const contentTypes: string[] = ["块存储", "文件系统", "ISO"];

const StorageVolumesFilter: FC<Props> = ({ volumes }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isClustered = useIsClustered();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const pools = [...new Set(volumes.map((volume) => volume.pool))];

  const locationSet = [
    ...new Set(
      volumes
        .flatMap((volume) => volume.location)
        .filter((item) => item.length > 0 && item !== "none"),
    ),
  ];

  const searchAndFilterData: SearchAndFilterData[] = [
    {
      id: 1,
      heading: "存储池",
      chips: pools.map((pool) => {
        return { lead: POOL, value: pool };
      }),
    },
    {
      id: 2,
      heading: "卷类型",
      chips: volumeTypes.map((volumeType) => {
        return { lead: VOLUME_TYPE, value: volumeType };
      }),
    },
    {
      id: 3,
      heading: "内容类型",
      chips: contentTypes.map((contentType) => {
        return { lead: CONTENT_TYPE, value: contentType };
      }),
    },
    ...(isClustered
      ? [
          {
            id: 4,
            heading: "集群成员",
            chips: ["集群范围"].concat(locationSet).map((location) => {
              return { lead: CLUSTER_MEMBER, value: location };
            }),
          },
        ]
      : []),
  ];

  useEffect(() => {
    const root = wrapperRef.current;
    if (!root) {
      return;
    }

    const updateText = () => {
      const hiddenTitle = root.querySelector(".u-off-screen");
      if (hiddenTitle?.textContent === "Search and filter") {
        hiddenTitle.textContent = "搜索和筛选";
      }

      const input = root.querySelector<HTMLInputElement>(
        "#search-and-filter-input",
      );
      if (
        input?.placeholder === "Search and filter" ||
        input?.placeholder === "Add filter"
      ) {
        input.placeholder = "搜索和筛选";
      }

      const submitBtn = root.querySelector<HTMLButtonElement>(
        ".p-search-and-filter__box button[type='submit']",
      );
      if (submitBtn?.textContent?.trim() === "Search") {
        submitBtn.textContent = "搜索";
      }
    };

    updateText();
    const observer = new MutationObserver(() => {
      updateText();
    });
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  const onSearchDataChange = (searchData: SearchAndFilterChip[]) => {
    const newParams = paramsFromSearchData(
      searchData,
      searchParams,
      QUERY_PARAMS,
    );

    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams);
    }
  };

  return (
    <div ref={wrapperRef} className="search-wrapper margin-right">
      <h2 className="u-off-screen">搜索和筛选</h2>
      <SearchAndFilter
        existingSearchData={searchParamsToChips(searchParams, QUERY_PARAMS)}
        filterPanelData={searchAndFilterData}
        returnSearchData={onSearchDataChange}
        onExpandChange={() => {
          window.dispatchEvent(
            new CustomEvent("resize", { detail: "search-and-filter" }),
          );
        }}
        onPanelToggle={() => {
          window.dispatchEvent(new CustomEvent("sfp-toggle"));
        }}
      />
    </div>
  );
};

export default memo(StorageVolumesFilter);
