#!/bin/bash

# variables
NAMECONTAINER=$1
CONDITION_FOR_READY=$2
echo "[wait for docker] parameters [name-container: "$NAMECONTAINER "][condition-for-ready: "$CONDITION_FOR_READY"]"

RUNNING=false
while ! $RUNNING; do
  CONTAINERID=$(docker ps -qf "name="$NAMECONTAINER)
  echo "container-id: "$CONTAINERID
  COUNT=$(docker container logs $CONTAINERID | grep "$CONDITION_FOR_READY" | wc -l)
  if (($COUNT > 0)); then
    RUNNING=true
    echo "service $NAMECONTAINER is running"
  else
    echo "service $NAMECONTAINER not running yet, await for 10 seconds"
    sleep 10
  fi
done
