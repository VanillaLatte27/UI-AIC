# syntax=docker/dockerfile:1
ARG NEXT_PUBLIC_FLASK_BASE_URL

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Set build-time public env so it's embedded client-side
ENV NEXT_PUBLIC_FLASK_BASE_URL=$NEXT_PUBLIC_FLASK_BASE_URL
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Runtime envs (server-side route will read FLASK_API_URL)
ENV NEXT_PUBLIC_FLASK_BASE_URL=$NEXT_PUBLIC_FLASK_BASE_URL
ENV FLASK_API_URL=${FLASK_API_URL}

# Use Next standalone output if available, else fallback to full app
COPY --from=deps /app/.next ./.next
COPY --from=deps /app/public ./public
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
