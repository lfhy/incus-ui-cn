#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

ACTION="${1:-up}"

INCUS_SERVER_CA_FILE="${INCUS_SERVER_CA_FILE:-${PROJECT_ROOT}/docker/certs/incus-server-ca.crt}"
INCUS_CLIENT_CERT_FILE="${INCUS_CLIENT_CERT_FILE:-${PROJECT_ROOT}/docker/certs/incus-ui-client.crt}"
INCUS_CLIENT_KEY_FILE="${INCUS_CLIENT_KEY_FILE:-${PROJECT_ROOT}/docker/certs/incus-ui-client.key}"
INCUS_CLIENT_CERT_SUBJECT="${INCUS_CLIENT_CERT_SUBJECT:-/CN=incus-ui-gateway}"

mkdir -p "${PROJECT_ROOT}/docker/certs"

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD=(docker-compose)
else
  echo "Neither 'docker compose' nor 'docker-compose' is available."
  exit 1
fi

init_certs() {
  if [[ ! -f "${INCUS_CLIENT_CERT_FILE}" || ! -f "${INCUS_CLIENT_KEY_FILE}" ]]; then
    openssl req -x509 -newkey rsa:2048 \
      -keyout "${INCUS_CLIENT_KEY_FILE}" \
      -out "${INCUS_CLIENT_CERT_FILE}" \
      -days 3650 -nodes \
      -subj "${INCUS_CLIENT_CERT_SUBJECT}" >/dev/null 2>&1
    echo "Created client cert/key:"
    echo "  ${INCUS_CLIENT_CERT_FILE}"
    echo "  ${INCUS_CLIENT_KEY_FILE}"
  else
    echo "Client cert/key already exist, skipped generation."
  fi

  if [[ ! -f "${INCUS_SERVER_CA_FILE}" ]]; then
    if [[ -f "/var/lib/incus/server.crt" ]]; then
      cp /var/lib/incus/server.crt "${INCUS_SERVER_CA_FILE}"
      echo "Exported Incus server cert:"
      echo "  ${INCUS_SERVER_CA_FILE}"
    else
      echo "Cannot find /var/lib/incus/server.crt."
      echo "Please export backend CA cert to:"
      echo "  ${INCUS_SERVER_CA_FILE}"
    fi
  else
    echo "Backend CA cert already exists, skipped export."
  fi

  echo
  echo "If not trusted yet, run:"
  echo "  incus config trust add ${INCUS_CLIENT_CERT_FILE}"
}

trust_client_cert() {
  if ! command -v incus >/dev/null 2>&1; then
    echo "incus command not found, cannot auto trust certificate."
    echo "Please run manually:"
    echo "  incus config trust add ${INCUS_CLIENT_CERT_FILE}"
    exit 1
  fi

  local cert_fp_prefix
  cert_fp_prefix="$(
    openssl x509 -in "${INCUS_CLIENT_CERT_FILE}" -noout -fingerprint -sha256 \
      | cut -d= -f2 \
      | tr -d ':' \
      | tr 'A-Z' 'a-z' \
      | cut -c1-12
  )"

  if incus config trust list -f csv -c f | tr 'A-Z' 'a-z' | grep -qx "${cert_fp_prefix}"; then
    echo "Client cert is already trusted: ${cert_fp_prefix}"
    return
  fi

  if incus config trust add-certificate "${INCUS_CLIENT_CERT_FILE}" --name incus-ui-docker >/dev/null 2>&1; then
    echo "Trusted client cert via add-certificate: ${cert_fp_prefix}"
  else
    echo "add-certificate failed, trying legacy add flow..."
    incus config trust add "${INCUS_CLIENT_CERT_FILE}" || true
  fi

  if ! incus config trust list -f csv -c f | tr 'A-Z' 'a-z' | grep -qx "${cert_fp_prefix}"; then
    echo "Client cert is still not in trust list: ${cert_fp_prefix}"
    echo "Please complete trust manually, then rerun:"
    echo "  incus config trust add-certificate ${INCUS_CLIENT_CERT_FILE}"
    exit 1
  fi
}

load_cert_env() {
  if [[ -z "${BACKEND_CA_CERT_PEM:-}" ]]; then
    if [[ ! -f "${INCUS_SERVER_CA_FILE}" ]]; then
      echo "Missing CA cert: ${INCUS_SERVER_CA_FILE}"
      echo "Generate/import certs first (see README Docker section)."
      exit 1
    fi
    BACKEND_CA_CERT_PEM="$(cat "${INCUS_SERVER_CA_FILE}")"
    export BACKEND_CA_CERT_PEM
  fi

  if [[ -z "${BACKEND_CLIENT_CERT_PEM:-}" ]]; then
    if [[ ! -f "${INCUS_CLIENT_CERT_FILE}" ]]; then
      echo "Missing client cert: ${INCUS_CLIENT_CERT_FILE}"
      echo "Generate/import certs first (see README Docker section)."
      exit 1
    fi
    BACKEND_CLIENT_CERT_PEM="$(cat "${INCUS_CLIENT_CERT_FILE}")"
    export BACKEND_CLIENT_CERT_PEM
  fi

  if [[ -z "${BACKEND_CLIENT_KEY_PEM:-}" ]]; then
    if [[ ! -f "${INCUS_CLIENT_KEY_FILE}" ]]; then
      echo "Missing client key: ${INCUS_CLIENT_KEY_FILE}"
      echo "Generate/import certs first (see README Docker section)."
      exit 1
    fi
    BACKEND_CLIENT_KEY_PEM="$(cat "${INCUS_CLIENT_KEY_FILE}")"
    export BACKEND_CLIENT_KEY_PEM
  fi
}

case "${ACTION}" in
  bootstrap)
    init_certs
    trust_client_cert
    load_cert_env
    "${COMPOSE_CMD[@]}" up -d --build
    ;;
  init-certs)
    init_certs
    ;;
  build)
    load_cert_env
    "${COMPOSE_CMD[@]}" build
    ;;
  up)
    load_cert_env
    "${COMPOSE_CMD[@]}" up -d --build
    ;;
  down)
    "${COMPOSE_CMD[@]}" down
    ;;
  logs)
    "${COMPOSE_CMD[@]}" logs -f incus-ui
    ;;
  *)
    echo "Usage: $0 [bootstrap|init-certs|up|build|down|logs]"
    echo "Default: up"
    exit 1
    ;;
esac
