# Use the official lightweight Node.js 18 image.
# https://hub.docker.com/_/node
FROM node:21.7.3-alpine3.19

# Create and change to the app directory.
WORKDIR /usr/src/app/server

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json /usr/src/app/
COPY server/package*.json /usr/src/app/server/

# Install dependencies.
# If you add a package-lock.json speed your build by switching to 'npm ci'.
# RUN npm ci --only=production
RUN cd /usr/src/app &&\
    npm install -g @angular/cli@latest &&\
    npm install &&\
    cd /usr/src/app/server &&\
    npm install

# Copy local code to the container image.
COPY . /usr/src/app/

# Build asset for angular app
RUN cd /usr/src/app &&\
    ng build

# Run the web service on container startup.
CMD ["node", "server.js"]