import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import type { LxdDiskDevice } from "types/device";
import type { InstanceAndProfileFormikProps } from "./instanceAndProfileFormValues";
import ConfigurationTable from "components/ConfigurationTable";
import type { EditInstanceFormValues } from "pages/instances/EditInstance";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import { getInheritedRootStorage } from "util/configInheritance";
import StoragePoolSelector from "pages/storage/StoragePoolSelector";
import { getInheritedDeviceRow } from "./InheritedDeviceRow";
import DiskSizeSelector from "components/forms/DiskSizeSelector";
import type { LxdStoragePool } from "types/storage";
import type { LxdProfile } from "types/profile";
import { removeDevice } from "util/formDevices";
import { hasNoRootDisk, isRootDisk } from "util/instanceValidation";
import { ensureEditMode } from "util/instanceEdit";
import { focusField } from "util/formFields";
import DiskSizeQuotaLimitation from "components/forms/DiskSizeQuotaLimitation";

interface Props {
  formik: InstanceAndProfileFormikProps;
  pools: LxdStoragePool[];
  profiles: LxdProfile[];
  project: string;
}

const DiskDeviceFormRoot: FC<Props> = ({
  formik,
  pools,
  profiles,
  project,
}) => {
  const readOnly = (formik.values as EditInstanceFormValues).readOnly;
  const rootIndex = formik.values.devices.findIndex(isRootDisk);
  const hasRootStorage = rootIndex !== -1;
  const formRootDevice = formik.values.devices[
    rootIndex
  ] as LxdDiskDevice | null;
  const isEditingInstance =
    formik.values.entityType === "instance" && !formik.values.isCreating;
  const isVirtualMachine =
    formik.values.entityType === "instance" &&
    formik.values.instanceType === "virtual-machine";
  const defaultSizeLabel = isVirtualMachine ? "10GiB" : "无限制";
  const poolDriver = pools.find(
    (item) => item.name === formRootDevice?.pool,
  )?.driver;

  const [inheritValue, inheritSource] = getInheritedRootStorage(
    formik.values,
    profiles,
  );

  const addRootStorage = () => {
    const copy = [...formik.values.devices];
    copy.push({
      type: "disk",
      name: inheritValue?.name ? inheritValue.name : "root",
      path: "/",
      pool: inheritValue ? inheritValue.pool : (pools[0]?.name ?? undefined),
    });
    formik.setFieldValue("devices", copy);
  };

  return (
    <>
      <h2 className="p-heading--4">根存储</h2>
      <ConfigurationTable
        rows={[
          getConfigurationRowBase({
            className: "override-with-form",
            configuration: <b className="device-name">根存储</b>,
            inherited: "",
            override: hasRootStorage ? (
              <div>
                <Button
                  onClick={() => {
                    ensureEditMode(formik);
                    removeDevice(rootIndex, formik);
                  }}
                  type="button"
                  appearance="base"
                  title={formik.values.editRestriction ?? "清除覆盖"}
                  hasIcon
                  className="u-no-margin--bottom"
                  disabled={!!formik.values.editRestriction}
                >
                  <Icon name="close" className="clear-configuration-icon" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => {
                  ensureEditMode(formik);
                  addRootStorage();
                }}
                type="button"
                appearance="base"
                title={formik.values.editRestriction ?? "创建覆盖"}
                className="u-no-margin--bottom"
                hasIcon
                disabled={!!formik.values.editRestriction}
              >
                <Icon name="edit" />
              </Button>
            ),
          }),

          getInheritedDeviceRow({
            label: "存储池",
            id: "storage-pool-selector-disk",
            className: "override-with-form",
            inheritValue: inheritValue?.pool ?? "",
            inheritSource,
            readOnly: readOnly,
            disabledReason: formik.values.editRestriction,
            overrideValue: hasRootStorage && (
              <>
                {formRootDevice?.pool}
                {formik.values.entityType === "profile" && (
                  <Button
                    onClick={() => {
                      ensureEditMode(formik);
                      focusField("storage-pool-selector");
                    }}
                    type="button"
                    appearance="base"
                    title={formik.values.editRestriction ?? "编辑"}
                    className="u-no-margin--bottom"
                    hasIcon
                    disabled={!!formik.values.editRestriction}
                  >
                    <Icon name="edit" />
                  </Button>
                )}
              </>
            ),
            overrideForm: (
              <>
                <StoragePoolSelector
                  value={formRootDevice?.pool ?? ""}
                  setValue={(value) =>
                    void formik.setFieldValue(
                      `devices.${rootIndex}.pool`,
                      value,
                    )
                  }
                  selectProps={{
                    id: "storage-pool-selector-disk",
                    className: isEditingInstance ? "" : "u-no-margin--bottom",
                    disabled: isEditingInstance,
                    help: isEditingInstance
                      ? "使用页头中的迁移按钮可修改根存储。"
                      : "",
                  }}
                  project={project}
                />
              </>
            ),
          }),

          getInheritedDeviceRow({
            label: "大小",
            id: "limits_disk",
            className: "override-with-form",
            inheritValue:
              inheritValue?.size ?? (inheritValue ? defaultSizeLabel : ""),
            inheritSource,
            readOnly: readOnly,
            disabledReason: formik.values.editRestriction,
            overrideValue: hasRootStorage && (
              <>
                {formRootDevice?.size ?? "无限制"}
                <Button
                  onClick={() => {
                    ensureEditMode(formik);
                    focusField("limits_disk");
                  }}
                  type="button"
                  appearance="base"
                  title={formik.values.editRestriction ?? "编辑"}
                  className="u-no-margin--bottom"
                  hasIcon
                  disabled={!!formik.values.editRestriction}
                >
                  <Icon name="edit" />
                </Button>
              </>
            ),
            overrideForm: hasRootStorage && (
              <>
                <DiskSizeSelector
                  value={formRootDevice?.size ?? "GiB"}
                  setMemoryLimit={(val?: string) =>
                    void formik.setFieldValue(`devices.${rootIndex}.size`, val)
                  }
                />
                <p className="p-form-help-text">
                  <DiskSizeQuotaLimitation driver={poolDriver} />
                  根存储大小。留空时，根存储
                  {isVirtualMachine ? "将为 10GiB。" : "不限制大小。"}
                </p>
              </>
            ),
          }),
        ]}
      />
      {hasNoRootDisk(formik.values, profiles) && (
        <div className="is-error ">
          <p className="p-form-validation__message">
            <strong>错误：</strong>
            缺少根存储。请创建覆盖，或添加带有根存储的配置文件。
          </p>
        </div>
      )}
    </>
  );
};

export default DiskDeviceFormRoot;
