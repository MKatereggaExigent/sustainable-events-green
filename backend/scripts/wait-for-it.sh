#!/usr/bin/env bash
# wait-for-it.sh - Wait for a service to be available

set -e

TIMEOUT=60
QUIET=0
HOST=""
PORT=""

usage() {
  echo "Usage: $0 host:port [-t timeout] [-q] [-- command args]"
  echo "  -t TIMEOUT  Timeout in seconds (default: 60)"
  echo "  -q          Quiet mode"
  exit 1
}

wait_for() {
  if [ $QUIET -eq 0 ]; then
    echo "Waiting for $HOST:$PORT..."
  fi

  start_time=$(date +%s)
  
  while true; do
    if nc -z "$HOST" "$PORT" > /dev/null 2>&1; then
      if [ $QUIET -eq 0 ]; then
        echo "$HOST:$PORT is available"
      fi
      return 0
    fi

    current_time=$(date +%s)
    elapsed=$((current_time - start_time))

    if [ $elapsed -ge $TIMEOUT ]; then
      echo "Timeout waiting for $HOST:$PORT after ${TIMEOUT}s"
      return 1
    fi

    if [ $QUIET -eq 0 ]; then
      echo "Still waiting for $HOST:$PORT... ($elapsed/${TIMEOUT}s)"
    fi
    sleep 2
  done
}

# Parse arguments
while [ $# -gt 0 ]; do
  case "$1" in
    *:*)
      HOST=$(echo "$1" | cut -d: -f1)
      PORT=$(echo "$1" | cut -d: -f2)
      shift
      ;;
    -t)
      TIMEOUT="$2"
      shift 2
      ;;
    -q)
      QUIET=1
      shift
      ;;
    --)
      shift
      break
      ;;
    *)
      usage
      ;;
  esac
done

if [ -z "$HOST" ] || [ -z "$PORT" ]; then
  usage
fi

wait_for

# Execute command if provided
if [ $# -gt 0 ]; then
  exec "$@"
fi

