#!/usr/bin/env bash
# Generates a self-signed certificate/key pair for LOCAL DEVELOPMENT ONLY.
# For production, replace fullchain.pem / privkey.pem with certificates from
# a real CA (e.g. Let's Encrypt via certbot, or your organization's CA).
#
# Usage: ./generate-self-signed.sh [days] [common-name]

set -euo pipefail

DAYS="${1:-365}"
CN="${2:-localhost}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

openssl req -x509 -nodes -newkey rsa:2048 \
  -keyout "${DIR}/privkey.pem" \
  -out "${DIR}/fullchain.pem" \
  -days "${DAYS}" \
  -subj "/C=US/ST=Dev/L=Dev/O=EMS/CN=${CN}"

echo "Generated ${DIR}/fullchain.pem and ${DIR}/privkey.pem (valid ${DAYS} days, CN=${CN})"
echo "These are self-signed — browsers will show a security warning. That's expected in dev."
