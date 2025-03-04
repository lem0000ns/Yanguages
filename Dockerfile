FROM node:23

WORKDIR /app

COPY package.json package.json

COPY package-lock.json package-lock.json

RUN npm install

COPY . .

RUN npx tsc

EXPOSE 8080

CMD ["node", "dist/server.js"]