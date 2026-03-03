import { FC } from "react";
import { getMACAddresses } from "util/networks";
import { LxdInstance } from "types/instance";
import ExpandableList from "components/ExpandableList";

interface Props {
  instance: LxdInstance;
}

const InstanceMAC: FC<Props> = ({ instance }) => {
  const addresses = getMACAddresses(instance);
  return addresses.length ? (
    <ExpandableList
      items={addresses.map((item) => (
        <div
          key={item.hwaddr}
          className="u-truncate"
          title={`MAC 地址  ()`}
        >
          {item.hwaddr} ({item.iface})
        </div>
      ))}
    />
  ) : (
    <>-</>
  );
};

export default InstanceMAC;
