import type { FC } from "react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ActionButton,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useFormik } from "formik";
import type { NetworkForwardFormValues } from "pages/networks/forms/NetworkForwardForm";
import NetworkForwardForm, {
  NetworkForwardSchema,
  toNetworkForward,
} from "pages/networks/forms/NetworkForwardForm";
import { createNetworkForward } from "api/network-forwards";
import { Link, useNavigate, useParams } from "react-router-dom";
import BaseLayout from "components/BaseLayout";
import HelpLink from "components/HelpLink";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useNetwork } from "context/useNetworks";
import { isTypeOvn } from "util/networks";

const CreateNetworkForward: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { network: networkName, project } = useParams<{
    network: string;
    project: string;
  }>();

  const { data: network, error: networkError } = useNetwork(
    networkName ?? "",
    project ?? "",
  );

  useEffect(() => {
    if (networkError) {
      notify.failure("加载网络失败", networkError);
    }
  }, [networkError]);

  const getDefaultListenAddress = () => {
    if (!isTypeOvn(network)) {
      return "";
    }
    if (network?.config["ipv4.address"] !== "none") {
      return "0.0.0.0";
    }
    if (network?.config["ipv6.address"] !== "none") {
      return "::";
    }
    return "";
  };

  const formik = useFormik<NetworkForwardFormValues>({
    initialValues: {
      listenAddress: getDefaultListenAddress(),
      ports: [],
    },
    validationSchema: NetworkForwardSchema,
    onSubmit: (values) => {
      const forward = toNetworkForward(values);
      createNetworkForward(networkName ?? "", forward, project ?? "")
        .then((listenAddress) => {
          queryClient.invalidateQueries({
            queryKey: [
              queryKeys.projects,
              project,
              queryKeys.networks,
              network,
              queryKeys.forwards,
            ],
          });
          navigate(
            `/ui/project/${encodeURIComponent(project ?? "")}/network/${encodeURIComponent(networkName ?? "")}/forwards`,
          );
          toastNotify.success(
            `监听地址为 ${listenAddress} 的网络转发规则已创建。`,
          );
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("创建网络转发规则失败", e);
        });
    },
  });

  return (
    <BaseLayout
      title={
        <HelpLink docPath="/howto/network_forwards/" title="了解更多网络转发">
          创建网络转发规则
        </HelpLink>
      }
      contentClassName="create-network"
    >
      <NetworkForwardForm formik={formik} network={network} />
      <FormFooterLayout>
        <Link
          className="p-button--base"
          to={`/ui/project/${encodeURIComponent(project ?? "")}/network/${encodeURIComponent(networkName ?? "")}/forwards`}
        >
          取消
        </Link>
        <ActionButton
          loading={formik.isSubmitting}
          disabled={
            !formik.isValid ||
            formik.isSubmitting ||
            !formik.values.listenAddress
          }
          onClick={() => void formik.submitForm()}
        >
          创建
        </ActionButton>
      </FormFooterLayout>
    </BaseLayout>
  );
};

export default CreateNetworkForward;
