# Use the official Node.js image as the base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /var/www/html

# Copy all files from the current directory to the working directory
COPY . .

# Install all Node.js packages from package.json
RUN npm install

# Install http-server to serve your application
RUN npm install --global http-server

# Expose port 8080 for http-server
EXPOSE 8080

# Start http-server in the "main" directory
CMD ["http-server", "main/"]