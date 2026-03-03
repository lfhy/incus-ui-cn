import type { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import { getConfigurationRow } from "components/ConfigurationRow";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import ConfigurationTable from "components/ConfigurationTable";
import { BRIDGE } from "pages/networks/forms/NetworkFormMenu";
import { slugify } from "util/slugify";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { useIsClustered } from "context/useIsClustered";
import ClusteredBridgeInterfaceInput from "pages/networks/forms/ClusteredBridgeInterfaceInput";
import { bridgeType } from "util/networks";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  filterRows: (rows: MainTableRow[]) => MainTableRow[];
}

const NetworkFormBridge: FC<Props> = ({ formik, filterRows }) => {
  const isClustered = useIsClustered();

  const rows = filterRows([
    getConfigurationRow({
      formik,
      name: "bridge_mtu",
      label: "MTU",
      defaultValue: "",
      children: <Input type="text" />,
    }),

    getConfigurationRow({
      formik,
      name: "bridge_hwaddr",
      label: "硬件地址",
      defaultValue: "",
      children: <Input type="text" />,
    }),

    ...(formik.values.networkType === bridgeType
      ? [
          getConfigurationRow({
            formik,
            name: "bridge_driver",
            label: "驱动",
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
                    label: "原生",
                    value: "native",
                  },
                  {
                    label: "Open vSwitch",
                    value: "openvswitch",
                  },
                ]}
              />
            ),
          }),
          getConfigurationRow({
            formik,
            name: "bridge_external_interfaces",
            label: "外部接口",
            defaultValue: "",
            hideOverrideBtn:
              isClustered && formik.values.bridge_external_interfaces === "set",
            children: isClustered ? (
              <ClusteredBridgeInterfaceInput
                formik={formik}
                placeholder="请输入接口名称"
              />
            ) : (
              <Input type="text" />
            ),
            readOnlyRenderer: (value) =>
              isClustered && value !== "-" && value !== undefined ? (
                <ClusteredBridgeInterfaceInput
                  key={JSON.stringify(
                    formik.values.bridge_external_interfaces_per_member ?? {},
                  )}
                  formik={formik}
                  placeholder="请输入接口名称"
                />
              ) : (
                <>{value}</>
              ),
          }),
        ]
      : []),
  ]);

  if (rows.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className="p-heading--4" id={slugify(BRIDGE)}>
        桥接
      </h2>
      <ConfigurationTable rows={rows} />
    </>
  );
};

export default NetworkFormBridge;
