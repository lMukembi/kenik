sudo chmod +x /opt/server/send_mac_loop.sh


nohup /opt/server/send_mac_loop.sh > /dev/null 2>&1 &



# ps aux | grep send_mac_loop.sh


# pkill -f send_mac_loop.sh