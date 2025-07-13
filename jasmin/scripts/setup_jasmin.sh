#!/bin/bash

# Wait until jCli is ready
echo "Waiting for Jasmin CLI..."
sleep 10  # Optional: give it some time to fully boot

# Check if user already exists
echo "Checking if user exists..."
jcli -e "user -l" | grep myuser
if [ $? -ne 0 ]; then
    echo "Creating new user..."

    jcli -e "user -a"
    jcli -e "uid myuser"
    jcli -e "gid MT_SMS"
    jcli -e "username myuser"
    jcli -e "password mypass"
    jcli -e "mt_messaging_cred quota balance 100000"
    jcli -e "mt_messaging_cred quota sms_count 1000"
    jcli -e "mt_messaging_cred authorization bind yes"
    jcli -e "mt_messaging_cred authorization submit_sm yes"
    jcli -e "mt_messaging_cred valuefilter dst_addr ^\+91[0-9]{10}$"
    jcli -e "ok"
else
    echo "User 'myuser' already exists."
fi
