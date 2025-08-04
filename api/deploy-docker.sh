#!/bin/bash

# Docker deployment script for backend to cloud VM
echo "Deploying backend with Docker to cloud VM..."

# Load environment variables from .my_env file
source ~/.env
VM_IP=$CRAMR_DB_IP_ADDR  # Use the environment variable
VM_USER="ubuntu"          # Replace with your VM username
SSH_KEY_PATH=$CRAMR_SSH_KEY_PATH  # SSH key path from environment

# Copy files to VM (excluding node_modules)
echo "Copying files to VM..."
rsync -avz --exclude 'node_modules' --exclude '.git' -e "ssh -i $SSH_KEY_PATH" . $VM_USER@$VM_IP:~/backend

# SSH into VM and setup Docker
echo "Setting up Docker on VM..."
ssh -i $SSH_KEY_PATH $VM_USER@$VM_IP << EOF
cd ~/backend

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo apt-get update
    sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo usermod -aG docker $USER
    echo "Docker installed successfully"
else
    echo "Docker already installed"
fi

# Fix Docker permissions - add user to docker group and restart docker service
echo "Fixing Docker permissions..."
sudo usermod -aG docker $USER
sudo systemctl restart docker
newgrp docker

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose installed successfully"
else
    echo "Docker Compose already installed"
fi

# Create .env file for Docker
echo "CRAMR_DB_IP_ADDR=$CRAMR_DB_IP_ADDR" > .env
echo "CRAMR_DB_POSTGRES_PASSWORD=$CRAMR_DB_POSTGRES_PASSWORD" >> .env

# Build and run the Docker container
sudo docker-compose down 2>/dev/null || true
sudo docker-compose build --no-cache
sudo docker-compose up -d


EOF

 