# syntax=docker/dockerfile:1
ARG NODE_VERSION=24-alpine

################################################################################
# Base
FROM node:${NODE_VERSION} AS base
WORKDIR /usr/src/app

################################################################################
# Production dependencies only (cached independently of source changes)
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --ignore-scripts

################################################################################
# Build (all dependencies)
FROM base AS build
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
RUN npm run build

################################################################################
# Final runtime image
FROM base AS final

ENV NODE_ENV=production \
    PORT=8080

# tini as PID 1 so SIGTERM from Kubernetes is forwarded and zombies are reaped
RUN apk add --no-cache tini

COPY --from=prod-deps --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=build     --chown=node:node /usr/src/app/build ./build
COPY --chown=node:node package.json ./

# Numeric UID so Kubernetes `runAsNonRoot: true` can verify it
USER 1000:1000

EXPOSE 8080

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "build"]