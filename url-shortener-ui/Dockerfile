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
EXPOSE 80/tcp

ENV PORT=80

# Start server
CMD ["npm", "start"]

