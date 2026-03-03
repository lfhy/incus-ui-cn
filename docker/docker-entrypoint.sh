#!/usr/bin/env sh
set -eu

FRONTEND_PORT="${FRONTEND_PORT:-8080}"
PUBLIC_PORT="${PUBLIC_PORT:-80}"
BACKEND_HOST="${BACKEND_HOST:-host.docker.internal}"
BACKEND_PORT="${BACKEND_PORT:-8443}"
BACKEND_SSL_VERIFY="${BACKEND_SSL_VERIFY:-none}"
BACKEND_CA_CERT_PEM="${BACKEND_CA_CERT_PEM:-}"
BACKEND_CLIENT_CERT_PEM="${BACKEND_CLIENT_CERT_PEM:-}"
BACKEND_CLIENT_KEY_PEM="${BACKEND_CLIENT_KEY_PEM:-}"

if [ "${BACKEND_SSL_VERIFY}" != "none" ] && [ "${BACKEND_SSL_VERIFY}" != "required" ]; then
  echo "ERROR: BACKEND_SSL_VERIFY must be 'none' or 'required'"
  exit 1
fi

if [ -n "${BACKEND_CLIENT_CERT_PEM}" ] && [ -z "${BACKEND_CLIENT_KEY_PEM}" ]; then
  echo "ERROR: BACKEND_CLIENT_KEY_PEM is required when BACKEND_CLIENT_CERT_PEM is set"
  exit 1
fi

if [ -z "${BACKEND_CLIENT_CERT_PEM}" ] && [ -n "${BACKEND_CLIENT_KEY_PEM}" ]; then
  echo "ERROR: BACKEND_CLIENT_CERT_PEM is required when BACKEND_CLIENT_KEY_PEM is set"
  exit 1
fi

BACKEND_TLS_OPTIONS="ssl verify ${BACKEND_SSL_VERIFY}"

if [ "${BACKEND_SSL_VERIFY}" = "required" ] && [ -n "${BACKEND_CA_CERT_PEM}" ]; then
  printf "%s" "${BACKEND_CA_CERT_PEM}" > /tmp/backend-ca.crt
  BACKEND_TLS_OPTIONS="${BACKEND_TLS_OPTIONS} ca-file /tmp/backend-ca.crt"
fi

if [ -n "${BACKEND_CLIENT_CERT_PEM}" ]; then
  printf "%s\n%s\n" "${BACKEND_CLIENT_KEY_PEM}" "${BACKEND_CLIENT_CERT_PEM}" > /tmp/backend-client.pem
  BACKEND_TLS_OPTIONS="${BACKEND_TLS_OPTIONS} crt /tmp/backend-client.pem"
fi

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
  bind 0.0.0.0:${PUBLIC_PORT}
  acl is_core path_beg /1.0
  acl is_oidc path_beg /oidc
  acl is_docs path_beg /documentation
  acl is_os path_beg /os
  use_backend incus_https_backend if is_core || is_oidc || is_docs || is_os
  default_backend incus_ui_backend

backend incus_ui_backend
  server ui_local 127.0.0.1:${FRONTEND_PORT}

backend incus_https_backend
  server incus_backend ${BACKEND_HOST}:${BACKEND_PORT} ${BACKEND_TLS_OPTIONS}
EOF

serve --single --no-clipboard --listen "tcp://127.0.0.1:${FRONTEND_PORT}" /srv/build &

exec haproxy -f /tmp/haproxy.cfg -db
