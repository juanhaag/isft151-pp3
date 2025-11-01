#!/bin/bash

# Set title
echo "======================================"
echo "  Starting OlasPP Backend          "
echo "======================================"

# Function to clean up background processes on exit
cleanup() {
    echo "\n-> Shutting down backend services..."
    # Kill the docker container
    (cd backend && docker-compose -f ../docker-compose.vectordb.yml down)
    echo "   Backend services stopped. Exiting."
}

# Trap script exit (e.g., Ctrl+C)
trap cleanup EXIT

# Start backend server
echo "-> Starting Backend setup and server..."
(cd backend && echo 's' | npm run setup)
