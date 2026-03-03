import type { FC } from "react";
import { Button } from "@canonical/react-components";

interface Props {
  totalCount: number;
  filteredNames: string[];
  itemName: string;
  parentName?: string;
  selectedNames: string[];
  setSelectedNames: (val: string[]) => void;
  hideActions?: boolean;
}

const SelectedTableNotification: FC<Props> = ({
  totalCount,
  filteredNames,
  itemName,
  parentName,
  selectedNames,
  setSelectedNames,
  hideActions,
}: Props) => {
  const isAllSelected = selectedNames.length === filteredNames.length;

  const selectAll = () => {
    setSelectedNames(filteredNames);
  };

  const selectNone = () => {
    setSelectedNames([]);
  };

  return (
    <div>
      {isAllSelected ? (
        <>
          {filteredNames.length === 1 ? (
            <>
              已选择 <b>1</b> 个{itemName}。{" "}
            </>
          ) : (
            <>
              已全选 <b>{filteredNames.length}</b> 个{itemName}。{" "}
            </>
          )}
          {!hideActions && (
            <Button
              appearance="link"
              className="u-no-margin--bottom u-no-padding--top"
              onClick={selectNone}
            >
              清除选择
            </Button>
          )}
        </>
      ) : (
        <>
          已选择 <b>{selectedNames.length}</b> 个{itemName}。{" "}
          {!hideActions && (
            <Button
              appearance="link"
              className="u-no-margin--bottom u-no-padding--top"
              onClick={selectAll}
            >
              全选 <b>{filteredNames.length}</b>{" "}
              {filteredNames.length === totalCount
                ? `${itemName}${parentName ? `（${parentName}）` : ""}`
                : `筛选结果中的${itemName}`}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default SelectedTableNotification;
