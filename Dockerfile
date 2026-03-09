# Build stage
FROM node:20-alpine AS build

# Install dependencies for canvas/build tools if needed (alpine specific)
# RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies strictly (CI standard)
RUN npm ci

# Copy source
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Use custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port (non-privileged)
EXPOSE 8080

# Security: Run as non-root user (Standard CIS benchmark)
# Nginx alpine image has a 'nginx' user, but we need to adjust permissions
RUN touch /var/run/nginx.pid && \
  chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

USER nginx

# Healthcheck for orchestration (CI/CD standard)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
