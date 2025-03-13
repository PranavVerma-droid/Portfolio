#    Copyright (C) 2024  Pranav Verma

#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.

#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.

#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.

#    See a more apt description in LICENSE File Attached to the root of this
#    project.

FROM node:latest
WORKDIR /var/www/html

# Copy package.json files first for better caching
COPY ./main/package.json ./main/
COPY ./blogs/package.json ./blogs/

# Install dependencies
WORKDIR /var/www/html/main
RUN npm install
WORKDIR /var/www/html/blogs
RUN npm install

# Copy the rest of the application
COPY ./main ./main
COPY ./blogs ./blogs

EXPOSE 8080

# Use the start script
COPY ./start.sh /
RUN chmod +x /start.sh
CMD ["/start.sh"]