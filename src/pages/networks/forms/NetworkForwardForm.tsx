import type { FC } from "react";
import { useEffect } from "react";
import {
  Button,
  Col,
  Form,
  Icon,
  Input,
  Label,
  Notification,
  RadioInput,
  Row,
  useListener,
  useNotify,
} from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import * as Yup from "yup";
import type { LxdNetwork, LxdNetworkForward } from "types/network";
import { updateMaxHeight } from "util/updateMaxHeight";
import { isTypeOvn, testValidIp, testValidPort } from "util/networks";
import NotificationRow from "components/NotificationRow";
import type { NetworkForwardPortFormValues } from "pages/networks/forms/NetworkForwardFormPorts";
import NetworkForwardFormPorts from "pages/networks/forms/NetworkForwardFormPorts";
import ScrollableForm from "components/ScrollableForm";
import { focusField } from "util/formFields";
import ClusterMemberSelector from "pages/cluster/ClusterMemberSelector";
import { useClusterMembers } from "context/useClusterMembers";
import { bridgeType } from "util/networks";

export const toNetworkForward = (
  values: NetworkForwardFormValues,
): LxdNetworkForward => {
  return {
    listen_address: values.listenAddress,
    description: values.description,
    config: {
      target_address: values.defaultTargetAddress,
    },
    ports: values.ports.map((port) => ({
      listen_port: port.listenPort?.toString(),
      protocol: port.protocol,
      target_address: port.targetAddress?.toString(),
      target_port: port.targetPort?.toString(),
    })),
    location: values.location,
  };
};

export const NetworkForwardSchema = Yup.object().shape({
  listenAddress: Yup.string()
    .test("valid-ip", "IP 地址无效", testValidIp)
    .required("监听地址不能为空"),
  ports: Yup.array().of(
    Yup.object().shape({
      listenPort: Yup.string()
        .test("valid-port", "端口号无效", testValidPort)
        .required("监听端口不能为空"),
      protocol: Yup.string().required("协议不能为空"),
      targetAddress: Yup.string()
        .test("valid-ip", "IP 地址无效", testValidIp)
        .required("目标地址不能为空"),
      targetPort: Yup.string()
        .nullable()
        .test("valid-port", "端口号无效", testValidPort),
    }),
  ),
});

export interface NetworkForwardFormValues {
  listenAddress: string;
  defaultTargetAddress?: string;
  description?: string;
  ports: NetworkForwardPortFormValues[];
  location?: string;
}

interface Props {
  formik: FormikProps<NetworkForwardFormValues>;
  isEdit?: boolean;
  network?: LxdNetwork;
}

const NetworkForwardForm: FC<Props> = ({ formik, isEdit, network }) => {
  const notify = useNotify();
  const { data: members = [] } = useClusterMembers();
  const isClusterMemberSpecific =
    members.length > 0 && network?.type === bridgeType;

  useEffect(() => {
    if (isClusterMemberSpecific && !formik.values.location) {
      formik.setFieldValue("location", members[0].server_name);
    }
  }, [members]);

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message]);
  useListener(window, updateFormHeight, "resize", true);

  const addPort = () => {
    formik.setFieldValue("ports", [
      ...formik.values.ports,
      {
        protocol: "tcp",
      },
    ]);

    const name = `ports.${formik.values.ports.length}.listenPort`;
    focusField(name);
  };

  const isOvnNetwork = isTypeOvn(network);
  const isManualListenAddress =
    !isOvnNetwork || !["0.0.0.0", "::"].includes(formik.values.listenAddress);

  return (
    <Form className="form network-forwards-form" onSubmit={formik.handleSubmit}>
      <Row className="form-contents">
        <Col size={12}>
          <ScrollableForm>
            {/* hidden submit to enable enter key in inputs */}
            <Input type="submit" hidden value="Hidden input" />
            <Row className="p-form__group p-form-validation">
              <NotificationRow />
              <Notification
                severity="information"
                title="网络信息"
                titleElement="h2"
              >
                名称：{network?.name}
                <br />
                {network?.config["ipv4.address"] && (
                  <>
                    IPv4：{network?.config["ipv4.address"]}
                    <br />
                  </>
                )}
                {network?.config["ipv6.address"] && (
                  <>IPv6：{network?.config["ipv6.address"]}</>
                )}
              </Notification>
            </Row>
            <Row>
              <Col size={4}>
                <Label forId="listenAddress">监听地址</Label>
              </Col>
              <Col size={8}>
                {isOvnNetwork && !isEdit && (
                  <>
                    {network?.config["ipv4.address"] !== "none" && (
                      <RadioInput
                        label="自动分配 IPv4 地址"
                        checked={formik.values.listenAddress === "0.0.0.0"}
                        onChange={() => {
                          formik.setFieldValue("listenAddress", "0.0.0.0");
                        }}
                      />
                    )}
                    {network?.config["ipv6.address"] !== "none" && (
                      <RadioInput
                        label="自动分配 IPv6 地址"
                        checked={formik.values.listenAddress === "::"}
                        onChange={() => {
                          formik.setFieldValue("listenAddress", "::");
                        }}
                      />
                    )}
                    <RadioInput
                      label="手动输入地址"
                      checked={isManualListenAddress}
                      onChange={() => {
                        formik.setFieldValue("listenAddress", "");
                      }}
                    />
                  </>
                )}
                <Input
                  {...formik.getFieldProps("listenAddress")}
                  id="listenAddress"
                  type="text"
                  placeholder="请输入 IP 地址"
                  autoFocus
                  required
                  disabled={isEdit || !isManualListenAddress}
                  help={
                    isEdit
                      ? "创建后无法更改监听地址。"
                      : "任何可路由到 LXD 的地址。"
                  }
                  error={
                    formik.touched.listenAddress
                      ? formik.errors.listenAddress
                      : undefined
                  }
                />
              </Col>
            </Row>
            <Input
              {...formik.getFieldProps("defaultTargetAddress")}
              id="defaultTargetAddress"
              type="text"
              label="默认目标地址"
              help={
                <>
                  当流量不匹配下方已指定端口时使用的回退目标地址。
                  <br />
                  必须属于网络 <b>{network?.name}</b>。
                </>
              }
              placeholder="请输入 IP 地址"
              stacked
            />
            {isClusterMemberSpecific && (
              <ClusterMemberSelector
                {...formik.getFieldProps("location")}
                id="location"
                label="位置"
                help={
                  isEdit
                    ? "创建后无法更改位置。"
                    : "要创建该转发规则的集群成员。"
                }
                disabled={isEdit}
                stacked
              />
            )}
            <Input
              {...formik.getFieldProps("description")}
              id="description"
              type="text"
              label="描述"
              placeholder="请输入描述"
              stacked
            />
            {formik.values.ports.length > 0 && (
              <NetworkForwardFormPorts formik={formik} network={network} />
            )}
            <Button hasIcon onClick={addPort} type="button">
              <Icon name="plus" />
              <span>添加端口</span>
            </Button>
          </ScrollableForm>
        </Col>
      </Row>
    </Form>
  );
};

export default NetworkForwardForm;
