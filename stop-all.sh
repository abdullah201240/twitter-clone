#!/bin/bash

echo "Stopping Client..."
pkill -f "npm run dev"

echo "Stopping Server..."
pkill -f "npm run start"

echo "Stopping MySQL database..."
cd /Users/abdullahalsakib/Documents/my/webapp-test/db
docker-compose down

echo "Stopping Elasticsearch..."
cd /Users/abdullahalsakib/Documents/my/webapp-test/elasticsearch
docker-compose down

echo "All services stopped!"
