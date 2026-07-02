FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_URL=http://localhost:3001/api/v1
ARG VITE_SUBMITTER_PORTAL_URL=http://localhost:5175
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SUBMITTER_PORTAL_URL=$VITE_SUBMITTER_PORTAL_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN mkdir -p /usr/share/nginx/html/assets-test

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
