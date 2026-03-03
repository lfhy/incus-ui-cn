FROM node:20-alpine AS build

WORKDIR /srv
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-concurrency 2

COPY . .
RUN yarn build

FROM node:20-alpine

WORKDIR /srv
RUN apk add --no-cache bash haproxy && npm install --global serve@14.2.4

COPY --from=build /srv/build /srv/build
COPY docker/docker-entrypoint.sh /srv/docker-entrypoint.sh
RUN chmod +x /srv/docker-entrypoint.sh

ENV FRONTEND_PORT=8080
ENV PUBLIC_PORT=80
ENV BACKEND_PORT=8443
ENV BACKEND_SSL_VERIFY=none

EXPOSE 80

ENTRYPOINT ["/srv/docker-entrypoint.sh"]
