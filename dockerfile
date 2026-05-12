# Cambia node:18-alpine por node:20-alpine
FROM node:20-alpine

WORKDIR /app

# El resto del archivo se queda igual
COPY package*.json ./
RUN npm install
COPY . .

# Esto es muy importante para Next.js 15+ en Docker
ENV HOSTNAME "0.0.0.0"

EXPOSE 3000
CMD ["npm", "run", "dev"]