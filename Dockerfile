# Timeweb Apps: статика монорепо (volgograd-kottedzh/, tau-altay-cheremshanka/, …).
FROM nginx:1.27-alpine

COPY deploy/timeweb/nginx-melissa.conf /etc/nginx/conf.d/default.conf
# Меняется при каждом выкладочном push — сбивает кэш Docker COPY ниже.
COPY deploy/timeweb/BUILD_STAMP /tmp/BUILD_STAMP
COPY . /usr/share/nginx/html

EXPOSE 8080