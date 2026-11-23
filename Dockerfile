# Timeweb App Platform: тип «Dockerfile», порт 8080 (документация Timeweb).
FROM nginx:1.27-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY deploy/timeweb/nginx-melissa.conf /etc/nginx/conf.d/default.conf
COPY deploy/timeweb/BUILD_STAMP /tmp/BUILD_STAMP
COPY . /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]