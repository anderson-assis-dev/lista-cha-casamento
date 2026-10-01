FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile
FROM deps AS frontend-build
COPY frontend ./frontend
WORKDIR /app/frontend
RUN pnpm run build
FROM deps AS backend-build
COPY backend ./backend
WORKDIR /app/backend
RUN pnpm exec prisma generate && pnpm run build
FROM node:22-alpine
WORKDIR /app
RUN corepack enable
ENV NODE_ENV=production
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json ./backend/
RUN pnpm install --filter backend... --prod --frozen-lockfile
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=backend-build /app/backend/prisma ./backend/prisma
COPY --from=backend-build /app/node_modules/.pnpm /app/node_modules/.pnpm
COPY --from=backend-build /app/node_modules/@prisma /app/node_modules/@prisma
RUN mkdir -p /app/backend/data
WORKDIR /app/backend
EXPOSE 3001
CMD ["sh","-c","pnpm exec prisma migrate deploy && node dist/server.js"]
