# Multi-stage: build the static SPA, then serve it with nginx (the production shape).
# For live-reload development use `npm run dev` instead.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
ARG VITE_API_BASE=http://localhost:8000
ARG BASE_PATH=
ENV VITE_API_BASE=$VITE_API_BASE
ENV BASE_PATH=$BASE_PATH
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
