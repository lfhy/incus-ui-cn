import type { FC, FormEvent } from "react";
import { useState } from "react";
import {
  Button,
  CustomLayout,
  Icon,
  Spinner,
} from "@canonical/react-components";
import { Navigate } from "react-router-dom";
import { useAuth } from "context/auth";
import { useSettings } from "context/useSettings";
import { useI18n } from "i18n/context";
import {
  checkBackendTrusted,
  loginWithPassword,
  logoutAuthCookie,
} from "api/ui-auth";

const Login: FC = () => {
  const { t } = useI18n();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { data: settings } = useSettings();
  const hasOidc = settings?.auth_methods?.includes("oidc");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthLoading) {
    return <Spinner className="u-loader" text={t("loadingResources")} />;
  }

  if (isAuthenticated) {
    return <Navigate to="/ui" replace={true} />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const result = await loginWithPassword(username.trim(), password);
    setIsSubmitting(false);

    if (!result.ok) {
      setErrorMessage(result.message ?? t("invalidLoginCredentials"));
      return;
    }

    const backendTrusted = await checkBackendTrusted();
    if (!backendTrusted) {
      await logoutAuthCookie();
      setErrorMessage(t("backendCertificateNotTrusted"));
      return;
    }

    window.location.href = "/ui";
  };

  return (
    <>
      <CustomLayout>
        <div className="empty-state login-page">
          <h1 className="p-heading--4 u-sv-2">{t("login")}</h1>

          <>
            <p className="u-sv1">{t("chooseLoginMethod")}</p>
            <div className="auth-container">
              <form
                className="login-form"
                onSubmit={(event) => {
                  void handleSubmit(event);
                }}
              >
                <label className="login-form-label" htmlFor="username">
                  {t("username")}
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                  }}
                  autoComplete="username"
                  required
                />
                <label className="login-form-label" htmlFor="password">
                  {t("password")}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                  }}
                  autoComplete="current-password"
                  required
                />
                {errorMessage && <p className="login-error">{errorMessage}</p>}
                <Button
                  className="has-icon login-submit-btn"
                  appearance="positive"
                  type="submit"
                  disabled={isSubmitting}
                >
                  <Icon name="security" light />
                  <span>{t("loginWithPassword")}</span>
                </Button>
              </form>
              {hasOidc && (
                <a
                  className="p-button has-icon login-sso-btn"
                  href="/oidc/login"
                >
                  <Icon name="security" light />
                  <span>{t("loginWithSSO")}</span>
                </a>
              )}
            </div>
          </>
        </div>
      </CustomLayout>
    </>
  );
};

export default Login;
