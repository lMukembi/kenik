sudo chmod +x /opt/server/get_mac_loop.sh


nohup /opt/server/get_mac_loop.sh > /dev/null 2>&1 &


# ps aux | grep get_mac_loop.sh


# pkill -f get_mac_loop.sh