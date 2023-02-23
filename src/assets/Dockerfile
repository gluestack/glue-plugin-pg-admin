FROM dpage/pgadmin4

# Expose the pgAdmin 4 web interface port
EXPOSE 80

# Run the pgAdmin 4 web interface on container startup
CMD ["/usr/local/bin/python", "/usr/local/bin/pgadmin4", "--servers", "1", "--log-file", "-", "--config-file", "/pgadmin4/config_local.py"]
