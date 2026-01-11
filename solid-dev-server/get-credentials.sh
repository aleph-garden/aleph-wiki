#!/usr/bin/env bash
# Generate Solid Pod client credentials for development and testing
set -euo pipefail

# Configuration with defaults for local development
CSS_URL="${CSS_URL:-http://localhost:3000}"
AUTH_TOKEN="${AUTH_TOKEN:-}"
ACCOUNT_ID="${ACCOUNT_ID:-}"
WEB_ID="${WEB_ID:-}"
CREDENTIAL_NAME="${CREDENTIAL_NAME:-Aleph Wiki Dev Client}"

usage() {
  cat <<EOF
Usage: get-credentials.sh

Generates Solid Pod client credentials and outputs JSON.

Required environment variables:
  AUTH_TOKEN    - CSS account token (from account dashboard)
  ACCOUNT_ID    - Account UUID (from CSS account)
  WEB_ID        - WebID URL (e.g., http://localhost:3000/dev/profile/card#me)

Optional environment variables:
  CSS_URL           - Community Solid Server URL (default: http://localhost:3000)
  CREDENTIAL_NAME   - Name for the credential (default: Aleph Wiki Dev Client)

Example:
  AUTH_TOKEN="your-token" \\
  ACCOUNT_ID="your-account-uuid" \\
  WEB_ID="http://localhost:3000/dev/profile/card#me" \\
  ./get-credentials.sh

EOF
  exit 1
}

# Validate required variables
if [[ -z "$AUTH_TOKEN" || -z "$ACCOUNT_ID" || -z "$WEB_ID" ]]; then
  echo "Error: Missing required environment variables" >&2
  echo >&2
  usage
fi

CREDENTIALS_URL="${CSS_URL}/.account/account/${ACCOUNT_ID}/client-credentials/"

# Generate credentials
curl -sf -X POST "${CREDENTIALS_URL}" \
  -H "authorization: CSS-Account-Token ${AUTH_TOKEN}" \
  -H "content-type: application/json" \
  -d "{\"name\":\"${CREDENTIAL_NAME}\",\"webId\":\"${WEB_ID}\"}" || {
  echo "Error: Failed to generate credentials" >&2
  echo "Check that CSS is running at ${CSS_URL} and credentials are correct" >&2
  exit 1
}
