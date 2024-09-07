# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set build-time argument (default is 'production')
ARG NODE_ENV=production

# Set the environment variable based on the build argument
ENV NODE_ENV=${NODE_ENV}

# Set the working directory in the container to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies based on the environment
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm install --production; \
    else \
      npm install; \
    fi

# Copy the rest of the application code to the container
COPY src/ ./src

# Expose the port the app runs on
EXPOSE 8080

# Run the application
CMD ["node", "src/server.js"]
