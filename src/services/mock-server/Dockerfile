FROM node:16-alpine

WORKDIR /app
COPY package.json /app/package.json
COPY ezmockserver.json /app/ezmockserver.json
COPY sessions /app/sessions

RUN npm install

EXPOSE 3050 3002

ENTRYPOINT ["/usr/local/bin/npm", "run", "mock-server"]