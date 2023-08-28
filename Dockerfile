FROM node:18.16.0-slim as base

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

ARG PORT=3000
ENV PORT $PORT

EXPOSE $PORT

# 의존성 이미지가 시작될 때까지 기다리기 위한 유틸리티(즉, MongoDB가 준비가 되면 NestJS 애플리케이션이 시작한다.)
COPY --from=ghcr.io/ufoscout/docker-compose-wait:latest /wait /wait

RUN npm i npm@9.5.1 -g

USER node

WORKDIR /opt/node_app

COPY --chown=node:node package*.json ./

RUN npm ci && npm cache clean --force

ENV PATH /opt/node_app/node_modules/.bin:$PATH


FROM base as dev

ENV NODE_ENV=development

USER node

WORKDIR /opt/node_app

RUN npm install

WORKDIR /opt/node_app/app

CMD ["npm", "run", "start:dev"]


FROM base as source

USER node

WORKDIR /opt/node_app/app

COPY --chown=node:node . .


FROM source as test

ENV NODE_ENV=development

USER node

COPY --from=dev /opt/node_app/node_modules /opt/node_app/node_modules

CMD ["npm", "run", "test"] 


FROM source as prod

USER node

HEALTHCHECK --interval=30s CMD node /opt/node_app/app/dist/healthcheck.js

WORKDIR /opt/node_app/app

RUN npm run build

CMD ["node", "dist/src/main"]