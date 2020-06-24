#!/bin/sh
set -eu

if test -z "$SLACK_BOT_TOKEN"; then
  echo "Set the SLACK_BOT_TOKEN secret."
  exit 1
fi


if test -z "$GITHUB_BODY"; then
  echo "Set the SLACK_BOT_TOKEN secret."
  exit 1
fi

curl -X POST \
     -H "Content-type: application/json" \
     -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
     -d "{}" \
     https://slack.com/api/chat.postMessage
