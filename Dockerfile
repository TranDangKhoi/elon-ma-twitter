FROM node:20-alpine3.16

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json . 
COPY .env .
COPY ./src ./src

RUN apk add python3
RUN npm install
RUN npm run build

EXPOSE 8080

CMD [ "npm", "run", "start" ]