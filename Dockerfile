# Install dependencies only when needed
FROM node:alpine AS builder
WORKDIR /app
COPY . .
RUN yarn install --immutable
RUN yarn build

# Production image, copy all the files and run next
# TODO Less files
FROM node:alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app .

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app/.next
USER nextjs

EXPOSE 3000


CMD ["yarn", "run", "start"]