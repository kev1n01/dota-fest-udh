# Etapa de build: genera el sitio estático en /app/dist
FROM node:20-alpine AS build

WORKDIR /app

# Instalar dependencias a partir del lockfile
COPY package*.json ./
RUN npm ci

# Copiar el código fuente y construir
COPY . .
RUN npm run build

# Etapa final: servir los archivos estáticos con nginx
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Mismo puerto que antes
EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]
