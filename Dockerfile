FROM node:18-slim as build

EXPOSE 3000

WORKDIR /app

COPY package.json package-lock.json ./ 

RUN npm install

COPY . ./

CMD [ "npm", "run", "start" ]