#!/bin/bash

echo "Starting Elasticsearch..."
cd /Users/abdullahalsakib/Documents/my/webapp-test/elasticsearch
docker-compose up -d

echo "Waiting for Elasticsearch to start..."
sleep 30

echo "Starting MySQL database..."
cd /Users/abdullahalsakib/Documents/my/webapp-test/db
docker-compose up -d

echo "Waiting for MySQL to start..."
sleep 30

echo "Starting Server..."
cd /Users/abdullahalsakib/Documents/my/webapp-test/server
npm run start &

echo "Starting Client..."
cd /Users/abdullahalsakib/Documents/my/webapp-test/src
npm run dev &

echo "All services started!"
echo "Access the application at http://localhost:5173"
echo "Server API at http://localhost:3001"
