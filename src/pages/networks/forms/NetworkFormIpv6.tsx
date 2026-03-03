import type { FC } from "react";
import { Input, Select, Textarea } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import { getConfigurationRow } from "components/ConfigurationRow";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { optionTrueFalse } from "util/instanceOptions";
import ConfigurationTable from "components/ConfigurationTable";
import { IPV6 } from "pages/networks/forms/NetworkFormMenu";
import { slugify } from "util/slugify";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { bridgeType, ovnType, physicalType } from "util/networks";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  filterRows: (rows: MainTableRow[]) => MainTableRow[];
}

const NetworkFormIpv6: FC<Props> = ({ formik, filterRows }) => {
  const hasDhcp = formik.values.ipv6_dhcp !== "false";

  const rows = filterRows([
    ...(formik.values.networkType !== physicalType
      ? [
          getConfigurationRow({
            formik,
            name: "ipv6_nat",
            label: "IPv6 NAT",
            defaultValue: "",
            children: <Select options={optionTrueFalse} />,
            disabled: formik.values.ipv6_address === "none",
            disabledReason: "IPv6 地址已设置为 none",
          }),
        ]
      : []),

    ...(formik.values.networkType !== physicalType
      ? [
          getConfigurationRow({
            formik,
            name: "ipv6_dhcp",
            label: "IPv6 DHCP",
            defaultValue: "",
            children: <Select options={optionTrueFalse} />,
          }),
        ]
      : []),

    ...(formik.values.networkType !== ovnType &&
    formik.values.networkType !== physicalType
      ? [
          getConfigurationRow({
            formik,
            name: "ipv6_dhcp_expiry",
            label: "IPv6 DHCP 租约过期时间",
            defaultValue: "",
            disabled: !hasDhcp,
            disabledReason: "IPv6 DHCP 已禁用",
            children: <Input type="text" />,
          }),

          getConfigurationRow({
            formik,
            name: "ipv6_dhcp_ranges",
            label: "IPv6 DHCP 范围",
            defaultValue: "",
            disabled: !hasDhcp,
            disabledReason: "IPv6 DHCP 已禁用",
            children: <Textarea />,
          }),
        ]
      : []),

    ...(formik.values.networkType !== physicalType
      ? [
          getConfigurationRow({
            formik,
            name: "ipv6_dhcp_stateful",
            label: "IPv6 DHCP 有状态",
            defaultValue: "",
            disabled: !hasDhcp,
            disabledReason: "IPv6 DHCP 已禁用",
            children: <Select options={optionTrueFalse} />,
          }),
        ]
      : []),

    ...(formik.values.networkType === ovnType
      ? [
          getConfigurationRow({
            formik,
            name: "ipv6_l3only",
            label: "仅 IPv6 三层",
            defaultValue: "",
            children: <Select options={optionTrueFalse} />,
          }),
        ]
      : []),

    ...(formik.values.networkType !== ovnType
      ? [
          getConfigurationRow({
            formik,
            name: "ipv6_ovn_ranges",
            label: "IPv6 OVN 范围",
            defaultValue: "",
            children: <Textarea />,
          }),
        ]
      : []),

    ...([bridgeType, physicalType].includes(formik.values.networkType)
      ? [
          getConfigurationRow({
            formik,
            name: "ipv6_routes",
            label: "IPv6 路由",
            defaultValue: "",
            children: <Textarea />,
          }),
        ]
      : []),

    ...(formik.values.networkType === physicalType
      ? [
          getConfigurationRow({
            formik,
            name: "ipv6_gateway",
            label: "IPv6 网关",
            defaultValue: "",
            children: <Textarea />,
          }),
          getConfigurationRow({
            formik,
            name: "ipv6_routes_anycast",
            label: "IPv6 路由任播",
            defaultValue: "",
            children: <Select options={optionTrueFalse} />,
          }),
        ]
      : []),
  ]);

  if (rows.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className="p-heading--4" id={slugify(IPV6)}>
        IPv6
      </h2>
      <ConfigurationTable rows={rows} />
    </>
  );
};

export default NetworkFormIpv6;
