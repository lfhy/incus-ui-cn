import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import type { InstanceAndProfileFormikProps } from "./instanceAndProfileFormValues";
import ConfigurationTable from "components/ConfigurationTable";
import type { EditInstanceFormValues } from "pages/instances/EditInstance";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import type { InheritedDiskDevice } from "util/configInheritance";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import classnames from "classnames";
import type { FormDiskDevice } from "util/formDevices";
import {
  addNoneDevice,
  findNoneDeviceIndex,
  removeDevice,
} from "util/formDevices";
import DetachDiskDeviceBtn from "pages/instances/actions/DetachDiskDeviceBtn";
import { getInheritedDeviceRow } from "components/forms/InheritedDeviceRow";
import { ensureEditMode } from "util/instanceEdit";
import { isHostDiskDevice } from "util/devices";
import { isSpecialDisk } from "util/instanceValidation";

interface Props {
  formik: InstanceAndProfileFormikProps;
  inheritedDiskDevices: InheritedDiskDevice[];
}

const DiskDeviceFormInherited: FC<Props> = ({
  formik,
  inheritedDiskDevices,
}) => {
  const readOnly = (formik.values as EditInstanceFormValues).readOnly;

  const rows: MainTableRow[] = [];
  inheritedDiskDevices.forEach((item) => {
    const noneDeviceId = findNoneDeviceIndex(item.key, formik);
    const isNoneDevice = noneDeviceId !== -1;

    rows.push(
      getConfigurationRowBase({
        className: "no-border-top override-with-form",
        configuration: (
          <div
            className={classnames("device-name", {
              "u-text--muted": isNoneDevice,
            })}
          >
            <b>{item.key}</b>
          </div>
        ),
        inherited: (
          <div className="p-text--small u-text--muted u-no-margin--bottom">
            来源：{item.source}
          </div>
        ),
        override: isNoneDevice ? (
          <Button
            appearance="base"
            type="button"
            title={formik.values.editRestriction ?? "重新挂载设备"}
            onClick={() => {
              ensureEditMode(formik);
              removeDevice(noneDeviceId, formik);
            }}
            className="has-icon u-no-margin--bottom"
            disabled={!!formik.values.editRestriction}
          >
            <Icon name="connected"></Icon>
            <span>重新挂载</span>
          </Button>
        ) : (
          <DetachDiskDeviceBtn
            onDetach={() => {
              ensureEditMode(formik);
              addNoneDevice(item.key, formik);
            }}
            disabledReason={formik.values.editRestriction}
          />
        ),
      }),
    );

    if (isHostDiskDevice(item.disk)) {
      rows.push(
        getInheritedDeviceRow({
          label: "主机路径",
          inheritValue: item.disk.source,
          readOnly: readOnly,
          isDeactivated: isNoneDevice,
          disabledReason: formik.values.editRestriction,
        }),
      );
    } else if (isSpecialDisk(item.disk as FormDiskDevice)) {
      rows.push(
        getInheritedDeviceRow({
          label: "特殊设备",
          inheritValue: item.disk.source,
          readOnly: readOnly,
        }),
      );
    } else {
      rows.push(
        getInheritedDeviceRow({
          label: "存储池 / 卷",
          inheritValue: (
            <>
              {item.disk.pool} / {item.disk.source}
            </>
          ),
          readOnly: readOnly,
          isDeactivated: isNoneDevice,
          disabledReason: formik.values.editRestriction,
        }),
      );
    }

    rows.push(
      getInheritedDeviceRow({
        label: "挂载点",
        inheritValue: item.disk.path,
        readOnly: readOnly,
        isDeactivated: isNoneDevice,
        disabledReason: formik.values.editRestriction,
      }),
    );
  });

  return inheritedDiskDevices.length > 0 ? (
    <div className="inherited-devices">
      <h2 className="p-heading--4">继承磁盘设备</h2>
      <ConfigurationTable rows={rows} />
    </div>
  ) : null;
};

export default DiskDeviceFormInherited;
