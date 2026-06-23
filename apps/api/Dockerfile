FROM node:20-slim

# Prisma's query engine binary requires OpenSSL to be present on the system.
# Alpine's musl libc + OpenSSL 3.x is incompatible with Prisma's prebuilt engine
# (which expects libssl.so.1.1) — using Debian-slim with glibc avoids this entirely.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files + prisma schema first.
# The "postinstall": "prisma generate" hook in package.json needs schema.prisma
# to exist BEFORE npm install runs — so it must be copied in this early layer,
# not as part of the later "COPY . ." that brings in the rest of the source.
COPY package*.json ./
COPY prisma ./prisma

RUN npm install

# Now copy the rest of the source code (src/, tsconfig.json, etc.)
COPY . .

# Compile TypeScript -> dist/
RUN npm run build

# Railway injects PORT at runtime; main.ts already reads process.env.PORT
EXPOSE 3001

CMD ["node", "dist/main.js"]
