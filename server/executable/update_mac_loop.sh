sudo chmod +x /opt/server/update_mac_loop.sh


nohup /opt/server/update_mac_loop.sh > /dev/null 2>&1 &


# ps aux | grep update_mac_loop.sh


# pkill -f update_mac_loop.sh


