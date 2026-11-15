# Stage 1: Build React SPA
FROM node:20-alpine AS build

WORKDIR /app

COPY hrm_frontend/package*.json ./
RUN npm install

COPY hrm_frontend ./
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY infrastructure/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
