#!/bin/bash

# Get the router's MAC address dynamically
ROUTER_MAC=$(ip link show ens5 | awk '/ether/ {print $2}')

# API URL
API_URL="http://51.21.152.165:8000/api/mac/credentials?mac_address=$ROUTER_MAC"

# Fetch reseller credentials from API
CREDENTIALS=$(curl -s $API_URL)

# Extract router details
RESELLER_ID=$(echo $CREDENTIALS | jq -r '.resellerID')
ROUTER_IP=$(echo $CREDENTIALS | jq -r '.ip')
USERNAME=$(echo $CREDENTIALS | jq -r '.username')
PASSWORD=$(echo $CREDENTIALS | jq -r '.password')
ROUTER_BRAND=$(echo $CREDENTIALS | jq -r '.brand')

# Ensure credentials were retrieved
if [ -z "$RESELLER_ID" ] || [ "$RESELLER_ID" == "null" ]; then
    echo "Failed to retrieve reseller credentials."
    exit 1
fi

echo "Using Reseller ID: $RESELLER_ID"
echo "Router IP: $ROUTER_IP"
echo "Router Brand: $ROUTER_BRAND"

# Fetch MAC addresses without using arp
if [ "$ROUTER_BRAND" == "Tenda" ]; then
    curl -s -X POST "http://$ROUTER_IP/login.cgi" -d "username=$USERNAME&password=$PASSWORD"
    curl -s "http://$ROUTER_IP/goform/getArpList" | jq -r '.data[] | "\(.ip) \(.mac)"' > /opt/server/mac_list.txt
fi

if [ "$ROUTER_BRAND" == "Tplink" ]; then
    curl -s --user "$USERNAME:$PASSWORD" "http://$ROUTER_IP/userRpm/ArpListRpm.htm" | grep -oE '([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}' > /o>
fi

echo "MAC addresses fetched successfully."