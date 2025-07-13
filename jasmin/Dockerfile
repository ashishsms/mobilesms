FROM jookies/jasmin:latest

# Install telnet (optional)
RUN apt-get update && apt-get install -y telnet net-tools


# Ensure jcli is accessible (already included in image, but create alias just in case)
RUN if [ ! -f /usr/local/bin/jcli ]; then \
      ln -s /usr/bin/jcli.py /usr/local/bin/jcli && \
      chmod +x /usr/local/bin/jcli; \
    fi

# Copy your startup/init script
COPY scripts/setup_jasmin.sh /usr/local/bin/setup_jasmin.sh
RUN chmod +x /usr/local/bin/setup_jasmin.sh

# Run Jasmin and your script on container start
CMD ["/bin/bash"]
