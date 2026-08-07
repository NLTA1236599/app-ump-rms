FROM node:20-alpine AS build
WORKDIR /app

# Relative URL so the browser calls same host; nginx proxies /api to the backend.
ARG VITE_API_URL=/api/v1
ARG VITE_SUBMITTER_PORTAL_URL=http://localhost:5175
ARG VITE_ADMIN_APP_URL=/admin/
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SUBMITTER_PORTAL_URL=$VITE_SUBMITTER_PORTAL_URL
ENV VITE_ADMIN_APP_URL=$VITE_ADMIN_APP_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN mkdir -p /usr/share/nginx/html/assets-test \
  && if [ -f /usr/share/nginx/html/ump-seal.png ] && [ ! -f /usr/share/nginx/html/logo.png ]; then \
       cp /usr/share/nginx/html/ump-seal.png /usr/share/nginx/html/logo.png; \
     fi

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
