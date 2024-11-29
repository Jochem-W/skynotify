# Set-up build image
FROM node:22 AS builder
ENV NODE_ENV=production
WORKDIR /app
ARG PUBLIC_SUBSCRIPTION_LIMIT
ARG PUBLIC_FIREBASE_API_KEY
ARG PUBLIC_FIREBASE_AUTH_DOMAIN
ARG PUBLIC_FIREBASE_PROJECT_ID
ARG PUBLIC_FIREBASE_STORAGE_BUCKET
ARG PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG PUBLIC_FIREBASE_APP_ID
ARG PUBLIC_FIREBASE_MEASUREMENT_ID

ENV PUBLIC_SUBSCRIPTION_LIMIT=${PUBLIC_SUBSCRIPTION_LIMIT}
ENV PUBLIC_FIREBASE_API_KEY=${PUBLIC_FIREBASE_API_KEY}
ENV PUBLIC_FIREBASE_AUTH_DOMAIN=${PUBLIC_FIREBASE_AUTH_DOMAIN}
ENV PUBLIC_FIREBASE_PROJECT_ID=${PUBLIC_FIREBASE_PROJECT_ID}
ENV PUBLIC_FIREBASE_STORAGE_BUCKET=${PUBLIC_FIREBASE_STORAGE_BUCKET}
ENV PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${PUBLIC_FIREBASE_MESSAGING_SENDER_ID}
ENV PUBLIC_FIREBASE_APP_ID=${PUBLIC_FIREBASE_APP_ID}
ENV PUBLIC_FIREBASE_MEASUREMENT_ID=${PUBLIC_FIREBASE_MEASUREMENT_ID}

# Copy package.json, lockfile and .npmrc
COPY ["pnpm-lock.yaml", "package.json", "./"]

# Install build tools
RUN apt-get update && \
    apt-get install -y build-essential python3 && \
    rm -rf /var/lib/apt/lists/* && \
    npm install -g pnpm && \
    NODE_ENV=development pnpm install

# Copy all files to working directory
COPY . .

# Compile and remove dev packages
RUN pnpm build --experimental-build-mode compile && \
    pnpm prune --prod

# Set-up running image
FROM node:22
ENV NODE_ENV=production
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy all files
COPY --from=builder /app .

# Generate and run
CMD ["pnpm", "start:docker"]