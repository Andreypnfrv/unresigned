# syntax=docker/dockerfile:1.6
FROM node:24.13.0-bookworm

ENV IS_DOCKER=true \
    NODE_ENV=production \
    HOME=/usr/src/app \
    YARN_ENABLE_GLOBAL_CACHE=false \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1

RUN corepack enable

RUN apt-get update && apt-get install -y --no-install-recommends bsdmainutils \
  && rm -rf /var/lib/apt/lists/*

RUN curl -sSLo /usr/local/bin/transcrypt https://raw.githubusercontent.com/elasticdog/transcrypt/2f905dce485114fec10fb747443027c0f9119caa/transcrypt \
  && chmod +x /usr/local/bin/transcrypt

WORKDIR /usr/src/app

COPY . .

ARG HOCUSPOCUS_URL=""
ENV HOCUSPOCUS_URL=${HOCUSPOCUS_URL}

ENV ENV_NAME=prodUnresigned \
    FORUM_TYPE=Unresigned

RUN --mount=type=cache,target=/usr/src/app/.yarn/cache,id=unresigned-yarn-cache \
    yarn install \
  && rm -rf node_modules/@types/mapbox-gl node_modules/@types/simpl-schema \
    ckEditor/node_modules/@types/mapbox-gl ckEditor/node_modules/@types/simpl-schema \
  && yarn workspace @lesswrong/lesswrong-editor run build

RUN --mount=type=cache,target=/usr/src/app/.next/cache,id=unresigned-next-cache \
    yarn build \
  && chmod +x scripts/docker-entrypoint.sh

EXPOSE 8080
ENV PORT=8080
CMD ["scripts/docker-entrypoint.sh"]
