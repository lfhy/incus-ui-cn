import { Icon } from "@canonical/react-components";
import { useOperations } from "context/operationsProvider";
import { Link } from "react-router-dom";
import { useIsScreenBelow } from "context/useIsScreenBelow";

const OperationStatus = () => {
  const isSmallScreen = useIsScreenBelow();
  const { runningOperations } = useOperations();

  if (runningOperations.length === 0) {
    return null;
  }

  const operationsStatus = isSmallScreen
    ? `${runningOperations.length} 个操作...`
    : `${runningOperations.length} 个操作进行中...`;

  return (
    <div className="operation-status" role="alert">
      <Icon name="status-in-progress-small" className="status-icon" />
      <Link to="/ui/operations">{operationsStatus}</Link>
    </div>
  );
};

export default OperationStatus;
