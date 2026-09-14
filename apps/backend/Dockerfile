# Multi-stage build — Docker context MUST be the monorepo root
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.base.json ./
COPY tsconfig.json ./
COPY nx.json ./
COPY jest.config.ts ./
COPY jest.preset.js ./
COPY tools/build-metadata.cjs ./tools/build-metadata.cjs
COPY libs/ ./libs/
COPY apps/backend/ ./apps/backend/
RUN npm i && npm cache clean --force
ENV NX_CLOUD_NO_ACCESS=true
ENV NX_SKIP_CLOUD_CACHE=true
ENV NX_CLOUD_DISTRIBUTED_EXECUTION=false
RUN npx nx build @bloomstore/backend --configuration=production --no-cloud

FROM node:20-alpine AS runtime
RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
WORKDIR /app
COPY --from=builder --chown=nestjs:nodejs /app/dist/apps/backend ./
COPY --from=builder --chown=nestjs:nodejs /app/docs ./docs
USER nestjs
EXPOSE 3030
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "const http=require('http');const port=process.env.PORT||3030;http.get({host:'localhost',port,path:'/api/health'},(res)=>process.exit(res.statusCode===200?0:1)).on('error',()=>process.exit(1))"
ENTRYPOINT ["dumb-init", "--"]
ENV NODE_ENV=production
ENV PORT=3030
CMD ["node", "main.js"]
