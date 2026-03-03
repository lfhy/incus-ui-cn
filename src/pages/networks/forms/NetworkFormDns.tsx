import type { FC } from "react";
import { Input, Select, Textarea } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import { getConfigurationRow } from "components/ConfigurationRow";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import ConfigurationTable from "components/ConfigurationTable";
import { DNS } from "pages/networks/forms/NetworkFormMenu";
import { slugify } from "util/slugify";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { bridgeType, physicalType } from "util/networks";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  filterRows: (rows: MainTableRow[]) => MainTableRow[];
}

const NetworkFormDns: FC<Props> = ({ formik, filterRows }) => {
  const rows = filterRows([
    ...(formik.values.networkType !== physicalType
      ? [
          getConfigurationRow({
            formik,
            name: "dns_domain",
            label: "DNS 域",
            defaultValue: "",
            children: <Input type="text" />,
          }),
        ]
      : []),

    ...(formik.values.networkType === bridgeType
      ? [
          getConfigurationRow({
            formik,
            name: "dns_mode",
            label: "DNS 模式",
            defaultValue: "",
            children: (
              <Select
                options={[
                  {
                    label: "请选择",
                    value: "",
                    disabled: true,
                  },
                  {
                    label: "无",
                    value: "none",
                  },
                  {
                    label: "托管",
                    value: "managed",
                  },
                  {
                    label: "动态",
                    value: "dynamic",
                  },
                ]}
              />
            ),
          }),
        ]
      : []),

    ...(formik.values.networkType === physicalType
      ? [
          getConfigurationRow({
            formik,
            name: "dns_nameservers",
            label: "DNS 名称服务器",
            defaultValue: "",
            children: <Input type="text" />,
          }),
        ]
      : [
          getConfigurationRow({
            formik,
            name: "dns_search",
            label: "DNS 搜索域",
            defaultValue: "",
            children: <Textarea />,
          }),
        ]),
  ]);

  if (rows.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className="p-heading--4" id={slugify(DNS)}>
        DNS
      </h2>
      <ConfigurationTable rows={rows} />
    </>
  );
};

export default NetworkFormDns;
