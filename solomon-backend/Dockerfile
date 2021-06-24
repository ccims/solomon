FROM node:14.16.1-alpine

ENV http_proxy http://gateway.zscloud.net:10402
ENV https_proxy http://gateway.zscloud.net:10402


WORKDIR /app/

COPY ./package.json .
COPY ./tsconfig.build.json .
COPY ./tsconfig.json .

COPY ./config ./config

# vector root certificate needs to be installed to allow connection to git
RUN apk add ca-certificates
ADD ./config/certificate/vec-cert.crt /usr/local/share/ca-certificates/
USER root
RUN update-ca-certificates

# git is needed to install solomon-models from git repository
RUN apk add git

# needed to make sure the latest models are used
RUN npm install https://github.com/ccims/solomon-models

# install all other dependencies
RUN npm install

COPY ./src ./src

RUN npm run build

EXPOSE 443

CMD ["node", "dist/main"]