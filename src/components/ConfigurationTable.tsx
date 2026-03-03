import type { FC, ReactNode } from "react";
import type { MainTableProps } from "@canonical/react-components";
import { MainTable } from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import classnames from "classnames";

interface Props {
  rows: MainTableRow[];
  className?: string;
  configurationExtra?: ReactNode;
  emptyStateMsg?: string;
}

const ConfigurationTable: FC<Props & MainTableProps> = ({
  rows,
  className,
  configurationExtra,
  emptyStateMsg,
  ...props
}) => {
  const headers = [
    {
      content: <span>配置{configurationExtra}</span>,
      className: "configuration",
    },
    { content: <span>继承值</span>, className: "inherited" },
    { content: <span>覆盖值</span>, className: "override" },
  ];

  return (
    <MainTable
      className={classnames("configuration-table", className)}
      emptyStateMsg={emptyStateMsg}
      headers={headers}
      rows={rows}
      {...props}
    />
  );
};

export default ConfigurationTable;
