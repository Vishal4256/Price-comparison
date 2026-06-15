FROM ghcr.io/puppeteer/puppeteer:latest

# Run as root temporarily to set up directories if needed
USER root

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci

# Bundle app source
COPY . .

# Ensure correct permissions for the pptruser
RUN chown -R pptruser:pptruser /app

# Switch back to the unprivileged user provided by the base image
USER pptruser

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]
