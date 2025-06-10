#!/bin/bash
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
echo "Starting setup..."

# Enable SSM debug logging
echo "Enabling SSM debug logging..."
if [ -d "/etc/amazon/ssm/" ]; then
    echo "Creating SSM config..."
    echo '{"Profile":{"ShareCreds":true},"Mgs":{"Region":"us-east-1"},"Agent":{"Region":"us-east-1"}}' > /etc/amazon/ssm/amazon-ssm-agent.json
    echo "SSM config created"
fi

# Restart SSM agent with debug logging
echo "Configuring SSM agent logging..."
if [ -f "/etc/amazon/ssm/seelog.xml.template" ]; then
    cp -f /etc/amazon/ssm/seelog.xml.template /etc/amazon/ssm/seelog.xml
    sed -i 's/minlevel="info"/minlevel="debug"/g' /etc/amazon/ssm/seelog.xml
    echo "SSM logging configured"
fi

# Restart SSM agent
echo "Restarting SSM agent..."
systemctl restart amazon-ssm-agent
systemctl status amazon-ssm-agent

# Test connectivity to SSM endpoints
echo "Testing SSM endpoints..."
curl -v https://ssm.us-east-1.amazonaws.com
curl -v https://ssmmessages.us-east-1.amazonaws.com
curl -v https://ec2messages.us-east-1.amazonaws.com

# Check DNS resolution
echo "Testing DNS resolution..."
nslookup ssm.us-east-1.amazonaws.com
nslookup ssmmessages.us-east-1.amazonaws.com
nslookup ec2messages.us-east-1.amazonaws.com

# Check SSM agent logs
echo "SSM agent logs:"
tail -n 50 /var/log/amazon/ssm/amazon-ssm-agent.log 