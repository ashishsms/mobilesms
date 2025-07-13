#!/bin/bash

sleep 10

echo "Configuring Jasmin..."

# Add user
/usr/bin/jcli -x "user -a --uid=myuser --username=myuser --password=mypass --mt_messaging_cred authorization:bind,send --mt_messaging_cred http_send=True"

# Add connector
/usr/bin/jcli -x "smppccm -a --cid=myuser --username=myuser --password=mypass --host=jasmin --port=2775 --bind=transceiver"

# Start connector
/usr/bin/jcli -x "smppccm -s myuser"

# Add route
/usr/bin/jcli -x "mtrouter -a --type=DefaultRoute --connector=smppp(myuser) --rate=0"

/usr/bin/jcli -x "persist"

echo "✅ Jasmin configuration complete."
