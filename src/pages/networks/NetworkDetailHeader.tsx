import type { FC } from "react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { RenameHeaderValues } from "components/RenameHeader";
import RenameHeader from "components/RenameHeader";
import { useFormik } from "formik";
import * as Yup from "yup";
import { checkDuplicateName } from "util/helpers";
import type { LxdNetwork } from "types/network";
import { renameNetwork } from "api/networks";
import DeleteNetworkBtn from "pages/networks/actions/DeleteNetworkBtn";
import { useNotify, useToastNotification } from "@canonical/react-components";
import ResourceLink from "components/ResourceLink";
import { useNetworkEntitlements } from "util/entitlements/networks";

interface Props {
  name: string;
  network?: LxdNetwork;
  project: string;
}

const NetworkDetailHeader: FC<Props> = ({ name, network, project }) => {
  const { member } = useParams<{ member: string }>();
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const controllerState = useState<AbortController | null>(null);
  const { canEditNetwork } = useNetworkEntitlements();

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "已存在同名网络",
        async (value) =>
          network?.name === value ||
          checkDuplicateName(value, project, controllerState, "networks"),
      )
      .required("网络名称不能为空"),
  });

  const formik = useFormik<RenameHeaderValues>({
    initialValues: {
      name,
      isRenaming: false,
    },
    validationSchema: RenameSchema,
    onSubmit: (values) => {
      if (name === values.name) {
        formik.setFieldValue("isRenaming", false);
        formik.setSubmitting(false);
        return;
      }
      renameNetwork(name, values.name, project)
        .then(() => {
          const url = `/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(values.name)}`;
          navigate(url);
          toastNotify.success(
            <>
              网络 <strong>{name}</strong> 已重命名为{" "}
              <ResourceLink type="network" value={values.name} to={url} />.
            </>,
          );
          formik.setFieldValue("isRenaming", false);
        })
        .catch((e) => {
          notify.failure("重命名失败", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
        });
    },
  });

  const isUsed = (network?.used_by?.length ?? 0) > 0;
  const isManaged = network?.managed;

  const getRenameDisableReason = () => {
    if (!canEditNetwork(network)) {
      return "你没有重命名此网络的权限";
    }

    if (!isManaged) {
      return "无法重命名，网络未托管";
    }

    if (isUsed) {
      return "无法重命名，网络正在使用中。";
    }

    return undefined;
  };

  return (
    <RenameHeader
      name={name}
      relatedChip={
        member && (
          <ResourceLink
            type="cluster-member"
            value={member}
            to={`/ui/project/${encodeURIComponent(project)}/networks?member=${encodeURIComponent(member)}`}
          />
        )
      }
      parentItems={[
        <Link
          to={`/ui/project/${encodeURIComponent(project)}/networks`}
          key={1}
        >
          网络
        </Link>,
      ]}
      renameDisabledReason={getRenameDisableReason()}
      controls={
        network && <DeleteNetworkBtn network={network} project={project} />
      }
      isLoaded={Boolean(network)}
      formik={formik}
    />
  );
};

export default NetworkDetailHeader;
