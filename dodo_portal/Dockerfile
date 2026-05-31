# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install dependencies
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve stage
FROM nginx:stable-alpine

# Copy built static files to nginx serving path
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
