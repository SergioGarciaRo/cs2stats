FROM node:18-bullseye
WORKDIR /app
COPY package.json package-lock.json* ./
RUN apt-get update && apt-get install -y python3 build-essential libc6-dev
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm","start"]
