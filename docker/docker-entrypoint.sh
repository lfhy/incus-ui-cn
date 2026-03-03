#!/usr/bin/env sh
set -eu

FRONTEND_PORT="${FRONTEND_PORT:-8080}"
AUTH_PORT="${AUTH_PORT:-8090}"
PUBLIC_PORT="${PUBLIC_PORT:-443}"
BACKEND_HOST="${BACKEND_HOST:-host.docker.internal}"
BACKEND_PORT="${BACKEND_PORT:-8443}"
BACKEND_SSL_VERIFY="${BACKEND_SSL_VERIFY:-required}"
BACKEND_CA_CERT_PEM="${BACKEND_CA_CERT_PEM:-}"
BACKEND_CLIENT_CERT_PEM="${BACKEND_CLIENT_CERT_PEM:-}"
BACKEND_CLIENT_KEY_PEM="${BACKEND_CLIENT_KEY_PEM:-}"
PUBLIC_TLS_CERT_PEM="${PUBLIC_TLS_CERT_PEM:-}"
PUBLIC_TLS_KEY_PEM="${PUBLIC_TLS_KEY_PEM:-}"
BASIC_AUTH_USERNAME="${BASIC_AUTH_USERNAME:-}"
BASIC_AUTH_PASSWORD="${BASIC_AUTH_PASSWORD:-}"
AUTH_COOKIE_NAME="${AUTH_COOKIE_NAME:-incus_ui_auth}"
AUTH_COOKIE_VALUE="${AUTH_COOKIE_VALUE:-}"

if [ "${BACKEND_SSL_VERIFY}" != "none" ] && [ "${BACKEND_SSL_VERIFY}" != "required" ]; then
  echo "ERROR: BACKEND_SSL_VERIFY must be 'none' or 'required'"
  exit 1
fi

if [ -z "${BASIC_AUTH_USERNAME}" ] || [ -z "${BASIC_AUTH_PASSWORD}" ]; then
  echo "ERROR: BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD are required"
  exit 1
fi

if [ -z "${BACKEND_CLIENT_CERT_PEM}" ] || [ -z "${BACKEND_CLIENT_KEY_PEM}" ]; then
  echo "ERROR: BACKEND_CLIENT_CERT_PEM and BACKEND_CLIENT_KEY_PEM are required"
  exit 1
fi

if [ "${BACKEND_SSL_VERIFY}" = "required" ] && [ -z "${BACKEND_CA_CERT_PEM}" ]; then
  echo "ERROR: BACKEND_CA_CERT_PEM is required when BACKEND_SSL_VERIFY=required"
  exit 1
fi

if [ -n "${PUBLIC_TLS_CERT_PEM}" ] && [ -z "${PUBLIC_TLS_KEY_PEM}" ]; then
  echo "ERROR: PUBLIC_TLS_KEY_PEM is required when PUBLIC_TLS_CERT_PEM is set"
  exit 1
fi

if [ -z "${PUBLIC_TLS_CERT_PEM}" ] && [ -n "${PUBLIC_TLS_KEY_PEM}" ]; then
  echo "ERROR: PUBLIC_TLS_CERT_PEM is required when PUBLIC_TLS_KEY_PEM is set"
  exit 1
fi

BACKEND_TLS_OPTIONS="ssl verify ${BACKEND_SSL_VERIFY}"

if [ "${BACKEND_SSL_VERIFY}" = "required" ]; then
  printf "%s" "${BACKEND_CA_CERT_PEM}" > /tmp/backend-ca.crt
  BACKEND_TLS_OPTIONS="${BACKEND_TLS_OPTIONS} ca-file /tmp/backend-ca.crt"
fi

printf "%s\n%s\n" "${BACKEND_CLIENT_KEY_PEM}" "${BACKEND_CLIENT_CERT_PEM}" > /tmp/backend-client.pem
BACKEND_TLS_OPTIONS="${BACKEND_TLS_OPTIONS} crt /tmp/backend-client.pem"

if [ -n "${PUBLIC_TLS_CERT_PEM}" ]; then
  printf "%s\n%s\n" "${PUBLIC_TLS_KEY_PEM}" "${PUBLIC_TLS_CERT_PEM}" > /tmp/public-tls.pem
else
  openssl req -x509 -nodes -newkey rsa:2048 \
    -keyout /tmp/public-tls.key \
    -out /tmp/public-tls.crt \
    -days 3650 \
    -subj "/CN=localhost" >/dev/null 2>&1
  cat /tmp/public-tls.key /tmp/public-tls.crt > /tmp/public-tls.pem
fi

if [ -z "${AUTH_COOKIE_VALUE}" ]; then
  AUTH_COOKIE_VALUE="$(openssl rand -hex 32)"
fi

export BASIC_AUTH_USERNAME BASIC_AUTH_PASSWORD AUTH_COOKIE_NAME AUTH_COOKIE_VALUE AUTH_PORT

cat > /tmp/haproxy.cfg <<EOF
global
  daemon
  user haproxy

defaults
  mode  http
  timeout connect 50000
  timeout client  500000
  timeout server  500000

frontend incus_ui_frontend
  bind 0.0.0.0:${PUBLIC_PORT} ssl crt /tmp/public-tls.pem
  acl is_auth path_beg /auth
  acl is_core path_beg /1.0
  acl is_core_root path -i /1.0
  acl is_core_sub path_beg /1.0/
  acl is_oidc path_beg /oidc
  acl is_docs path_beg /documentation
  acl is_os path_beg /os
  acl is_os_root path -i /os/1.0
  acl is_os_sub path_beg /os/1.0/
  acl has_auth_cookie hdr_sub(cookie) ${AUTH_COOKIE_NAME}=${AUTH_COOKIE_VALUE}
  use_backend incus_auth_backend if is_auth
  use_backend incus_https_backend if is_core has_auth_cookie
  use_backend incus_auth_backend if is_core_root !has_auth_cookie
  use_backend incus_https_backend if is_oidc
  use_backend incus_https_backend if is_docs has_auth_cookie
  use_backend incus_https_backend if is_os has_auth_cookie
  use_backend incus_auth_backend if is_os_root !has_auth_cookie
  http-request return status 401 content-type "application/json" string "{\"error\":\"unauthorized\"}" if is_core_sub !has_auth_cookie
  http-request return status 401 content-type "application/json" string "{\"error\":\"unauthorized\"}" if is_docs !has_auth_cookie
  http-request return status 401 content-type "application/json" string "{\"error\":\"unauthorized\"}" if is_os_sub !has_auth_cookie
  default_backend incus_ui_backend

backend incus_ui_backend
  server ui_local 127.0.0.1:${FRONTEND_PORT}

backend incus_auth_backend
  server auth_local 127.0.0.1:${AUTH_PORT}

backend incus_https_backend
  server incus_backend ${BACKEND_HOST}:${BACKEND_PORT} ${BACKEND_TLS_OPTIONS}
EOF

serve --single --no-clipboard --listen "tcp://127.0.0.1:${FRONTEND_PORT}" /srv/build &
node /srv/docker/auth-server.mjs &

exec haproxy -f /tmp/haproxy.cfg -db
