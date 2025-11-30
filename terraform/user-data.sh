#!/bin/bash
set -e

# Log everything
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "Starting EC2 initialization..."

# Update system
apt-get update
apt-get upgrade -y

# Install Docker
echo "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu

# Install Docker Compose
echo "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create app directory
mkdir -p /home/ubuntu/app
chown -R ubuntu:ubuntu /home/ubuntu/app

# Create environment file
cat > /home/ubuntu/app/.env <<EOF
AWS_REGION=${aws_region}
AWS_ACCESS_KEY_ID=${aws_access_key}
AWS_SECRET_ACCESS_KEY=${aws_secret_key}
NODE_ENV=production
PORT=3001
EOF

chown ubuntu:ubuntu /home/ubuntu/app/.env
chmod 600 /home/ubuntu/app/.env

echo "EC2 initialization complete!"
