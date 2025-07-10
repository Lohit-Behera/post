FROM node:20

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Install nodemon globally for hot reload
RUN npm install -g nodemon

EXPOSE 8000

CMD ["nodemon", "-r", "dotenv/config", "--legacy-watch", "src/index.ts"]