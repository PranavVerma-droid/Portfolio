#!/bin/bash

# Determine which directory to use based on container hostname
if [[ $HOSTNAME == *"blogs"* ]]; then
    cd /var/www/html/blogs
else
    cd /var/www/html/main
fi

npm start
