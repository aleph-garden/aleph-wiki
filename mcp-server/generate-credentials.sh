#!/bin/bash
# Generate client credentials for E2E tests

AUTH_TOKEN="a7f65d5a-3863-4948-b413-06856dbd0e54"
CREDENTIALS_URL="http://localhost:3000/.account/account/705bcad3-9e2e-46e9-b893-199a7d9de1fc/client-credentials/"
WEB_ID="http://localhost:3000/dev/profile/card#me"

curl -s -X POST "${CREDENTIALS_URL}" \
  -H "authorization: CSS-Account-Token ${AUTH_TOKEN}" \
  -H "content-type: application/json" \
  -d "{\"name\":\"E2E Test Client\",\"webId\":\"${WEB_ID}\"}" \
  | tee client-credentials.json
