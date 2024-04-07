FROM node:latest
WORKDIR /var/www/html
COPY . .
RUN npm install
EXPOSE 8080
CMD ["npm", "start"]