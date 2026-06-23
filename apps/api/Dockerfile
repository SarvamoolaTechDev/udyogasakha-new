FROM node:20-alpine

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
