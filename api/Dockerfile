FROM node:20.4.0-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install pm2 -g
COPY . .
EXPOSE 443
ENV PORT 443
CMD ["pm2-runtime", "src/index.js"]