#!/bin/bash

git pull
docker compose up -d --build
docker image prune -f
