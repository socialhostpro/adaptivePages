# Multi-stage build
FROM node:20 as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_GEMINI_API_KEY
ARG VITE_ENV=production
ARG VITE_DEBUG=false

# Set environment variables
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_ENV=$VITE_ENV
ENV VITE_DEBUG=$VITE_DEBUG

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built React app from builder stage
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
