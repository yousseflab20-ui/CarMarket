FROM node:22-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files and workspace config (if needed by pnpm)
# Since we are building from ./backend, we only need backend's package.json
# but pnpm might need to see the workspace structure if there are linked dependencies.
# However, for a simple backend, copying its own package.json is usually enough.
COPY package.json ./

# Install dependencies using pnpm
RUN pnpm install --prod

COPY . .

EXPOSE 5000

CMD ["pnpm", "start"]