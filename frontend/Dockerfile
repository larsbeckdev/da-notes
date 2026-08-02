FROM node:22-alpine

WORKDIR /app

# Copy manifests first so the install layer is cached across source edits.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 4200

# --host 0.0.0.0 makes the dev server reachable from outside the container.
# --poll keeps file watching reliable on bind-mounted Windows volumes.
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "2000"]
