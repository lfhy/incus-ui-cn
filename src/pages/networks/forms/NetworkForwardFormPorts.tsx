import type { FC } from "react";
import {
  Button,
  Icon,
  Input,
  Label,
  Select,
} from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import type { NetworkForwardFormValues } from "pages/networks/forms/NetworkForwardForm";
import type { LxdNetwork } from "types/network";

export interface NetworkForwardPortFormValues {
  listenPort: string;
  protocol: "tcp" | "udp";
  targetAddress: string;
  targetPort?: string;
}

interface Props {
  formik: FormikProps<NetworkForwardFormValues>;
  network?: LxdNetwork;
}

const NetworkForwardFormPorts: FC<Props> = ({ formik, network }) => {
  return (
    <table className="u-no-margin--bottom forward-ports">
      <thead>
        <tr>
          <th className="listen-port">
            <Label
              required
              forId="ports.0.listenPort"
              className="u-no-margin--bottom"
            >
              监听端口
            </Label>
          </th>
          <th className="protocol">
            <Label
              required
              forId="ports.0.protocol"
              className="u-no-margin--bottom"
            >
              协议
            </Label>
          </th>
          <th className="target-address">
            <Label
              required
              forId="ports.0.targetAddress"
              className="u-no-margin--bottom"
            >
              目标地址
            </Label>
          </th>
          <th className="target-port">
            <Label forId="ports.0.targetPort" className="u-no-margin--bottom">
              目标端口
            </Label>
          </th>
          <th className="u-off-screen">操作</th>
        </tr>
      </thead>
      <tbody>
        {formik.values.ports.map((_port, index) => {
          const portError = formik.errors.ports?.[
            index
          ] as NetworkForwardPortFormValues | null;

          return (
            <tr key={index}>
              <td className="listen-port">
                <Input
                  {...formik.getFieldProps(`ports.${index}.listenPort`)}
                  id={`ports.${index}.listenPort`}
                  type="text"
                  aria-label={`端口 ${index} 监听端口`}
                  placeholder="端口号"
                  help={
                    index === formik.values.ports.length - 1 && (
                      <>例如：80、90-99。</>
                    )
                  }
                  error={
                    formik.touched.ports?.[index]?.listenPort
                      ? portError?.listenPort
                      : undefined
                  }
                />
              </td>
              <td className="protocol">
                <Select
                  {...formik.getFieldProps(`ports.${index}.protocol`)}
                  id={`ports.${index}.protocol`}
                  options={[
                    { label: "TCP", value: "tcp" },
                    { label: "UDP", value: "udp" },
                  ]}
                  aria-label={`端口 ${index} 协议`}
                />
              </td>
              <td className="target-address">
                <Input
                  {...formik.getFieldProps(`ports.${index}.targetAddress`)}
                  id={`ports.${index}.targetAddress`}
                  type="text"
                  aria-label={`端口 ${index} 目标地址`}
                  placeholder="请输入 IP 地址"
                  help={
                    index === formik.values.ports.length - 1 && (
                      <>
                        必须属于网络 <b>{network?.name}</b>。
                      </>
                    )
                  }
                  error={
                    formik.touched.ports?.[index]?.targetAddress
                      ? portError?.targetAddress
                      : undefined
                  }
                />
              </td>
              <td className="target-port">
                <Input
                  {...formik.getFieldProps(`ports.${index}.targetPort`)}
                  id={`ports.${index}.targetPort`}
                  type="text"
                  aria-label={`端口 ${index} 目标端口`}
                  placeholder="端口号"
                  help={
                    index === formik.values.ports.length - 1 &&
                    "留空则与监听端口相同"
                  }
                  error={
                    formik.touched.ports?.[index]?.targetPort
                      ? portError?.targetPort
                      : undefined
                  }
                />
              </td>
              <td>
                <Button
                  onClick={async () =>
                    formik.setFieldValue("ports", [
                      ...formik.values.ports.slice(0, index),
                      ...formik.values.ports.slice(index + 1),
                    ])
                  }
                  hasIcon
                  className="u-no-margin--bottom"
                  type="button"
                  aria-label={`删除端口 ${index}`}
                >
                  <Icon name="delete" />
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default NetworkForwardFormPorts;
