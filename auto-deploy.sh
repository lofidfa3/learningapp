#!/bin/bash

# Automated Remote Deployment with Password
# Uses expect for automated password entry

SERVER_IP="82.165.174.146"
SERVER_USER="root"
SERVER_PASS="8jQrRVJs"
APP_DIR="/var/www/learningapp"

# Check if expect is installed
if ! command -v expect &> /dev/null; then
    echo "📦 Installing expect for automated deployment..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install expect || echo "Please install expect: brew install expect"
    else
        sudo apt-get install -y expect || sudo yum install -y expect
    fi
fi

echo "🚀 Starting automated deployment to $SERVER_IP..."

# Create expect script
cat > /tmp/deploy_expect.exp << EOF
#!/usr/bin/expect -f
set timeout 300
set server_ip "$SERVER_IP"
set server_user "$SERVER_USER"
set server_pass "$SERVER_PASS"
set app_dir "$APP_DIR"

# Test connection
spawn ssh -o StrictHostKeyChecking=no \$server_user@\$server_ip "echo 'Connected'"
expect {
    "password:" {
        send "\$server_pass\r"
        exp_continue
    }
    "Connected" {
        puts "✅ SSH connection successful"
    }
    timeout {
        puts "❌ Connection timeout"
        exit 1
    }
}
expect eof

# Create directory
spawn ssh \$server_user@\$server_ip "mkdir -p \$app_dir"
expect "password:"
send "\$server_pass\r"
expect eof

# Upload files (using rsync with expect)
spawn rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' --exclude '.env.local' --exclude '.env.production' ./ \$server_user@\$server_ip:\$app_dir/
expect {
    "password:" {
        send "\$server_pass\r"
        exp_continue
    }
    eof
}

# Run setup
spawn ssh \$server_user@\$server_ip "cd \$app_dir && chmod +x *.sh && ./setup-server.sh"
expect "password:"
send "\$server_pass\r"
expect eof

# Create env file
spawn ssh \$server_user@\$server_ip "cd \$app_dir && [ ! -f .env.production ] && cp env.production.template .env.production || true"
expect "password:"
send "\$server_pass\r"
expect eof

# Deploy
spawn ssh \$server_user@\$server_ip "cd \$app_dir && npm install && npm run build && sed -i 's|/path/to/learningapp|\$app_dir|g' ecosystem.config.js && pm2 start ecosystem.config.js || pm2 restart ecosystem.config.js && pm2 save"
expect {
    "password:" {
        send "\$server_pass\r"
        exp_continue
    }
    eof
}

puts "✅ Deployment complete!"
EOF

chmod +x /tmp/deploy_expect.exp
/tmp/deploy_expect.exp

echo ""
echo "✅ Deployment script executed!"
echo ""
echo "⚠️  IMPORTANT: Change your server password immediately!"
echo "   You shared it publicly - this is a security risk!"

