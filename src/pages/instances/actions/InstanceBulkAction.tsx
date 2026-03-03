import type { FC, ReactNode } from "react";
import { Fragment } from "react";
import type {
  LxdInstance,
  LxdInstanceAction,
  LxdInstanceStatus,
} from "types/instance";
import { instanceAction, statusLabel } from "util/instanceBulkActions";
import { ConfirmationButton, Icon } from "@canonical/react-components";
import { getInstanceKey } from "util/instances";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import classnames from "classnames";

interface Props {
  action: LxdInstanceAction;
  confirmAppearance?: string;
  confirmExtra?: ReactNode;
  confirmLabel: string;
  icon: string;
  instances: LxdInstance[];
  isLoading: boolean;
  isDisabled: boolean;
  onClick: () => void;
  restrictedInstances: string[];
}

const InstanceBulkAction: FC<Props> = ({
  action,
  confirmAppearance,
  confirmExtra,
  confirmLabel,
  icon,
  instances,
  isLoading,
  isDisabled,
  onClick,
  restrictedInstances,
}) => {
  const isSmallScreen = useIsScreenBelow();

  const selectedStates = new Set(instances.map((item) => item.status));
  const hasDifferentStates = selectedStates.size > 1;
  const selectedSummary = hasDifferentStates ? (
    <>
      已选择 <b>{instances.length}</b> 个实例：
      <br />
      <br />
    </>
  ) : null;

  const hasChangedStates = [...selectedStates].some(
    (state) => instanceAction(action, state) !== undefined,
  );

  const statusLine = (
    currentState: LxdInstanceStatus,
    desiredAction: LxdInstanceAction,
  ) => {
    const count = instances.filter(
      (instance) =>
        instance.status === currentState &&
        !restrictedInstances.includes(getInstanceKey(instance)),
    ).length;

    if (count === 0) {
      return null;
    }

    const status = statusLabel(currentState) ?? "";
    const actionRaw = instanceAction(desiredAction, currentState);

    if (actionRaw === undefined) {
      return (
        <Fragment key={currentState + desiredAction}>
          - <b>{count}</b> 个{status}实例无需执行操作。
          <br />
        </Fragment>
      );
    }

    const indent = hasDifferentStates ? "- " : "";

    return (
      <Fragment key={currentState + desiredAction}>
        {indent}将{desiredAction} <b>{count}</b> 个{status}实例。
        <br />
      </Fragment>
    );
  };

  // no action states should be last
  const getLineOrder = (): LxdInstanceStatus[] => {
    switch (action) {
      case "start":
        return ["Frozen", "Stopped", "Running"];
      case "restart":
        return ["Running", "Freezing", "Stopped", "Frozen"];
      case "freeze":
        return ["Running", "Stopped", "Frozen"];
      case "stop":
        return ["Frozen", "Freezing", "Running", "Starting", "Stopped"];
      default:
        return [];
    }
  };

  const allRestricted = restrictedInstances.length === instances.length;
  const getRestrictedInstances = () => {
    if (restrictedInstances.length === 0) {
      return null;
    }

    return (
      <Fragment key="restricted">
        - <b>{restrictedInstances.length}</b> 个实例因权限不足无法执行“
        {confirmLabel}”。
        <br />
      </Fragment>
    );
  };

  // allow stop action when loading to allow to trigger force stop
  const isLoadingNotStop = isLoading && action !== "stop";

  return (
    <ConfirmationButton
      appearance="base"
      disabled={
        isDisabled || !hasChangedStates || allRestricted || isLoadingNotStop
      }
      loading={isLoading}
      className={classnames(
        {
          "has-icon": !isSmallScreen,
        },
        "u-no-margin--right u-no-margin--bottom bulk-action",
      )}
      confirmationModalProps={{
        title: `确认${confirmLabel}`,
        children: (
          <p>
            {selectedSummary}
            {getLineOrder().map((state) => statusLine(state, action))}
            {getRestrictedInstances()}
          </p>
        ),
        confirmExtra: confirmExtra,
        onConfirm: onClick,
        confirmButtonLabel: confirmLabel,
        cancelButtonLabel: "取消",
        confirmButtonAppearance: confirmAppearance,
      }}
      shiftClickEnabled
      onHoverText={
        allRestricted
          ? `你没有对已选 ${instances.length} 个实例执行“${confirmLabel}”的权限`
          : confirmLabel
      }
    >
      <Icon name={icon} />
      <span className="u-hide--small">{confirmLabel}</span>
    </ConfirmationButton>
  );
};

export default InstanceBulkAction;
