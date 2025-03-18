#!/bin/bash

# Load environment variables (modify this path if needed)
source /opt/server/.env

# MongoDB Connection Details (Modify as needed)
MONGO_URI="mongodb://kenik:1919@127.0.0.1:27017/kenikwifi"
COLLECTION="resellers"

# VPS API Endpoint (Make sure to update this with your actual VPS API)
VPS_API_URL="http://$(curl -s ifconfig.me):8000/api/reseller"

# Function to fetch reseller details from MongoDB
get_reseller_credentials() {
    local reseller_data
    reseller_data=$(mongo "$MONGO_URI" --quiet --eval \
    'printjson(db.'"$COLLECTION"'.findOne({ active: true }, { _id: 1, ip: 1, username: 1, password: 1, brand: 1 }))')

    ROUTER_IP=$(echo "$reseller_data" | grep -oP '(?<="ip" : ")[^"]*')
    USERNAME=$(echo "$reseller_data" | grep -oP '(?<="username" : ")[^"]*')
    PASSWORD=$(echo "$reseller_data" | grep -oP '(?<="password" : ")[^"]*')
    ROUTER_BRAND=$(echo "$reseller_data" | grep -oP '(?<="brand" : ")[^"]*')
    RESELLER_ID=$(echo "$reseller_data" | grep -oP '(?<="resellerID" : ")[^"]*')

    # Use defaults if empty
    ROUTER_IP=${ROUTER_IP:-"192.168.0.1"}
    USERNAME=${USERNAME:-"admin"}
    PASSWORD=${PASSWORD:-"admin"}
    ROUTER_BRAND=${ROUTER_BRAND:-"Tenda"}
    RESELLER_ID=${RESELLER_ID:-"12345"}
}

# Function to retrieve MAC addresses dynamically
get_mac_addresses() {
    ip neigh show | awk '{print $1, $3}' > /opt/server/mac_table.txt
}

# Function to send MAC addresses to VPS
send_mac_addresses() {
    while read -r ip mac; do
        if [[ "$mac" != "FAILED" && -n "$mac" ]]; then
            curl -X POST "$VPS_API_URL" \
                -H "Content-Type: application/json" \
                -d "{\"ip\": \"$ip\", \"mac_address\": \"$mac\", \"resellerID\": \"$RESELLER_ID\"}"
        fi
    done < /opt/server/mac_table.txt
}

# Execute functions
get_reseller_credentials
get_mac_addresses
send_mac_addresses

echo "MAC addresses sent successfully!"