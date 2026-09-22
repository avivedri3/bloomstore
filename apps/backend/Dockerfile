# Multi-stage build. Render (and local docker build) must use the monorepo root
# as the context: docker build -f apps/backend/Dockerfile .
FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json tsconfig.json eslint.config.mjs ./
COPY jest.config.ts jest.preset.js ./
COPY tools/build-metadata.cjs ./tools/build-metadata.cjs
COPY libs/ ./libs/
COPY apps/backend/ ./apps/backend/

RUN npm ci --no-audit --no-fund && npm cache clean --force

ENV NX_DAEMON=false
ENV NX_CLOUD_NO_ACCESS=true
ENV NX_SKIP_CLOUD_CACHE=true
ENV NX_CLOUD_DISTRIBUTED_EXECUTION=false
RUN npx nx build @bloomstore/backend --configuration=production --no-cloud

FROM node:24-alpine AS runtime
RUN apk add --no-cache dumb-init \
  && addgroup -g 1001 -S nodejs \
  && adduser -S nestjs -u 1001

WORKDIR /app
# Nx emits a production package.json (node_modules stay external). Install it here.
COPY --from=builder /app/dist/apps/backend ./
COPY docs/project-book.md ./docs/project-book.md
COPY apps/backend/README.md ./apps/backend/README.md
# Webpack leaves @bloomstore/shared-types external. Install the Nx build output,
# not the npm registry (it is a private workspace package).
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force
COPY --from=builder --chown=nestjs:nodejs /app/dist/libs/shared-types ./node_modules/@bloomstore/shared-types
RUN chown -R nestjs:nodejs /app

USER nestjs
EXPOSE 3030
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "const http=require('http');const port=process.env.PORT||3030;http.get({host:'127.0.0.1',port,path:'/api/health'},(res)=>process.exit(res.statusCode===200?0:1)).on('error',()=>process.exit(1))"
ENTRYPOINT ["dumb-init", "--"]
ENV NODE_ENV=production
CMD ["node", "main.js"]
