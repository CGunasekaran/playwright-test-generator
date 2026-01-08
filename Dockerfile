# Use official Playwright image which includes all browsers
FROM mcr.microsoft.com/playwright:v1.49.0-jammy

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port
EXPOSE 3000

# Set environment variable
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
