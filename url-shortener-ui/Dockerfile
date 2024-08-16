# Alpine node
FROM node:22-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build application
COPY . .
RUN npm run build

# Expose listener port
EXPOSE 3000/tcp

# Start server
CMD ["npm", "run", "start"]
