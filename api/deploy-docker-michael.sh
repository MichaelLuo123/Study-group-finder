#!/bin/bash

# Windows-compatible Docker deployment script for backend to cloud VM
echo "Deploying backend with Docker to cloud VM..."

# Load environment variables from your home directory
source "/c/Users/Michael Luo/.env"

VM_IP=$CRAMR_DB_IP_ADDR       # e.g., 12.34.56.78
VM_USER="ubuntu"              # or your VM username
SSH_KEY_PATH="$CRAMR_SSH_KEY_PATH"

# Ensure the SSH key path is quoted
QUOTED_SSH_KEY_PATH="\"$SSH_KEY_PATH\""

# Copy project files to VM using scp (no rsync on Windows)
echo "Copying files to VM (using scp)..."
scp -r -i "$SSH_KEY_PATH" \
  -o StrictHostKeyChecking=no \
  $(find . -maxdepth 1 -not -name 'node_modules' -not -name '.git' -not -name '.' -exec echo {} \;) \
  $VM_USER@$VM_IP:~/backend/

# SSH into VM and set up Docker
echo "Setting up Docker on VM..."
ssh -i "$SSH_KEY_PATH" $VM_USER@$VM_IP << 'EOF'

set -e

cd ~/backend

# Install Docker if needed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo apt-get update
    sudo apt-get install -y apt-transport-https ca-certificates curl gnupg
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker.gpg
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu focal stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo usermod -aG docker $USER
else
    echo "Docker already installed."
fi

# Restart Docker and fix permissions
echo "Fixing Docker permissions..."
sudo systemctl restart docker
newgrp docker

# Install Docker Compose if needed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Write .env file
echo "CRAMR_DB_IP_ADDR=$CRAMR_DB_IP_ADDR" > .env
echo "CRAMR_DB_POSTGRES_PASSWORD=$CRAMR_DB_POSTGRES_PASSWORD" >> .env

# Start the Docker container
sudo docker-compose down || true
sudo docker-compose build --no-cache
sudo docker-compose up -d

EOF
