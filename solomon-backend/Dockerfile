FROM node:14.16.1-alpine

ENV http_proxy http://gateway.zscloud.net:10402
ENV https_proxy http://gateway.zscloud.net:10402

WORKDIR /app/

COPY ./package.json .
COPY ./tsconfig.build.json .
COPY ./tsconfig.json .

RUN npm install

COPY ./config ./config
COPY ./src ./src

RUN npm run build

EXPOSE 443

CMD ["node", "dist/main"]