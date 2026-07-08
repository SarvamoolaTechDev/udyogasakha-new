FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# NEXT_PUBLIC_API_URL must be passed at build time because Next.js
# bakes public env vars into the JS bundle during `next build`.
# Pass it via: docker build --build-arg NEXT_PUBLIC_API_URL=https://...
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]