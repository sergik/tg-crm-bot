FROM node:lts as builder
WORKDIR /usr/src/app
COPY . .
RUN rm -rf node_modules
RUN NODE_ENV=production npm install
RUN npm run build
FROM node:lts as prod-stage
WORKDIR /nuxtapp
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

CMD [ "node", "dist/index.js" ]