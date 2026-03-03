import { Navigate } from "react-router-dom";
import { useAuth } from "context/auth";
import { Spinner } from "@canonical/react-components";
import type { FC } from "react";
import { useI18n } from "i18n/context";

interface Props {
  outlet: React.JSX.Element;
}

const ProtectedRoute: FC<Props> = ({ outlet }) => {
  const { t } = useI18n();
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <Spinner className="u-loader" text={t("loading")} isMainComponent />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/ui/login" replace={true} />;
  }

  return outlet;
};

export default ProtectedRoute;
