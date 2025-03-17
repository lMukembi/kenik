#!/bin/bash

# Fetch reseller details and MACs dynamically from MongoDB
mongo --quiet --eval '
    db = db.getSiblingDB("kenikwifi");

    db.resellers.find().forEach(function(reseller) {
        print(reseller.resellerID + "|" + reseller.ip + "|" + reseller.username + "|" + reseller.password + "|" + reseller.brand);
    });
' | while IFS="|" read -r RESELLER_ID ROUTER_IP USERNAME PASSWORD ROUTER_BRAND; do
    
    echo "Processing Reseller: $RESELLER_ID, Router: $ROUTER_IP ($ROUTER_BRAND)"

    # Fetch MACs associated with this reseller
    mongo --quiet --eval '
        db = db.getSiblingDB("kenikwifi");
        db.packages.find({status: "paid", resellerID: "'"$RESELLER_ID"'" }).forEach(function(doc) {
            print(doc.mac_address);
        });
    ' | while read MAC; do
        echo "Allowing MAC: $MAC for Reseller: $RESELLER_ID"

        # Choose the correct API based on the router brand
        if [[ "$ROUTER_BRAND" == "Tenda" ]]; then
            echo "Updating MAC on Tenda router..."
            curl -u "$USERNAME:$PASSWORD" -X POST "http://$ROUTER_IP/goform/setMacFilter" -d "mac=$MAC&enable=1"

        elif [[ "$ROUTER_BRAND" == "Tplink" ]]; then
            echo "Updating MAC on TP-Link router..."
            curl -u "$USERNAME:$PASSWORD" -X POST "http://$ROUTER_IP/cgi-bin/luci/api/macfilt" -d "mac=$MAC&action=add"
            else
            echo "Unknown router brand: $ROUTER_BRAND. Skipping..."
        fi
    done

done