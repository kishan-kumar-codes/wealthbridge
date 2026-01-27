#!/bin/bash

# Set variables
APP_NAME="WealthBridge"
MONGO_URI="mongodb://your_mongo_uri"
REACT_BUILD_DIR="client/build"
SERVER_DIR="server"
DEPLOY_DIR="/var/www/$APP_NAME"
NODE_ENV="production"

# Function to handle errors
handle_error() {
    echo "Error: $1"
    exit 1
}

# Step 1: Clone the repository
git clone https://github.com/yourusername/WealthBridge.git || handle_error "Failed to clone repository"

# Step 2: Navigate to the application directory
cd WealthBridge || handle_error "Directory WealthBridge not found"

# Step 3: Install server dependencies
cd $SERVER_DIR
npm install || handle_error "Failed to install server dependencies"

# Step 4: Build the React application
cd ../client
npm install || handle_error "Failed to install client dependencies"
npm run build || handle_error "Failed to build React application"

# Step 5: Move build files to server directory
mkdir -p $DEPLOY_DIR || handle_error "Failed to create deploy directory"
cp -r $REACT_BUILD_DIR/* $DEPLOY_DIR || handle_error "Failed to copy build files to deploy directory"

# Step 6: Set environment variables
export NODE_ENV=$NODE_ENV
export MONGO_URI=$MONGO_URI

# Step 7: Start the server
cd ../$SERVER_DIR
pm2 start server.js --name $APP_NAME || handle_error "Failed to start the server"

# Step 8: Clean up
cd ../../
rm -rf WealthBridge || handle_error "Failed to clean up temporary files"

echo "Deployment of $APP_NAME completed successfully."