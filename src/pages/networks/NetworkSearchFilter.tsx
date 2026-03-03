import type { FC } from "react";
import { memo, useEffect, useRef } from "react";
import { SearchAndFilter } from "@canonical/react-components";
import type {
  SearchAndFilterChip,
  SearchAndFilterData,
} from "@canonical/react-components/dist/components/SearchAndFilter/types";
import { useSearchParams } from "react-router-dom";
import {
  paramsFromSearchData,
  searchParamsToChips,
} from "util/searchAndFilter";
import { useClusterMembers } from "context/useClusterMembers";

export const QUERY = "query";
export const TYPE = "type";
export const MANAGED = "managed";
export const MEMBER = "member";
export const STATE = "state";

const QUERY_PARAMS = [QUERY, TYPE, MANAGED, MEMBER, STATE];

export interface NetworkFilters {
  queries: string[];
  type: string[];
  managed: string[];
  member: string[];
  state: string[];
}

const NetworkSearchFilter: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: clusterMembers = [] } = useClusterMembers();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const memberSet = [
    ...new Set(clusterMembers.map((member) => member.server_name)),
  ];

  const searchAndFilterData: SearchAndFilterData[] = [
    {
      id: 1,
      heading: "类型",
      chips: ["OVN", "桥接", "物理"].map((type) => {
        return { lead: TYPE, value: type };
      }),
    },
    {
      id: 2,
      heading: "托管",
      chips: ["是", "否"].map((managed) => {
        return { lead: MANAGED, value: managed };
      }),
    },
    {
      id: 3,
      heading: "状态",
      chips: ["已创建", "待处理", "未知", "不可用", "错误"].map((state) => {
        return { lead: STATE, value: state };
      }),
    },
    ...(clusterMembers.length > 0
      ? [
          {
            id: 4,
            heading: "集群成员",
            chips: ["集群范围"].concat(memberSet).map((location) => {
              return { lead: MEMBER, value: location };
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
    <>
      <div ref={wrapperRef}>
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
    </>
  );
};

export default memo(NetworkSearchFilter);
