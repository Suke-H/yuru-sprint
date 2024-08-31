# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the application dependencies
RUN npm install --production

# Copy the rest of the application code to the container
COPY src/ ./src

# Expose the port the app runs on
EXPOSE 8080

# Define environment variable for production
ENV NODE_ENV=production

# Run the application
CMD ["node", "src/server.js"]
