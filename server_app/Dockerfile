# Build stage
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install production dependencies; allow legacy peer deps to avoid cloudinary/multer-storage conflict
RUN npm install --production --legacy-peer-deps

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]