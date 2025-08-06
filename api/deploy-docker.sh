#!/bin/bash

# Docker deployment script for backend to cloud VM
echo "Deploying backend with Docker to cloud VM..."

# Load environment variables from .my_env file
source ~/.my_env
VM_IP=$CRAMR_DB_IP_ADDR  # Use the environment variable
VM_USER="ubuntu"          # Replace with your VM username
SSH_KEY_PATH=$CRAMR_SSH_KEY_PATH  # SSH key path from environment

# Copy files to VM (excluding node_modules)
echo "Copying files to VM..."
rsync -avz --exclude 'node_modules' --exclude '.git' -e "ssh -i $SSH_KEY_PATH" . $VM_USER@$VM_IP:~/backend

# SSH into VM and deploy
echo "Deploying to VM..."
ssh -i $SSH_KEY_PATH $VM_USER@$VM_IP << EOF
cd ~/backend

# Create .env file for Docker with proper quoting
echo "CRAMR_DB_IP_ADDR=\"$CRAMR_DB_IP_ADDR\"" > .env
echo "CRAMR_DB_POSTGRES_PASSWORD=\"$CRAMR_DB_POSTGRES_PASSWORD\"" >> .env

# Debug: Show what was written to .env file
echo "Debug: Contents of .env file:"
cat .env

# Stop existing containers
echo "Stopping existing containers..."
sudo docker-compose down

# Build and start containers (with caching for speed)
echo "Building and starting containers..."
sudo docker-compose build
sudo docker-compose up -d

# Check status
echo "Checking container status..."
sudo docker-compose ps

echo "Deployment completed!"
EOF

 