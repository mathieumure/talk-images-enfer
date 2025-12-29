FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm@8

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy application files
COPY . .

# Build Strapi admin panel
ENV NODE_ENV=production
RUN pnpm build

# Expose Strapi port
EXPOSE 1337

# Start Strapi
CMD ["pnpm", "start"]
