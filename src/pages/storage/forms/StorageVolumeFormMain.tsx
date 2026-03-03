import type { FC } from "react";
import { Col, Input, Label, Row, Select } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import type { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import { getFormProps } from "pages/storage/forms/StorageVolumeForm";
import ConfigurationTable from "components/ConfigurationTable";
import { getConfigurationRow } from "components/ConfigurationRow";
import DiskSizeSelector from "components/forms/DiskSizeSelector";
import { optionTrueFalse } from "util/instanceOptions";
import ClusterMemberSelector from "pages/cluster/ClusterMemberSelector";
import StoragePoolSelector from "pages/storage/StoragePoolSelector";
import ScrollableForm from "components/ScrollableForm";
import { ensureEditMode } from "util/instanceEdit";
import { hasMemberLocalVolumes } from "util/hasMemberLocalVolumes";
import type { LxdStoragePool } from "types/storage";
import type { LxdSettings } from "types/server";
import type { LxdClusterMember } from "types/cluster";
import DiskSizeQuotaLimitation from "components/forms/DiskSizeQuotaLimitation";

interface Props {
  formik: FormikProps<StorageVolumeFormValues>;
  poolError?: string;
  clusterMembers?: LxdClusterMember[];
  pools?: LxdStoragePool[];
  settings?: LxdSettings;
  showClusterMember: boolean;
  project: string;
}

const StorageVolumeFormMain: FC<Props> = ({
  formik,
  poolError,
  clusterMembers = [],
  pools = [],
  settings,
  showClusterMember,
  project,
}) => {
  const poolDriver = pools.find(
    (item) => item.name === formik.values.pool,
  )?.driver;

  const setMember = formik.values.isCreating
    ? (member: string) => void formik.setFieldValue("clusterMember", member)
    : undefined;

  return (
    <ScrollableForm>
      <Row>
        <Col size={12}>
          <Label
            forId="storage-pool-selector-volume"
            required={formik.values.isCreating}
          >
            存储池
          </Label>
          <StoragePoolSelector
            value={formik.values.pool}
            setValue={(pool) => {
              void formik.setFieldValue("pool", pool);
              if (
                hasMemberLocalVolumes(pool, pools, settings) &&
                clusterMembers.length > 0
              ) {
                formik.setFieldValue(
                  "clusterMember",
                  clusterMembers[0].server_name,
                );
              } else {
                formik.setFieldValue("clusterMember", undefined);
              }
            }}
            selectProps={{
              id: "storage-pool-selector-volume",
              disabled: !formik.values.isCreating,
              error: poolError,
              help: formik.values.isCreating
                ? undefined
                : "可使用页眉中的迁移按钮将卷移动到其他存储池。",
            }}
            project={project}
          />
          {formik.values.clusterMember !== undefined &&
            formik.values.clusterMember !== "none" && (
              <Select
                id="clusterMember"
                label="集群成员"
                onChange={(e) => {
                  formik.setFieldValue("clusterMember", e.target.value);
                }}
                value={formik.values.clusterMember}
                options={clusterMembers.map((member) => {
                  return {
                    label: member.server_name,
                    value: member.server_name,
                  };
                })}
                disabled={!formik.values.isCreating}
                required={formik.values.isCreating}
                help={
                  formik.values.isCreating
                    ? undefined
                    : "创建后不可更改集群成员。"
                }
              />
            )}
          <Input
            {...getFormProps(formik, "name")}
            type="text"
            label="名称"
            disabled={!formik.values.isCreating}
            required={formik.values.isCreating}
            help={
              formik.values.isCreating
                ? undefined
                : "点击页眉中的名称可重命名卷。"
            }
          />
          <DiskSizeSelector
            label="大小"
            value={formik.values.size}
            help={
              (
                <>
                  <DiskSizeQuotaLimitation driver={poolDriver} />
                  {formik.values.volumeType === "custom"
                    ? "存储卷大小。若留空，则该卷在其存储池内不设置大小限制。"
                    : "非自定义卷的大小创建后不可更改。"}
                </>
              ) as unknown as string
            }
            setMemoryLimit={(val?: string) => {
              ensureEditMode(formik);
              formik.setFieldValue("size", val);
            }}
            disabled={
              !!formik.values.editRestriction ||
              formik.values.volumeType !== "custom"
            }
          />
          <Select
            {...getFormProps(formik, "content_type")}
            options={[
              {
                label: "文件系统",
                value: "filesystem",
              },
              {
                label: "块存储",
                value: "block",
              },
            ]}
            label="内容类型"
            help={
              formik.values.isCreating
                ? "文件系统类型可直接挂载并写入文件；块存储类型仅可附加到虚拟机，并作为空块设备使用。"
                : "创建后不可更改内容类型。"
            }
            onChange={(e) => {
              if (e.target.value === "block") {
                formik.setFieldValue("block_filesystem", undefined);
                formik.setFieldValue("block_mount_options", undefined);
                formik.setFieldValue("block_type", undefined);
                formik.setFieldValue("security_shifted", undefined);
                formik.setFieldValue("security_unmapped", undefined);
              }
              formik.setFieldValue("content_type", e.target.value);
            }}
            disabled={!formik.values.isCreating}
          />
          {showClusterMember && (
            <ClusterMemberSelector
              {...getFormProps(formik, "clusterMember")}
              id="clusterMember"
              label="集群成员"
              value={formik.values.clusterMember}
              setMember={setMember}
              disabled={!formik.values.isCreating}
            />
          )}
        </Col>
      </Row>
      {formik.values.content_type === "filesystem" && (
        <ConfigurationTable
          rows={[
            getConfigurationRow({
              formik,
              label: "安全位移映射",
              name: "security_shifted",
              defaultValue: "",
              disabled: formik.values.security_unmapped === "true",
              disabledReason: "当“安全未映射”设为 true 时，无法修改该设置",
              children: <Select options={optionTrueFalse} />,
            }),

            getConfigurationRow({
              formik,
              label: "安全未映射",
              name: "security_unmapped",
              defaultValue: "",
              disabled: formik.values.security_shifted === "true",
              disabledReason: "当“安全位移映射”设为 true 时，无法修改该设置",
              children: <Select options={optionTrueFalse} />,
            }),
          ]}
        />
      )}
    </ScrollableForm>
  );
};

export default StorageVolumeFormMain;
