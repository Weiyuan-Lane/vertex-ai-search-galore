# Stage 1: Build Stage
FROM node:22.10.0-alpine3.20 AS build

# Create and change to the app directory.
WORKDIR /opt/app

# Copy local code to the container image.
COPY . .

# Install dependencies and build the Angular app
RUN npm install -g @angular/cli@latest && \
    npm install && \
    ng build

# Stage 2: Production Stage
FROM node:22.10.0-alpine3.20

# Create and change to the app directory.
WORKDIR /opt/app/server

# Copy the built files from the build stage
COPY --from=build /opt/app/dist /opt/app/dist

# Copy the server code
COPY --from=build /opt/app/server /opt/app/server

# Install server dependencies
RUN npm install

# Run the web service on container startup.
CMD ["node", "server.js"]
