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
import { warningSeverities, warningStatuses } from "util/warningFilter";

export const QUERY = "query";
export const STATUS = "status";
export const SEVERITY = "severity";

const QUERY_PARAMS = [QUERY, STATUS, SEVERITY];
const statusValueToLabel: Record<string, string> = {
  new: "新建",
  acknowledged: "已确认",
  resolved: "已解决",
};
const severityValueToLabel: Record<string, string> = {
  low: "低",
  moderate: "中",
  high: "高",
};
const statusLabelToValue: Record<string, string> = {
  新建: "new",
  已确认: "acknowledged",
  已解决: "resolved",
};
const severityLabelToValue: Record<string, string> = {
  低: "low",
  中: "moderate",
  高: "high",
};

const WarningSearchFilter: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const searchAndFilterData: SearchAndFilterData[] = [
    {
      id: 1,
      heading: "状态",
      chips: warningStatuses.map((status) => {
        return { lead: STATUS, value: statusValueToLabel[status] ?? status };
      }),
    },
    {
      id: 2,
      heading: "严重级别",
      chips: warningSeverities.map((severity) => {
        return {
          lead: SEVERITY,
          value: severityValueToLabel[severity] ?? severity,
        };
      }),
    },
  ];

  function chipsToDisplay(chips: SearchAndFilterChip[]): SearchAndFilterChip[] {
    return chips.map((chip) => {
      if (chip.lead === STATUS) {
        return { ...chip, value: statusValueToLabel[chip.value] ?? chip.value };
      }
      if (chip.lead === SEVERITY) {
        return {
          ...chip,
          value: severityValueToLabel[chip.value] ?? chip.value,
        };
      }
      return chip;
    });
  }

  function chipsToParams(chips: SearchAndFilterChip[]): SearchAndFilterChip[] {
    return chips.map((chip) => {
      if (chip.lead === STATUS) {
        return { ...chip, value: statusLabelToValue[chip.value] ?? chip.value };
      }
      if (chip.lead === SEVERITY) {
        return {
          ...chip,
          value: severityLabelToValue[chip.value] ?? chip.value,
        };
      }
      return chip;
    });
  }

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
      chipsToParams(searchData),
      searchParams,
      QUERY_PARAMS,
    );

    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams);
    }
  };

  return (
    <div ref={wrapperRef}>
      <h2 className="u-off-screen">搜索和筛选</h2>
      <SearchAndFilter
        existingSearchData={chipsToDisplay(
          searchParamsToChips(searchParams, QUERY_PARAMS),
        )}
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

export default memo(WarningSearchFilter);
