#!/bin/bash

# Docker deployment script for backend to cloud VM
echo "Deploying backend with Docker to cloud VM..."

# Load environment variables from .env file in your Windows home directory
ENV_PATH="/c/Users/Michael Luo/.env"
if [[ ! -f "$ENV_PATH" ]]; then
  echo "Error: Environment file not found at $ENV_PATH"
  exit 1
fi
source "$ENV_PATH"

# Variables from .env
VM_IP="$CRAMR_DB_IP_ADDR"           # Cloud VM IP
VM_USER="ubuntu"                    # VM username
SSH_KEY_PATH="$CRAMR_SSH_KEY_PATH"  # SSH key path from .env

# Quote SSH key path in case it has spaces
QUOTED_KEY_PATH="\"$SSH_KEY_PATH\""

# Copy files to VM (excluding node_modules and .git)
echo "Copying files to VM..."
rsync -avz --exclude 'node_modules' --exclude '.git' \
  -e "ssh -i \"$SSH_KEY_PATH\"" . "$VM_USER@$VM_IP:~/backend"

# SSH into VM and deploy
echo "Deploying to VM..."
ssh -i "$SSH_KEY_PATH" "$VM_USER@$VM_IP" << EOF
cd ~/backend

# Create .env file for Docker
echo "CRAMR_DB_IP_ADDR=\"$CRAMR_DB_IP_ADDR\"" > .env
echo "CRAMR_DB_POSTGRES_PASSWORD=\"$CRAMR_DB_POSTGRES_PASSWORD\"" >> .env

# Debug: Show what was written to .env file
echo "Debug: Contents of .env file:"
cat .env

# Stop existing containers
echo "Stopping existing containers..."
sudo docker-compose down

# Build and start containers
echo "Building and starting containers..."
sudo docker-compose build
sudo docker-compose up -d

# Check status
echo "Checking container status..."
sudo docker-compose ps

echo "Deployment completed!"
EOF
