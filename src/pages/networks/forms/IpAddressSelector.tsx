import type { FC } from "react";
import { Input, RadioInput } from "@canonical/react-components";

interface Props {
  id: string;
  address?: string;
  setAddress: (address: string) => void;
  family: "IPv4" | "IPv6";
}

const IpAddressSelector: FC<Props> = ({ id, address, setAddress, family }) => {
  const isCustom = address !== "none" && address !== "auto";

  return (
    <>
      <div className="ip-address-selector">
        <RadioInput
          label="自动"
          checked={address === "auto"}
          onChange={() => {
            setAddress("auto");
          }}
        />
        <RadioInput
          label="无"
          checked={address === "none"}
          onChange={() => {
            setAddress("none");
          }}
        />
      </div>
      <div className="ip-address-selector ip-address-custom">
        <RadioInput
          label="自定义"
          aria-label="自定义"
          checked={isCustom}
          onChange={() => {
            setAddress("");
          }}
        />
        <Input
          id={id}
          name={id}
          type="text"
          placeholder="请输入地址"
          onChange={(e) => {
            setAddress(e.target.value);
          }}
          value={isCustom && address ? address : ""}
          disabled={!isCustom}
          help={
            <>
              使用 CIDR 表示法。
              <br />
              可将该选项设为 <code>none</code> 以关闭 {family}，或设为{" "}
              <code>auto</code> 以生成新的随机未占用子网。
            </>
          }
        />
      </div>
    </>
  );
};

export default IpAddressSelector;
