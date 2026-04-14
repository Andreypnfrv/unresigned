# Keep in sync with package.json engines.node
FROM node:24.13.0-bookworm
ENV IS_DOCKER=true
RUN corepack enable
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# Transcrypt dependency
RUN apt-get update && apt-get install -y bsdmainutils
# Install transcrypt for EA Forum
RUN curl -sSLo /usr/local/bin/transcrypt https://raw.githubusercontent.com/elasticdog/transcrypt/2f905dce485114fec10fb747443027c0f9119caa/transcrypt && chmod +x /usr/local/bin/transcrypt
WORKDIR /usr/src/app
ENV HOME=/usr/src/app
ENV YARN_ENABLE_GLOBAL_CACHE=false
# Copy only files necessary for yarn install, to avoid spurious changes
# triggering re-install
COPY package.json package.json
COPY yarn.lock yarn.lock
COPY .yarnrc.yml .yarnrc.yml
COPY ckEditor ckEditor
COPY eslint-plugin-local eslint-plugin-local
COPY scripts/postinstall.sh scripts/postinstall.sh
# clear the cache -- it's not useful and it adds to the time docker takes to
# save the layer diff
RUN yarn install && yarn cache clean
COPY . .
RUN yarn install && yarn cache clean \
  && rm -rf node_modules/@types/mapbox-gl node_modules/@types/simpl-schema \
    ckEditor/node_modules/@types/mapbox-gl ckEditor/node_modules/@types/simpl-schema \
  && yarn workspace @lesswrong/lesswrong-editor run build \
  && yarn build
EXPOSE 8080
ENV PORT=8080
CMD ["sh", "-c", "exec yarn next start -H 0.0.0.0 -p ${PORT}"]
